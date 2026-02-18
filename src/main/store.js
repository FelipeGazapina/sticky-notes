import Store from 'electron-store';
import crypto from 'crypto';

const schema = {
  notes: {
    type: 'object',
    default: {}
  },
  timers: {
    type: 'object',
    default: {}
  },
  settings: {
    type: 'object',
    properties: {
      theme: { type: 'string', enum: ['light', 'dark', 'system'], default: 'system' },
      listWindowBounds: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' }
        }
      }
    },
    default: {
      theme: 'system'
    }
  }
};

const store = new Store({ schema });

export function getAllNotes() {
  const notes = store.get('notes', {});
  return Object.values(notes).sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

export function getNote(id) {
  return store.get(`notes.${id}`, null);
}

export function createNote() {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const note = {
    id,
    title: '',
    content: [],
    plainText: '',
    color: 'yellow',
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    windowBounds: { width: 300, height: 350 }
  };
  store.set(`notes.${id}`, note);
  return note;
}

export function updateNote(id, data) {
  const note = store.get(`notes.${id}`);
  if (!note) return null;

  const updated = {
    ...note,
    ...data,
    id,
    updatedAt: new Date().toISOString()
  };

  if (data.content && Array.isArray(data.content)) {
    const text = data.plainText || '';
    const firstLine = text.split('\n').find(line => line.trim() !== '') || '';
    updated.title = firstLine.substring(0, 50);
    updated.plainText = text;
  }

  store.set(`notes.${id}`, updated);
  return updated;
}

export function deleteNote(id) {
  store.delete(`notes.${id}`);
}

// ---- Timers CRUD ----

export function getAllTimers() {
  const timers = store.get('timers', {});
  return Object.values(timers).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getTimer(id) {
  return store.get(`timers.${id}`, null);
}

export function createTimer(data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const timer = {
    id,
    type: data.type || 'simple',
    label: data.label || '',
    durationMs: data.durationMs || 0,
    workMs: data.workMs || 1500000,
    breakMs: data.breakMs || 300000,
    rounds: data.rounds || 4,
    currentRound: 1,
    phase: 'work',
    status: 'planned',
    remainingMs: data.type === 'pomodoro' ? (data.workMs || 1500000) : (data.durationMs || 0),
    startedAt: null,
    createdAt: now,
    completedAt: null,
    audioAlert: data.audioAlert !== undefined ? data.audioAlert : true,
    desktopNotification: data.desktopNotification !== undefined ? data.desktopNotification : true,
  };
  store.set(`timers.${id}`, timer);
  return timer;
}

export function updateTimer(id, data) {
  const timer = store.get(`timers.${id}`);
  if (!timer) return null;
  const updated = { ...timer, ...data, id };
  store.set(`timers.${id}`, updated);
  return updated;
}

export function deleteTimer(id) {
  store.delete(`timers.${id}`);
}

// ---- Settings ----

export function getSettings() {
  return store.get('settings', { theme: 'system' });
}

export function updateSettings(data) {
  const settings = store.get('settings', {});
  store.set('settings', { ...settings, ...data });
}

export default store;
