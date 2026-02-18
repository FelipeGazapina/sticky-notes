const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAllNotes: () => ipcRenderer.invoke('notes:get-all'),
  createNote: () => ipcRenderer.invoke('notes:create'),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),
  openNote: (id) => ipcRenderer.send('notes:open-window', id),

  onNotesChanged: (callback) => {
    ipcRenderer.on('notes:changed', (_event, data) => callback(data));
  },

  // ---- Timers ----
  getAllTimers: () => ipcRenderer.invoke('timers:get-all'),
  getTimer: (id) => ipcRenderer.invoke('timers:get', id),
  createTimer: (data) => ipcRenderer.invoke('timers:create', data),
  updateTimer: (id, data) => ipcRenderer.invoke('timers:update', id, data),
  deleteTimer: (id) => ipcRenderer.invoke('timers:delete', id),
  sendTimerNotification: (data) => ipcRenderer.send('timers:notify', data),
  onTimersChanged: (callback) => {
    ipcRenderer.on('timers:changed', (_event, data) => callback(data));
  },

  // ---- Theme ----
  getTheme: () => ipcRenderer.invoke('theme:get'),
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme:changed', (_event, theme) => callback(theme));
  },
});
