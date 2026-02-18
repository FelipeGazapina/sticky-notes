import { app } from 'electron';
import windowManager from './src/main/windowManager.js';
import { registerIpcHandlers } from './src/main/ipcHandlers.js';
import { buildAppMenu } from './src/main/menuBuilder.js';
import { initAutoUpdater } from './src/main/autoUpdater.js';

app.whenReady().then(() => {
  registerIpcHandlers();
  buildAppMenu();
  windowManager.createMainWindow();
  initAutoUpdater();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (!windowManager.mainWindow) {
    windowManager.createMainWindow();
  }
});
