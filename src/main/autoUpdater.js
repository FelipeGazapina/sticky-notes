import { autoUpdater } from 'electron-updater';
import { dialog, app } from 'electron';

// Don't auto-download — ask the user first
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = false;

let isManualCheck = false;
let updateWindow = null;

// ---- Event Handlers ----

autoUpdater.on('checking-for-update', () => {
  console.log('[AutoUpdater] Checking for updates...');
});

autoUpdater.on('update-available', async (info) => {
  console.log(`[AutoUpdater] Update available: v${info.version}`);

  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `A new version is available: v${info.version}`,
    detail: `You are currently on v${app.getVersion()}. Would you like to download the update now?`,
    buttons: ['Download', 'Later'],
    defaultId: 0,
    cancelId: 1,
  });

  if (result.response === 0) {
    autoUpdater.downloadUpdate();
  }
});

autoUpdater.on('update-not-available', () => {
  console.log('[AutoUpdater] No updates available.');

  if (isManualCheck) {
    dialog.showMessageBox({
      type: 'info',
      title: 'No Updates',
      message: 'You\'re up to date!',
      detail: `Version ${app.getVersion()} is the latest version.`,
      buttons: ['OK'],
    });
    isManualCheck = false;
  }
});

autoUpdater.on('download-progress', (progress) => {
  const percent = Math.round(progress.percent);
  console.log(`[AutoUpdater] Download progress: ${percent}%`);
});

autoUpdater.on('update-downloaded', async () => {
  console.log('[AutoUpdater] Update downloaded.');

  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded successfully',
    detail: 'The update has been downloaded. Restart now to apply the update?',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    cancelId: 1,
  });

  if (result.response === 0) {
    autoUpdater.quitAndInstall(false, true);
  }
});

autoUpdater.on('error', (err) => {
  console.error('[AutoUpdater] Error:', err.message);

  if (isManualCheck) {
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Error',
      message: 'Could not check for updates',
      detail: 'Please check your internet connection and try again.\n\nYou can also download the latest version manually from GitHub.',
      buttons: ['OK'],
    });
    isManualCheck = false;
  }
});

// ---- Public API ----

export function initAutoUpdater() {
  // Only auto-check for NSIS installs, not portable
  // Portable runs from temp dir or user-chosen location, can't auto-update
  const isPortable = process.env.PORTABLE_EXECUTABLE_DIR != null;

  if (isPortable) {
    console.log('[AutoUpdater] Portable mode detected, skipping auto-update.');
    return;
  }

  // Check after 5 seconds to not slow down startup
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[AutoUpdater] Auto-check failed:', err.message);
    });
  }, 5000);
}

export function checkForUpdatesManual() {
  isManualCheck = true;
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('[AutoUpdater] Manual check failed:', err.message);
    isManualCheck = false;
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Error',
      message: 'Could not check for updates',
      detail: 'Please check your internet connection and try again.',
      buttons: ['OK'],
    });
  });
}
