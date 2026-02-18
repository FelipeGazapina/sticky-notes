import Store from "electron-store";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { app } from "electron";

const schema = {
  notes: {
    type: "object",
    default: {},
  },
  timers: {
    type: "object",
    default: {},
  },
  settings: {
    type: "object",
    properties: {
      theme: {
        type: "string",
        enum: ["light", "dark", "system"],
        default: "system",
      },
      listWindowBounds: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
        },
      },
    },
    default: {
      theme: "system",
    },
  },
};

const STORE_FILE_NAME = "config.json";
const STORE_NAME = "config";
const STORE_PATH_SEGMENTS = ["FelipeGazapina", "sticky-notes-data"];

let storeInstance = null;

function createStore(cwd) {
  return new Store({
    schema,
    cwd,
    name: STORE_NAME,
  });
}

function getPersistentStoreDir() {
  return path.join(app.getPath("appData"), ...STORE_PATH_SEGMENTS);
}

function getLegacyStoreDirs(targetDir) {
  const dirs = new Set();
  dirs.add(app.getPath("userData"));

  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    dirs.add(path.join(process.env.PORTABLE_EXECUTABLE_DIR, "data"));
  }

  dirs.delete(targetDir);
  return [...dirs];
}

function hasData(data) {
  const notesCount = Object.keys(data?.notes ?? {}).length;
  const timersCount = Object.keys(data?.timers ?? {}).length;
  const hasWindowBounds = Boolean(data?.settings?.listWindowBounds);
  const hasCustomTheme =
    data?.settings?.theme && data.settings.theme !== "system";

  return notesCount > 0 || timersCount > 0 || hasWindowBounds || hasCustomTheme;
}

function migrateLegacyDataIfNeeded(store, targetDir) {
  if (hasData(store.store)) return;

  const legacyDirs = getLegacyStoreDirs(targetDir);

  for (const legacyDir of legacyDirs) {
    const legacyFile = path.join(legacyDir, STORE_FILE_NAME);
    if (!fs.existsSync(legacyFile)) continue;

    try {
      const legacyStore = createStore(legacyDir);
      if (!hasData(legacyStore.store)) continue;

      store.store = legacyStore.store;
      console.log(`[Store] Data migrated from ${legacyFile}`);
      return;
    } catch (error) {
      console.error(
        `[Store] Failed to migrate legacy data from ${legacyFile}:`,
        error,
      );
    }
  }
}

function getStore() {
  if (!storeInstance) {
    const targetDir = getPersistentStoreDir();
    storeInstance = createStore(targetDir);
    migrateLegacyDataIfNeeded(storeInstance, targetDir);
  }

  return storeInstance;
}

export function getAllNotes() {
  const store = getStore();
  const notes = store.get("notes", {});
  return Object.values(notes).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
}

export function getNote(id) {
  const store = getStore();
  return store.get(`notes.${id}`, null);
}

export function createNote() {
  const store = getStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const note = {
    id,
    title: "",
    content: [],
    plainText: "",
    color: "yellow",
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    windowBounds: { width: 300, height: 350 },
  };
  store.set(`notes.${id}`, note);
  return note;
}

export function updateNote(id, data) {
  const store = getStore();
  const note = store.get(`notes.${id}`);
  if (!note) return null;

  const updated = {
    ...note,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  if (data.content && Array.isArray(data.content)) {
    const text = data.plainText || "";
    const firstLine = text.split("\n").find((line) => line.trim() !== "") || "";
    updated.title = firstLine.substring(0, 50);
    updated.plainText = text;
  }

  store.set(`notes.${id}`, updated);
  return updated;
}

export function deleteNote(id) {
  const store = getStore();
  store.delete(`notes.${id}`);
}

// ---- Timers CRUD ----

export function getAllTimers() {
  const store = getStore();
  const timers = store.get("timers", {});
  return Object.values(timers).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export function getTimer(id) {
  const store = getStore();
  return store.get(`timers.${id}`, null);
}

export function createTimer(data) {
  const store = getStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const timer = {
    id,
    type: data.type || "simple",
    label: data.label || "",
    durationMs: data.durationMs || 0,
    workMs: data.workMs || 1500000,
    breakMs: data.breakMs || 300000,
    rounds: data.rounds || 4,
    currentRound: 1,
    phase: "work",
    status: "planned",
    remainingMs:
      data.type === "pomodoro" ? data.workMs || 1500000 : data.durationMs || 0,
    startedAt: null,
    createdAt: now,
    completedAt: null,
    audioAlert: data.audioAlert !== undefined ? data.audioAlert : true,
    desktopNotification:
      data.desktopNotification !== undefined ? data.desktopNotification : true,
  };
  store.set(`timers.${id}`, timer);
  return timer;
}

export function updateTimer(id, data) {
  const store = getStore();
  const timer = store.get(`timers.${id}`);
  if (!timer) return null;
  const updated = { ...timer, ...data, id };
  store.set(`timers.${id}`, updated);
  return updated;
}

export function deleteTimer(id) {
  const store = getStore();
  store.delete(`timers.${id}`);
}

// ---- Settings ----

export function getSettings() {
  const store = getStore();
  return store.get("settings", { theme: "system" });
}

export function updateSettings(data) {
  const store = getStore();
  const settings = store.get("settings", {});
  store.set("settings", { ...settings, ...data });
}
