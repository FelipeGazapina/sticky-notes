import { Menu, app } from 'electron';
import { createNote } from './store.js';
import windowManager from './windowManager.js';
import { checkForUpdatesManual } from './autoUpdater.js';

export function buildAppMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Nova Nota',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const note = createNote();
            windowManager.broadcastToList('notes:changed', { action: 'create', note });
            windowManager.createNoteWindow(note.id);
          }
        },
        { type: 'separator' },
        {
          label: 'Fechar Janela',
          accelerator: 'CmdOrCtrl+W',
          click: (_menuItem, browserWindow) => {
            if (browserWindow && browserWindow !== windowManager.mainWindow) {
              browserWindow.close();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar Tudo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'toggleDevTools', label: 'DevTools' },
        { type: 'separator' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { role: 'resetZoom', label: 'Zoom Padrão' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Check for Updates...',
          click: () => checkForUpdatesManual()
        },
        { type: 'separator' },
        {
          label: `Version ${app.getVersion()}`,
          enabled: false
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
