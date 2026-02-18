const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getNote: (id) => ipcRenderer.invoke('notes:get', id),
  updateNote: (id, data) => ipcRenderer.invoke('notes:update', id, data),
  setColor: (id, color) => ipcRenderer.invoke('notes:set-color', id, color),
  setPin: (id, pinned) => ipcRenderer.invoke('notes:set-pin', id, pinned),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),
  createNote: () => ipcRenderer.invoke('notes:create'),
  openNote: (id) => ipcRenderer.send('notes:open-window', id),

  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  getTheme: () => ipcRenderer.invoke('theme:get'),
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme:changed', (_event, theme) => callback(theme));
  },

  getNoteId: () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('noteId');
  }
});
