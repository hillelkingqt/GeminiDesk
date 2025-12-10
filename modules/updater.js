// Auto Updater Module

const { autoUpdater } = require('electron-updater');
const { BrowserWindow, ipcMain, app, https, shell } = require('electron');
const path = require('path');

let settings = null;
let saveSettings = null;
let updateWin = null;
let installUpdateWin = null;
let updateInfo = null;
let reminderTimeoutId = null;

const UPDATE_REMINDER_DELAY_MS = 60 * 60 * 1000; // 1 hour
const UPDATE_FOUND_DISPLAY_DURATION_MS = 1500; // 1.5 seconds

function initialize(deps) {
    settings = deps.settings;
    saveSettings = deps.saveSettings;
}

function registerIpcHandlers() {
    ipcMain.on('check-for-updates', () => {
        openUpdateWindowAndCheck();
    });

    ipcMain.on('open-download-page', () => {
        const repoUrl = `https://github.com/hillelkingqt/GeminiDesk/releases/latest`;
        shell.openExternal(repoUrl);
        if (updateWin) {
            updateWin.close();
        }
    });

    ipcMain.on('close-update-window', () => {
        if (updateWin) {
            updateWin.close();
        }
    });

    ipcMain.on('start-download-update', () => {
        if (updateWin) {
            updateWin.close();
        }
        console.log('Starting update download...');
        autoUpdater.downloadUpdate();
    });

    ipcMain.on('install-update-now', () => {
        installUpdateNow();
    });

    ipcMain.on('remind-later-update', () => {
        remindLaterUpdate();
    });

    ipcMain.on('close-install-update-window', () => {
        if (installUpdateWin) {
            installUpdateWin.close();
        }
    });
}

function sendUpdateStatus(status, data = {}) {
    // Notify update window if open
    if (updateWin && !updateWin.isDestroyed()) {
        updateWin.webContents.send('update-info', { status, ...data });
    }

    // Notify install window if open
    if (installUpdateWin && !installUpdateWin.isDestroyed()) {
        installUpdateWin.webContents.send('install-update-info', { status, ...data });
    }
}

function openUpdateWindowAndCheck() {
    if (updateWin) {
        updateWin.focus();
        return;
    }

    const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    updateWin = new BrowserWindow({
        width: 420, height: 500, frame: false, resizable: false,
        show: false, parent: parentWindow, modal: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
        }
    });

    updateWin.loadFile('update-available.html');

    updateWin.once('ready-to-show', async () => {
        if (!updateWin) return;
        updateWin.show();
        // Step 1: Send to window a message that we're starting to check
        updateWin.webContents.send('update-info', { status: 'checking' });
        try {
            // Step 2: Only now, start the check process in background
            const result = await autoUpdater.checkForUpdates();
            // Check if update was already downloaded
            if (result && result.downloadedFile) {
                console.log('Update has already been downloaded, showing install window');
                if (updateWin && !updateWin.isDestroyed()) {
                    updateWin.close();
                }
                // Store update info and show install confirmation
                if (result.updateInfo) {
                    updateInfo = result.updateInfo;
                    showInstallConfirmation();
                }
            }
        } catch (error) {
            console.error('Manual update check failed:', error.message);
            if (updateWin && !updateWin.isDestroyed()) {
                updateWin.webContents.send('update-info', {
                    status: 'error',
                    message: 'Could not connect to GitHub to check for updates. Please check your internet connection or try again later. You can also check for new releases manually on the GitHub page.'
                });
            }
        }
    });

    updateWin.on('closed', () => {
        updateWin = null;
    });
}

function openInstallUpdateWindow() {
    if (installUpdateWin) {
        installUpdateWin.focus();
        return;
    }

    const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    installUpdateWin = new BrowserWindow({
        width: 500, height: 600, frame: false, resizable: false,
        show: false, parent: parentWindow, modal: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
        }
    });

    installUpdateWin.loadFile('install-update-confirm.html');

    installUpdateWin.once('ready-to-show', () => {
        if (installUpdateWin) {
            installUpdateWin.show();
            // We need to re-send the info because the window just loaded
            if (updateInfo) {
                // Fetch release notes if not already present
                if (!updateInfo.releaseNotesHTML && updateInfo.releaseNotes) {
                     // Convert markdown if needed or just pass text
                     updateInfo.releaseNotesHTML = `<pre>${updateInfo.releaseNotes}</pre>`;
                }

                installUpdateWin.webContents.send('install-update-info', {
                    status: 'downloaded',
                    version: updateInfo.version,
                    releaseNotesHTML: updateInfo.releaseNotesHTML || '<p>No release notes available.</p>'
                });
            }
        }
    });

    installUpdateWin.on('closed', () => {
        installUpdateWin = null;
    });
}

async function showInstallConfirmation() {
    if (!installUpdateWin || installUpdateWin.isDestroyed()) {
        openInstallUpdateWindow();
    } else {
         if (updateInfo) {
            installUpdateWin.webContents.send('install-update-info', {
                status: 'downloaded',
                version: updateInfo.version,
                releaseNotesHTML: updateInfo.releaseNotesHTML || updateInfo.releaseNotes || '<p>No release notes available.</p>'
            });
         }
    }
}

function checkAndShowPendingUpdateReminder() {
    // If we have a pending update reminder, schedule it
    if (settings.updateInstallReminderTime) {
        const reminderTime = new Date(settings.updateInstallReminderTime);
        const now = new Date();

        // If reminder time has passed, show immediately
        if (now >= reminderTime) {
            console.log('Update reminder time passed, showing confirmation now');
            // We need updateInfo to show the window properly.
            // If we have pendingUpdateInfo in settings, restore it
            if (settings.pendingUpdateInfo) {
                updateInfo = settings.pendingUpdateInfo;
                showInstallConfirmation();
            } else {
                // If no info saved, maybe trigger a check?
                // For now just clear the reminder
                settings.updateInstallReminderTime = null;
                saveSettings(settings);
            }
        } else {
            // Schedule for future
            const delay = reminderTime.getTime() - now.getTime();
            console.log(`Scheduling update reminder for ${delay}ms from now`);

            // Restore info if available
             if (settings.pendingUpdateInfo) {
                updateInfo = settings.pendingUpdateInfo;
            }

            reminderTimeoutId = setTimeout(() => {
                showInstallConfirmation();
                settings.updateInstallReminderTime = null;
                saveSettings(settings);
            }, delay);
        }
    }
}

function scheduleDailyUpdateCheck() {
    // Check if auto update check is disabled
    if (settings.disableAutoUpdateCheck) {
        console.log('Auto update check is disabled in settings');
        return;
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastCheck = settings.lastUpdateCheck || 0;

    const timeSinceLastCheck = now - lastCheck;

    if (timeSinceLastCheck >= ONE_DAY_MS) {
        console.log('Daily update check due, checking now...');
        autoUpdater.checkForUpdates().catch(err => {
            console.error('Daily update check failed:', err);
        });
        settings.lastUpdateCheck = now;
        saveSettings(settings);
    } else {
        const timeUntilNextCheck = ONE_DAY_MS - timeSinceLastCheck;
        console.log(`Next daily update check in ${Math.round(timeUntilNextCheck / 1000 / 60)} minutes`);
        setTimeout(() => {
            scheduleDailyUpdateCheck();
        }, timeUntilNextCheck);
    }
}

function installUpdateNow() {
    // Save current window state before updating
    try {
        const openWindows = BrowserWindow.getAllWindows().filter(w =>
            !w.isDestroyed() &&
            w !== updateWin &&
            w !== installUpdateWin
        );

        const windowStates = openWindows.map(win => {
            const bounds = win.getBounds();
            const view = win.getBrowserView();
            return {
                bounds,
                isMaximized: win.isMaximized(),
                isMinimized: win.isMinimized(),
                url: view && view.webContents ? view.webContents.getURL() : null
            };
        });

        settings.preUpdateWindowStates = windowStates;
        console.log('Saved window states before update:', windowStates.length, 'windows');
    } catch (e) {
        console.warn('Failed to save window states:', e);
    }

    settings.updateInstallReminderTime = null;
    settings.pendingUpdateInfo = null;
    saveSettings(settings);

    autoUpdater.quitAndInstall(true, true);
}

function remindLaterUpdate() {
    if (reminderTimeoutId) {
        clearTimeout(reminderTimeoutId);
        reminderTimeoutId = null;
    }

    if (installUpdateWin) {
        installUpdateWin.close();
    }

    const reminderTime = new Date();
    reminderTime.setTime(reminderTime.getTime() + UPDATE_REMINDER_DELAY_MS);

    settings.updateInstallReminderTime = reminderTime.toISOString();
    saveSettings(settings);

    reminderTimeoutId = setTimeout(() => {
        showInstallConfirmation();
        settings.updateInstallReminderTime = null;
        saveSettings(settings);
    }, UPDATE_REMINDER_DELAY_MS);

    console.log('Update reminder set for 1 hour from now:', reminderTime.toISOString());
}

module.exports = {
    initialize,
    registerIpcHandlers,
    openUpdateWindowAndCheck,
    openInstallUpdateWindow,
    showInstallConfirmation,
    checkAndShowPendingUpdateReminder,
    scheduleDailyUpdateCheck,
    sendUpdateStatus,
    setUpdateInfo: (info) => { updateInfo = info; },
    getUpdateInfo: () => updateInfo,
    getUpdateWin: () => updateWin,
    getInstallUpdateWin: () => installUpdateWin
};
