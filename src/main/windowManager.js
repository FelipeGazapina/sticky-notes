import { BrowserWindow, screen } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getNote, getSettings, updateNote, updateSettings } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

class WindowManager {
  constructor() {
    this.mainWindow = null;
    this.noteWindows = new Map();
  }

  validateBounds(bounds) {
    if (!bounds || bounds.x === undefined || bounds.y === undefined) return null;
    const displays = screen.getAllDisplays();
    const isVisible = displays.some(display => {
      const { x, y, width, height } = display.bounds;
      return bounds.x >= x - 100 && bounds.x < x + width &&
             bounds.y >= y - 100 && bounds.y < y + height;
    });
    return isVisible ? bounds : null;
  }

  createMainWindow() {
    const settings = getSettings();
    const savedBounds = this.validateBounds(settings.listWindowBounds);

    this.mainWindow = new BrowserWindow({
      width: savedBounds?.width || 400,
      height: savedBounds?.height || 600,
      x: savedBounds?.x,
      y: savedBounds?.y,
      minWidth: 300,
      minHeight: 400,
      title: 'Sticky Notes',
      icon: join(rootDir, 'assets', 'icons', 'icon.png'),
      webPreferences: {
        preload: join(rootDir, 'preload', 'noteListPreload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      }
    });

    this.mainWindow.loadFile(join(rootDir, 'src', 'renderer', 'noteList', 'noteList.html'));

    const saveBounds = () => {
      if (!this.mainWindow.isDestroyed()) {
        const bounds = this.mainWindow.getBounds();
        updateSettings({ listWindowBounds: bounds });
      }
    };
    this.mainWindow.on('moved', saveBounds);
    this.mainWindow.on('resized', saveBounds);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  createNoteWindow(noteId) {
    if (this.noteWindows.has(noteId)) {
      const existing = this.noteWindows.get(noteId);
      if (!existing.isDestroyed()) {
        existing.focus();
        return existing;
      }
      this.noteWindows.delete(noteId);
    }

    const note = getNote(noteId);
    if (!note) return null;

    const savedBounds = this.validateBounds(note.windowBounds);

    const win = new BrowserWindow({
      width: savedBounds?.width || 300,
      height: savedBounds?.height || 350,
      x: savedBounds?.x,
      y: savedBounds?.y,
      minWidth: 200,
      minHeight: 200,
      frame: false,
      transparent: false,
      alwaysOnTop: note.isPinned || false,
      skipTaskbar: false,
      title: note.title || 'Nota',
      icon: join(rootDir, 'assets', 'icons', 'icon.png'),
      webPreferences: {
        preload: join(rootDir, 'preload', 'notePreload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      }
    });

    win.loadFile(join(rootDir, 'src', 'renderer', 'note', 'note.html'), {
      query: { noteId }
    });

    const saveBounds = () => {
      if (!win.isDestroyed()) {
        const bounds = win.getBounds();
        updateNote(noteId, { windowBounds: bounds });
      }
    };
    win.on('moved', saveBounds);
    win.on('resized', saveBounds);

    win.on('closed', () => {
      this.noteWindows.delete(noteId);
    });

    this.noteWindows.set(noteId, win);
    return win;
  }

  closeNoteWindow(noteId) {
    const win = this.noteWindows.get(noteId);
    if (win && !win.isDestroyed()) {
      win.close();
    }
    this.noteWindows.delete(noteId);
  }

  setNoteAlwaysOnTop(noteId, pinned) {
    const win = this.noteWindows.get(noteId);
    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(pinned);
    }
  }

  broadcastToList(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  broadcastToAllNotes(channel, data) {
    for (const [, win] of this.noteWindows) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    }
  }

  closeAllNoteWindows() {
    for (const [, win] of this.noteWindows) {
      if (!win.isDestroyed()) {
        win.close();
      }
    }
    this.noteWindows.clear();
  }
}

export default new WindowManager();
