const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAllNotes: () => ipcRenderer.invoke('notes:get-all'),
  createNote: () => ipcRenderer.invoke('notes:create'),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),
  openNote: (id) => ipcRenderer.send('notes:open-window', id),

  onNotesChanged: (callback) => {
    ipcRenderer.on('notes:changed', (_event, data) => callback(data));
  },

  getTheme: () => ipcRenderer.invoke('theme:get'),
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme:changed', (_event, theme) => callback(theme));
  },
});
