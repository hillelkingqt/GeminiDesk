// Multi-Account Support Module

const { session, app } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const fetch = require('node-fetch');

let settings = null;
let saveSettings = null;
let tray = null;
let createWindow = null;
let Menu = null;
let broadcastToAllWebContents = null;

const PROFILE_CAPTURE_COOLDOWN_MS = 60 * 1000;
const PROFILE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const profileCaptureTimestamps = new Map();
let avatarDirectoryPath = null;

function initialize(deps) {
    settings = deps.settings;
    saveSettings = deps.saveSettings;
    tray = deps.tray;
    createWindow = deps.createWindow;
    Menu = deps.Menu;

    // Check if broadcastToAllWebContents is provided directly or via utils
    if (deps.broadcastToAllWebContents) {
        broadcastToAllWebContents = deps.broadcastToAllWebContents;
    } else {
        // Fallback: try to require from utils if not provided
        try {
            const utils = require('./utils');
            broadcastToAllWebContents = utils.broadcastToAllWebContents;
        } catch (e) {
            console.warn('Could not load broadcastToAllWebContents in accounts module', e);
        }
    }
}

function setTray(trayInstance) {
    tray = trayInstance;
}

function getAccountPartition(accountIndex) {
    return `persist:gemini-account-${accountIndex}`;
}

function getCurrentAccountPartition() {
    const accountIndex = settings.currentAccountIndex || 0;
    return getAccountPartition(accountIndex);
}

function addAccount(accountName) {
    if (!settings.accounts) {
        settings.accounts = [];
    }
    const newAccount = {
        name: accountName || `Account ${settings.accounts.length + 1}`,
        index: settings.accounts.length
    };
    settings.accounts.push(newAccount);
    saveSettings(settings);

    // Try to load the unpacked extension into the new account partition
    try {
        const extPath = path.join(__dirname, '..', '0.5.8_0');
        if (fs.existsSync(extPath)) {
            const partName = getAccountPartition(newAccount.index);
            const accSession = session.fromPartition(partName, { cache: true });
            if (accSession && typeof accSession.loadExtension === 'function') {
                accSession.loadExtension(extPath, { allowFileAccess: true }).then(() => {
                    console.log(`Loaded extension into new account partition: ${partName}`);
                }).catch(err => {
                    console.warn(`Failed to load extension into new account partition ${partName}:`, err && err.message ? err.message : err);
                });
            }
        }
    } catch (e) {
        console.warn('Could not load extension for new account:', e && e.message ? e.message : e);
    }
    return newAccount.index;
}

function updateAccount(index, updates) {
    if (!settings.accounts || !settings.accounts[index]) return null;
    settings.accounts[index] = { ...settings.accounts[index], ...updates };
    saveSettings(settings);
    if (tray && typeof updateTrayContextMenu === 'function') {
        updateTrayContextMenu();
    }
    return settings.accounts[index];
}

// Alias for compatibility
function updateAccountMetadata(index, updates) {
    return updateAccount(index, updates);
}

function getAvatarStorageDir() {
    if (avatarDirectoryPath) {
        return avatarDirectoryPath;
    }
    const dir = path.join(app.getPath('userData'), 'account-avatars');
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (err) {
            console.warn('Failed to create avatar storage directory:', err && err.message ? err.message : err);
        }
    }
    avatarDirectoryPath = dir;
    return dir;
}

async function downloadAccountAvatar(sourceUrl, accountIndex) {
    if (!sourceUrl) return '';
    try {
        const response = await fetch(sourceUrl);
        if (!response || !response.ok) {
            throw new Error(`HTTP ${response ? response.status : 'unknown'}`);
        }
        const buffer = await response.buffer();
        const dir = getAvatarStorageDir();
        const avatarPath = path.join(dir, `account-${accountIndex}.png`);
        await fsp.writeFile(avatarPath, buffer);
        return avatarPath;
    } catch (error) {
        console.warn('Failed to download account avatar:', error && error.message ? error.message : error);
        return '';
    }
}

async function setProfileImageForAccount(accountIndex, imageUrl) {
    if (typeof accountIndex !== 'number') return;
    try {
        const localPath = await downloadAccountAvatar(imageUrl, accountIndex);
        if (localPath) {
            updateAccount(accountIndex, {
                avatarUrl: imageUrl,
                avatarFile: localPath,
                lastProfileFetch: Date.now()
            });
        }
    } catch (e) {
        console.warn('Failed to set profile image:', e);
    }
}

function shouldAttemptProfileCapture(accountIndex, forceAttempt = false) {
    if (typeof accountIndex !== 'number' || accountIndex < 0) {
        return false;
    }
    if (forceAttempt) {
        return true;
    }
    const now = Date.now();
    const last = profileCaptureTimestamps.get(accountIndex) || 0;
    if (now - last < PROFILE_CAPTURE_COOLDOWN_MS) {
        return false;
    }
    profileCaptureTimestamps.set(accountIndex, now);
    return true;
}

async function captureAccountProfile(view, accountIndex, forceAttempt = false) {
    if (!view || !view.webContents || view.webContents.isDestroyed()) {
        return;
    }
    if (!shouldAttemptProfileCapture(accountIndex, forceAttempt)) {
        return;
    }

    const currentAccounts = settings.accounts || [];
    const existingAccount = currentAccounts[accountIndex];

    try {
        const profile = await view.webContents.executeJavaScript(`(() => {
            const link = document.querySelector('a[aria-label^="Google Account"], a[aria-label*="@gmail.com"]');
            const ariaLabel = link ? (link.getAttribute('aria-label') || '') : '';
            const emailMatch = ariaLabel.match(/\\(([^)]+)\\)/);
            const email = emailMatch ? (emailMatch[1] || '').trim() : '';
            const labelParts = ariaLabel.split(':');
            const displayName = labelParts.length > 1 ? labelParts[1].replace(/\\([^)]*\\)/, '').trim() : '';
            let avatarUrl = '';
            let img = link ? link.querySelector('img') : null;
            if (!img) {
                img = document.querySelector('img.gbii, img.gb_Q, img[aria-label^="Account"], img[alt*="@"]');
            }
            if (img) {
                avatarUrl = img.getAttribute('src') || '';
                if (!avatarUrl && img.srcset) {
                    avatarUrl = img.srcset.split(' ')[0];
                }
            }
            return { avatarUrl, email, displayName };
        })();`, true);

        if (!profile) {
            return;
        }

        const now = Date.now();
        let avatarFile = existingAccount ? existingAccount.avatarFile : '';
        const needsDownload = !!profile.avatarUrl && (
            forceAttempt ||
            !avatarFile ||
            !fs.existsSync(avatarFile) ||
            !existingAccount ||
            !existingAccount.lastProfileFetch ||
            (now - existingAccount.lastProfileFetch) > PROFILE_REFRESH_INTERVAL_MS ||
            (existingAccount.avatarUrl && existingAccount.avatarUrl !== profile.avatarUrl)
        );

        if (needsDownload) {
            const downloaded = await downloadAccountAvatar(profile.avatarUrl, accountIndex);
            if (downloaded) {
                avatarFile = downloaded;
            }
        }

        const updates = {};
        if (avatarFile && (!existingAccount || existingAccount.avatarFile !== avatarFile)) {
            updates.avatarFile = avatarFile;
            updates.avatarUrl = profile.avatarUrl || (existingAccount ? existingAccount.avatarUrl : '');
            updates.lastProfileFetch = now;
        }

        if (profile.email && (!existingAccount || existingAccount.email !== profile.email)) {
            updates.email = profile.email;
        }

        if (profile.displayName && (
            !existingAccount ||
            !existingAccount.name ||
            existingAccount.name.startsWith('Account ')
        )) {
            updates.name = profile.displayName;
        }

        if (Object.keys(updates).length > 0) {
            const updatedAccount = updateAccountMetadata(accountIndex, updates);
            if (updatedAccount && broadcastToAllWebContents) {
                broadcastToAllWebContents('settings-updated', settings);
            }
        }
    } catch (error) {
        console.warn('Failed to capture account profile:', error && error.message ? error.message : error);
    }
}

function maybeCaptureAccountProfile(view, accountIndex, forceAttempt = false) {
    if (typeof accountIndex !== 'number' || accountIndex < 0) {
        return;
    }
    captureAccountProfile(view, accountIndex, forceAttempt);
}

function switchAccount(accountIndex) {
    if (accountIndex < 0) {
        return;
    }

    if (!settings.accounts) {
        settings.accounts = [];
    }

    while (settings.accounts.length <= accountIndex) {
        addAccount(`Account ${settings.accounts.length + 1}`);
    }

    settings.currentAccountIndex = accountIndex;
    saveSettings(settings);

    console.log(`Switched to account ${accountIndex}. New windows will use this account.`);

    if (tray && typeof updateTrayContextMenu === 'function') {
        updateTrayContextMenu();
    }
}

function createWindowWithAccount(accountIndex = null, state = null) {
    const targetAccountIndex = accountIndex !== null ? accountIndex : (settings.currentAccountIndex || 0);

    const originalAccountIndex = settings.currentAccountIndex;
    settings.currentAccountIndex = targetAccountIndex;

    const newWin = createWindow(state);

    settings.currentAccountIndex = originalAccountIndex;

    newWin.accountIndex = targetAccountIndex;

    return newWin;
}

function updateTrayContextMenu() {
    if (!tray) return;

    const buildAccountsMenu = () => {
        if (!settings.accounts || settings.accounts.length === 0) {
            return [];
        }

        const accountMenuItems = settings.accounts.map((account, index) => ({
            label: account.name,
            type: 'radio',
            checked: settings.currentAccountIndex === index,
            click: () => {
                switchAccount(index);
            }
        }));

        accountMenuItems.push(
            { type: 'separator' },
            {
                label: 'Add New Account',
                click: () => {
                    const newIndex = addAccount();
                    switchAccount(newIndex);
                }
            },
            {
                label: 'New Window (Current Account)',
                click: () => {
                    createWindow();
                }
            },
            {
                label: 'New Window (New Account)',
                click: () => {
                    const newIndex = addAccount();
                    createWindowWithAccount(newIndex);
                    switchAccount(newIndex);
                }
            }
        );

        return [
            { type: 'separator' },
            {
                label: 'Accounts',
                submenu: accountMenuItems
            }
        ];
    };

    const { BrowserWindow } = require('electron');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open GeminiDesk',
            click: () => {
                const allWindows = BrowserWindow.getAllWindows();
                const userWindows = allWindows.filter(w => !w.__internal);

                if (userWindows.length === 0) {
                    createWindow();
                } else {
                    userWindows.forEach(win => {
                        if (win.isMinimized()) win.restore();
                        win.show();
                        win.focus();
                    });
                    if (userWindows[0]) {
                        const forceOnTop = require('./utils').forceOnTop;
                        forceOnTop(userWindows[0]);
                    }
                }
            }
        },
        {
            label: 'New Window',
            click: () => {
                createWindow();
            }
        },
        ...buildAccountsMenu(),
        { type: 'separator' },
        {
            label: 'Settings',
            click: () => {
                const allWindows = BrowserWindow.getAllWindows();
                const mainWindow = allWindows.find(w => !w.__internal) || allWindows[0];
                if (mainWindow) {
                    mainWindow.webContents.send('open-settings-window');
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                require('electron').app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
}

module.exports = {
    initialize,
    setTray,
    getAccountPartition,
    getCurrentAccountPartition,
    addAccount,
    updateAccount,
    updateAccountMetadata,
    switchAccount,
    createWindowWithAccount,
    updateTrayContextMenu,
    maybeCaptureAccountProfile,
    captureAccountProfile,
    setProfileImageForAccount,
    downloadAccountAvatar,
    getAvatarStorageDir,
    shouldAttemptProfileCapture
};
