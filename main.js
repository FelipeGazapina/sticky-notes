import { app } from 'electron';
import windowManager from './src/main/windowManager.js';
import { registerIpcHandlers } from './src/main/ipcHandlers.js';
import { buildAppMenu } from './src/main/menuBuilder.js';

app.whenReady().then(() => {
  registerIpcHandlers();
  buildAppMenu();
  windowManager.createMainWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (!windowManager.mainWindow) {
    windowManager.createMainWindow();
  }
});
