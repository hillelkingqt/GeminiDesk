// Multi-Account Support Module

const { session } = require('electron');

let settings = null;
let saveSettings = null;
let tray = null;
let createWindow = null;
let Menu = null;

function initialize(deps) {
    settings = deps.settings;
    saveSettings = deps.saveSettings;
    tray = deps.tray;
    createWindow = deps.createWindow;
    Menu = deps.Menu;
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
        const path = require('path');
        const fs = require('fs');
        const { session } = require('electron');
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
    switchAccount,
    createWindowWithAccount,
    updateTrayContextMenu,
    updateAccountMetadata
};

function updateAccountMetadata(accountIndex, updates) {
    if (!settings.accounts || !settings.accounts[accountIndex]) {
        return null;
    }

    // Apply updates
    Object.assign(settings.accounts[accountIndex], updates);

    // Save changes
    saveSettings(settings);

    return settings.accounts[accountIndex];
}
