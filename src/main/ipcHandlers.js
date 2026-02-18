import { ipcMain, nativeTheme, dialog, BrowserWindow } from 'electron';
import { getAllNotes, getNote, createNote, updateNote, deleteNote } from './store.js';
import windowManager from './windowManager.js';

export function registerIpcHandlers() {
  // ---- Notes CRUD ----

  ipcMain.handle('notes:get-all', () => {
    return getAllNotes();
  });

  ipcMain.handle('notes:get', (_event, id) => {
    return getNote(id);
  });

  ipcMain.handle('notes:create', () => {
    const note = createNote();
    windowManager.broadcastToList('notes:changed', { action: 'create', note });
    return note;
  });

  ipcMain.handle('notes:update', (_event, id, data) => {
    const note = updateNote(id, data);
    if (note) {
      windowManager.broadcastToList('notes:changed', { action: 'update', note });
    }
    return note;
  });

  ipcMain.handle('notes:delete', async (_event, id) => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showMessageBox(win, {
      type: 'warning',
      buttons: ['Deletar', 'Cancelar'],
      defaultId: 1,
      title: 'Deletar nota',
      message: 'Tem certeza que deseja deletar esta nota?',
      detail: 'Esta ação não pode ser desfeita.',
    });

    if (result.response === 0) {
      windowManager.closeNoteWindow(id);
      deleteNote(id);
      windowManager.broadcastToList('notes:changed', { action: 'delete', noteId: id });
      return true;
    }
    return false;
  });

  // ---- Window Management ----

  ipcMain.on('notes:open-window', (_event, noteId) => {
    windowManager.createNoteWindow(noteId);
  });

  ipcMain.handle('notes:set-pin', (_event, id, pinned) => {
    const note = updateNote(id, { isPinned: pinned });
    windowManager.setNoteAlwaysOnTop(id, pinned);
    if (note) {
      windowManager.broadcastToList('notes:changed', { action: 'update', note });
    }
    return note;
  });

  ipcMain.handle('notes:set-color', (_event, id, color) => {
    const note = updateNote(id, { color });
    if (note) {
      windowManager.broadcastToList('notes:changed', { action: 'update', note });
    }
    return note;
  });

  // ---- Window Controls (frameless) ----

  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  // ---- Theme ----

  ipcMain.handle('theme:get', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    windowManager.broadcastToList('theme:changed', theme);
    windowManager.broadcastToAllNotes('theme:changed', theme);
  });
}
