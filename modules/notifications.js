// Notifications Manager Module

const { BrowserWindow, ipcMain } = require('electron');
const fetch = require('node-fetch');
const path = require('path');

let settings = null;
let saveSettings = null;
let notificationWin = null;
let notificationIntervalId = null;

function initialize(deps) {
    settings = deps.settings;
    saveSettings = deps.saveSettings;
}

function createNotificationWindow() {
    if (notificationWin) {
        notificationWin.focus();
        return;
    }

    notificationWin = new BrowserWindow({
        width: 550,
        height: 450,
        frame: false,
        show: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
        }
    });

    notificationWin.loadFile('notification.html');

    notificationWin.once('ready-to-show', () => {
        if (notificationWin) {
            notificationWin.show();
            notificationWin.focus();
        }
    });

    notificationWin.on('closed', () => {
        notificationWin = null;
    });
}

function sendToNotificationWindow(data) {
    if (!notificationWin || notificationWin.isDestroyed()) return;
    const wc = notificationWin.webContents;
    const send = () => wc.send('notification-data', data);
    if (wc.isLoadingMainFrame()) {
        wc.once('did-finish-load', send);
    } else {
        send();
    }
}

async function checkForNotifications(isManualCheck = false) {
    if (isManualCheck) {
        createNotificationWindow();
        if (!notificationWin) return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch('https://latex-v25b.onrender.com/latest-messages', {
            cache: 'no-cache',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok && response.status !== 404) {
            throw new Error(`Server error: ${response.status}`);
        }

        const messages = response.status === 404 ? [] : await response.json();

        if (messages.length > 0) {
            const latestMessage = messages[0];
            if (latestMessage.id !== settings.lastShownNotificationId) {
                console.log(`New notification found: ID ${latestMessage.id}`);
                settings.lastShownNotificationId = latestMessage.id;
                saveSettings(settings);

                if (!notificationWin) createNotificationWindow();
                sendToNotificationWindow({ status: 'found', content: messages });
            } else if (isManualCheck) {
                sendToNotificationWindow({ status: 'no-new-message', content: messages });
            }
        } else {
            console.log('No messages found on server. Clearing local cache.');
            settings.lastShownNotificationId = null;
            saveSettings(settings);

            if (isManualCheck) {
                sendToNotificationWindow({ status: 'no-messages-ever' });
            }
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to check for notifications:', error.message);
        if (isManualCheck && notificationWin) {
            const errorMessage = (error.name === 'AbortError')
                ? 'The request timed out.'
                : error.message;
            sendToNotificationWindow({ status: 'error', message: errorMessage });
        }
    }
}

function scheduleNotificationCheck() {
    if (notificationIntervalId) {
        clearInterval(notificationIntervalId);
        notificationIntervalId = null;
    }

    if (settings.autoCheckNotifications) {
        const halfHourInMs = 30 * 60 * 1000;
        notificationIntervalId = setInterval(checkForNotifications, halfHourInMs);
    }
}

// IPC Handlers related to notifications
ipcMain.on('manual-check-for-notifications', () => {
    checkForNotifications(true);
});

ipcMain.on('close-notification-window', () => {
    if (notificationWin) {
        notificationWin.close();
    }
});

ipcMain.on('request-last-notification', async (event) => {
    const senderWebContents = event.sender;
    if (!senderWebContents || senderWebContents.isDestroyed()) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch('https://latex-v25b.onrender.com/latest-messages', {
            cache: 'no-cache',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok && response.status !== 404) throw new Error(`Server error: ${response.status}`);
        const messages = response.status === 404 ? [] : await response.json();

        if (messages.length > 0) {
            senderWebContents.send('notification-data', { status: 'found', content: messages });
        } else {
            senderWebContents.send('notification-data', { status: 'no-messages-ever' });
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to fetch last notification:', error.message);
        let errorMessage = error.name === 'AbortError' ? 'The request timed out.' : error.message;
        if (!senderWebContents.isDestroyed()) {
            senderWebContents.send('notification-data', { status: 'error', message: errorMessage });
        }
    }
});

module.exports = {
    initialize,
    checkForNotifications,
    scheduleNotificationCheck,
    getNotificationWin: () => notificationWin
};
