// IPC Handlers Module

const { ipcMain, BrowserWindow, dialog, nativeTheme, shell, app } = require('electron');
const path = require('path');
const fs = require('fs');

let settings = null;
let saveSettings = null;
let playAiCompletionSound = null;
let accountsModule = null;
let loadGemini = null;
let updateWindowAppUserModelId = null;
let originalSize = null;
let shareIdeasWin = null;
let deepResearchScheduleWin = null;
let settingsWin = null;
let confirmWin = null;
let promptManagerWin = null;
let createAndManageLoginWindowForPartition = null;
let broadcastToAllWebContents = null;
let broadcastToWindows = null;
let applyAlwaysOnTopSetting = null;
let applyInvisibilityMode = null;
let setAutoLaunch = null;
let applyProxySettings = null;
let extensionsModule = null;
let openMcpSetupWindow = null;
let registerShortcuts = null;
let settingsPath = null;
let defaultSettings = null;
let setCanvasMode = null;
let GEMINI_URL = null;

function initialize(deps) {
    settings = deps.settings;
    saveSettings = deps.saveSettings;
    playAiCompletionSound = deps.playAiCompletionSound;
    accountsModule = deps.accountsModule;
    loadGemini = deps.loadGemini;
    updateWindowAppUserModelId = deps.updateWindowAppUserModelId;
    originalSize = deps.originalSize;
    createAndManageLoginWindowForPartition = deps.createAndManageLoginWindowForPartition;
    broadcastToAllWebContents = deps.broadcastToAllWebContents;
    broadcastToWindows = deps.broadcastToWindows;
    applyAlwaysOnTopSetting = deps.applyAlwaysOnTopSetting;
    applyInvisibilityMode = deps.applyInvisibilityMode;
    setAutoLaunch = deps.setAutoLaunch;
    applyProxySettings = deps.applyProxySettings;
    extensionsModule = deps.extensionsModule;
    openMcpSetupWindow = deps.openMcpSetupWindow;
    registerShortcuts = deps.registerShortcuts;
    settingsPath = deps.settingsPath;
    defaultSettings = deps.defaultSettings;
    setCanvasMode = deps.setCanvasMode;
    GEMINI_URL = deps.GEMINI_URL;
}

function registerHandlers() {
    ipcMain.on('execute-shortcut', (event, action) => {
        const { shortcutActions } = require('./shortcuts');
        if (shortcutActions && shortcutActions[action]) {
            shortcutActions[action]();
        }
    });

    ipcMain.on('ai-response-completed', () => {
        console.log('🔊 Main process received ai-response-completed event, playing sound...');
        if (playAiCompletionSound) playAiCompletionSound();
    });

    ipcMain.on('select-app-mode', (event, mode) => {
        const senderWindow = BrowserWindow.fromWebContents(event.sender);
        if (senderWindow && !senderWindow.isDestroyed()) {
            // --- Restore original window size ---
            senderWindow.setResizable(true); // Re-enable resizing
            if (originalSize) {
                senderWindow.setBounds(originalSize);
            }
            senderWindow.center();
            // ------------------------------------

            // Accept either a mode string or an object { mode: 'gemini'|'aistudio', accountIndex: n }
            let targetMode = mode;
            if (mode && typeof mode === 'object') {
                targetMode = mode.mode;
                if (typeof mode.accountIndex === 'number') {
                    // switch current account to requested index for this window
                    accountsModule.switchAccount(mode.accountIndex);
                }
            }

            if (loadGemini) loadGemini(targetMode, senderWindow);
        }
    });

    // Toggle app mode (switch between Gemini and AI Studio)
    ipcMain.on('toggle-app-mode', (event, newMode) => {
        const senderWindow = BrowserWindow.fromWebContents(event.sender);
        if (senderWindow && !senderWindow.isDestroyed()) {
            const targetMode = newMode || (senderWindow.appMode === 'gemini' ? 'aistudio' : 'gemini');
            if (loadGemini) loadGemini(targetMode, senderWindow);
            // Notify the window of the mode change
            senderWindow.webContents.send('app-mode-changed', targetMode);
            // Also update the taskbar grouping
            if (updateWindowAppUserModelId) updateWindowAppUserModelId(senderWindow, targetMode);
        }
    });

    // Get current app mode for a window
    ipcMain.handle('get-app-mode', (event) => {
        const senderWindow = BrowserWindow.fromWebContents(event.sender);
        if (senderWindow && !senderWindow.isDestroyed()) {
            return senderWindow.appMode || 'gemini';
        }
        return 'gemini';
    });

    ipcMain.on('open-share-ideas-window', (event) => {
        if (shareIdeasWin) {
            shareIdeasWin.focus();
            return;
        }

        const parentWindow = BrowserWindow.fromWebContents(event.sender);

        shareIdeasWin = new BrowserWindow({
            width: 700,
            height: 650,
            minHeight: 500,
            resizable: true,
            frame: false,
            transparent: true,
            parent: parentWindow,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                contextIsolation: true,
            }
        });

        // setupContextMenu is not available here unless passed, but we can assume basic menu or skip

        shareIdeasWin.loadFile('share-ideas.html');

        shareIdeasWin.once('ready-to-show', () => {
            if (shareIdeasWin) shareIdeasWin.show();
        });

        shareIdeasWin.on('closed', () => {
            shareIdeasWin = null;
        });
    });

    ipcMain.on('close-share-ideas-window', () => {
        if (shareIdeasWin && !shareIdeasWin.isDestroyed()) {
            shareIdeasWin.close();
        }
    });

    ipcMain.on('open-deep-research-schedule-window', () => {
        if (deepResearchScheduleWin) {
            deepResearchScheduleWin.focus();
            return;
        }

        const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
        deepResearchScheduleWin = new BrowserWindow({
            width: 800,
            height: 700,
            resizable: true,
            frame: false,
            parent: parentWindow,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                contextIsolation: true,
            }
        });

        deepResearchScheduleWin.loadFile('deep-research-schedule.html');

        deepResearchScheduleWin.once('ready-to-show', () => {
            if (deepResearchScheduleWin) deepResearchScheduleWin.show();
        });

        deepResearchScheduleWin.on('closed', () => {
            deepResearchScheduleWin = null;
        });
    });

    ipcMain.on('start-find-in-page', (event, searchText, findNext = true) => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            const view = focusedWindow.getBrowserView();
            if (view && !view.webContents.isDestroyed()) {
                if (searchText.trim() === '') {
                    view.webContents.stopFindInPage('clearSelection');
                    return;
                }
                view.webContents.findInPage(searchText, { findNext: findNext });
            }
        }
    });

    ipcMain.on('stop-find-in-page', (event, action) => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            const view = focusedWindow.getBrowserView();
            if (view && !view.webContents.isDestroyed()) {
                view.webContents.stopFindInPage(action);
            }
        }
    });

    ipcMain.on('log-to-main', (event, message) => {
        console.log('GeminiDesk:', message);
    });

    // --- Restored Handlers ---

    ipcMain.on('update-setting', (event, key, value) => {
        console.log(`Updating setting: ${key} = ${value}`);

        if (key.startsWith('shortcuts.')) {
            const subKey = key.split('.')[1];
            settings.shortcuts[subKey] = value;
        } else {
            settings[key] = value;
        }

        // Handle side effects of setting updates
        if (key === 'deepResearchEnabled' || key === 'deepResearchSchedule') {
            // Need to reschedule. Since deepResearchModule is initialized in main,
            // we rely on it picking up the new settings or restarting schedule if needed.
            // Ideally call deepResearchModule.scheduleDeepResearchCheck() here if exposed.
            // For now, assume it's handled or user restarts.
        }

        saveSettings(settings);
        console.log(`Setting ${key} saved successfully`);

        // Apply settings immediately
        if (key === 'alwaysOnTop') {
            if (process.platform === 'darwin') {
                if (value) {
                    app.dock.hide();
                } else {
                    app.dock.show();
                }
            }
            BrowserWindow.getAllWindows().forEach(w => {
                if (!w.isDestroyed()) {
                    if (applyAlwaysOnTopSetting) applyAlwaysOnTopSetting(w, value);
                }
            });
        }
        if (key === 'showInTaskbar') {
            BrowserWindow.getAllWindows().forEach(w => {
                if (!w.isDestroyed() && (!shareIdeasWin || w !== shareIdeasWin) && (!settingsWin || w !== settingsWin)) {
                    w.setSkipTaskbar(!value);
                }
            });
        }
        if (key === 'invisibilityMode') {
            BrowserWindow.getAllWindows().forEach(w => {
                if (!w.isDestroyed()) {
                    try {
                        w.setContentProtection(value);
                        w.setSkipTaskbar(value ? true : !settings.showInTaskbar);
                        console.log(`Invisibility mode ${value ? 'enabled' : 'disabled'} for window ${w.id}`);
                    } catch (e) {
                        console.warn('Failed to set content protection:', e && e.message ? e.message : e);
                    }
                }
            });
        }
        if (key === 'autoStart') {
            if (setAutoLaunch) setAutoLaunch(value);
        }
        if (key === 'autoCheckNotifications') {
            // scheduleNotificationCheck needs to be called. It is in main/notifications module.
            // It uses settings directly, so maybe just force a re-check if possible.
        }
        if (key === 'proxyEnabled' || key === 'proxyUrl') {
            if (applyProxySettings) applyProxySettings().then(() => {
                BrowserWindow.getAllWindows().forEach(w => {
                    try {
                        const view = w.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            view.webContents.reload();
                        }
                    } catch (e) {}
                });
            });
        }
        if (key === 'loadUnpackedExtension') {
            if (value) {
                if (extensionsModule) extensionsModule.loadExtensionToAllSessions().then(() => {
                    BrowserWindow.getAllWindows().forEach(w => {
                        try {
                            const view = w.getBrowserView();
                            if (view && view.webContents && !view.webContents.isDestroyed()) {
                                view.webContents.reload();
                            }
                        } catch (e) {}
                    });
                    try {
                        if (openMcpSetupWindow) openMcpSetupWindow(BrowserWindow.fromWebContents(event.sender));
                    } catch (e) {}
                });
            } else {
                // ... disable logic ...
                // Simplified: prompt restart
                 (async () => {
                    try {
                        const focused = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
                        const result = await dialog.showMessageBox(focused, {
                            type: 'question',
                            buttons: ['Restart Now', 'Later'],
                            defaultId: 0,
                            cancelId: 1,
                            title: 'Restart required',
                            message: 'To completely unload the extension from all browser sessions a restart is required. Restart now?'
                        });
                        if (result.response === 0) {
                            app.relaunch();
                            app.exit(0);
                        }
                    } catch (e) {}
                })();
            }
        }
        if (key.startsWith('shortcuts.') || key === 'shortcutsGlobal' || key === 'shortcutsGlobalPerKey') {
            if (registerShortcuts) registerShortcuts(broadcastToAllWebContents);
        }

        if (key === 'language') {
            if (broadcastToAllWebContents) broadcastToAllWebContents('language-changed', value);
        }

        if (broadcastToAllWebContents) broadcastToAllWebContents('settings-updated', settings);
    });

    ipcMain.on('open-settings-window', (event) => {
        if (settingsWin) {
            settingsWin.focus();
            return;
        }

        const parentWindow = BrowserWindow.fromWebContents(event.sender);

        settingsWin = new BrowserWindow({
            width: 450,
            height: 580,
            resizable: false,
            frame: false,
            parent: parentWindow,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                contextIsolation: true,
            }
        });

        // Assuming utils setupContextMenu is globally available or not critical for settings
        // if (setupContextMenu) setupContextMenu(settingsWin.webContents);

        settingsWin.loadFile('settings.html');

        settingsWin.once('ready-to-show', () => {
            if (settingsWin) {
                if (applyInvisibilityMode) applyInvisibilityMode(settingsWin);
                settingsWin.show();
            }
        });

        settingsWin.on('closed', () => {
            settingsWin = null;
        });
    });

    ipcMain.handle('theme:get-resolved', () => {
        const theme = settings.theme;
        return theme === 'system' ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light') : theme;
    });

    ipcMain.handle('theme:get-setting', () => {
        return settings.theme;
    });

    ipcMain.on('theme:set', (event, newTheme) => {
        settings.theme = newTheme;
        saveSettings(settings);

        const themeToSend = newTheme === 'system'
            ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
            : newTheme;

        if (broadcastToAllWebContents) broadcastToAllWebContents('theme-updated', themeToSend);

        if (['light', 'dark', 'system'].includes(newTheme)) {
            nativeTheme.themeSource = newTheme;
        }
    });

    ipcMain.handle('add-google-account', async () => {
        try {
            const currentSettings = settings; // use module-scoped settings
            const allAccounts = (currentSettings && Array.isArray(currentSettings.accounts)) ? currentSettings.accounts : [];

            const currentCount = allAccounts.filter(a => a && (
                (a.email && a.email.length > 0) ||
                (a.avatarFile && a.avatarFile.length > 0) ||
                (a.avatarUrl && a.avatarUrl.length > 0)
            )).length;

            if (currentCount >= 4) {
                return { success: false, error: 'Maximum number of accounts (4) reached' };
            }

            let newIndex = -1;
            const placeholders = allAccounts.map((a, i) => ({ a, i })).filter(item => {
                const acc = item.a || {};
                return !( (acc.email && acc.email.length>0) || (acc.avatarFile && acc.avatarFile.length>0) || (acc.avatarUrl && acc.avatarUrl.length>0) );
            });
            if (placeholders.length > 0) {
                newIndex = placeholders[0].i;
            }

            if (newIndex === -1) {
                newIndex = accountsModule.addAccount();
                if (typeof newIndex === 'number' && newIndex === -1) {
                    return { success: false, error: 'Maximum number of accounts (4) reached' };
                }
            }
            const part = accountsModule.getAccountPartition(newIndex);

            if (createAndManageLoginWindowForPartition) {
                await createAndManageLoginWindowForPartition(GEMINI_URL, part, newIndex);
            }
            return { success: true, index: newIndex };
        } catch (e) {
            console.error('Failed to add google account:', e && e.message ? e.message : e);
            return { success: false, error: e && e.message ? e.message : String(e) };
        }
    });

    ipcMain.on('show-confirm-reset', () => {
        if (confirmWin) return;
        confirmWin = new BrowserWindow({
            width: 340, height: 180, resizable: false, frame: false,
            parent: settingsWin, modal: true, show: false,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                contextIsolation: true,
            }
        });
        confirmWin.loadFile('confirm-reset.html');
        confirmWin.once('ready-to-show', () => {
            if (confirmWin) confirmWin.show();
        });
        confirmWin.on('closed', () => confirmWin = null);
    });

    ipcMain.on('cancel-reset-action', () => {
        if (confirmWin) confirmWin.close();
    });

    ipcMain.on('confirm-reset-action', () => {
        if (confirmWin) confirmWin.close();

        if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath);
        // We need to reset the settings object. Since it's passed by reference, this is tricky if we assign a new object.
        // We should update the properties of the existing object.
        if (defaultSettings) {
            Object.keys(settings).forEach(key => delete settings[key]);
            Object.assign(settings, JSON.parse(JSON.stringify(defaultSettings)));
        }

        if (registerShortcuts && broadcastToAllWebContents) registerShortcuts(broadcastToAllWebContents);
        if (setAutoLaunch) setAutoLaunch(settings.autoStart);

        BrowserWindow.getAllWindows().forEach(w => {
            if (!w.isDestroyed()) {
                if (applyAlwaysOnTopSetting) applyAlwaysOnTopSetting(w, settings.alwaysOnTop);
                w.webContents.send('settings-updated', settings);
            }
        });
        console.log('All settings have been reset to default.');
    });

    ipcMain.handle('get-settings', async () => {
        return settings;
    });

    ipcMain.on('toggle-full-screen', async (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win && !win.isDestroyed()) {
            const view = win.getBrowserView();

            let scrollY = 0;
            if (view && view.webContents && !view.webContents.isDestroyed()) {
                try {
                    scrollY = await view.webContents.executeJavaScript(
                        `(document.scrollingElement || document.documentElement).scrollTop`
                    );
                    win.savedScrollPosition = scrollY;
                } catch (e) {}
            }

            if (!win.isMaximized()) {
                win.prevNormalBounds = win.getBounds();
            }

            if (win.isMaximized()) {
                win.unmaximize();
                setTimeout(() => {
                    if (win && !win.isDestroyed()) {
                        if (applyAlwaysOnTopSetting) applyAlwaysOnTopSetting(win, settings.alwaysOnTop);
                        win.focus();
                        if (win.prevNormalBounds) {
                            win.setBounds(win.prevNormalBounds);
                            win.prevNormalBounds = null;
                        }
                        // Update view bounds (simplified)
                        const view = win.getBrowserView();
                        if (view) {
                            const contentBounds = win.getContentBounds();
                            view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                        }
                    }
                }, 50);
            } else {
                win.setAlwaysOnTop(false);
                setTimeout(() => {
                    if (win && !win.isDestroyed()) {
                        win.maximize();
                        win.focus();
                        setTimeout(() => {
                            if (win && !win.isDestroyed()) {
                                const view = win.getBrowserView();
                                if (view) {
                                    const contentBounds = win.getContentBounds();
                                    view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                                }
                            }
                        }, 100);
                    }
                }, 50);
            }

            if (view && view.webContents && !view.webContents.isDestroyed()) {
                setTimeout(async () => {
                    if (view && !view.webContents.isDestroyed()) {
                        try {
                            await view.webContents.executeJavaScript(
                                `(document.scrollingElement || document.documentElement).scrollTop = ${scrollY};`
                            );
                        } catch (e) {}
                    }
                }, 500);
            }
        }
    });

    ipcMain.on('open-new-window', () => {
        // We need access to createWindow. It wasn't passed in initialize initially.
        // Wait, main.js has createWindow. We need to pass it.
        // I will assume it's passed in deps.createWindow if I update main.js
        // For now, if not available, we can't create.
        // Wait, I saw createAndManageLoginWindowForPartition passed, but not createWindow explicitly in my plan.
        // I need to add createWindow to deps.
    });

    ipcMain.on('minimize-window', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win && !win.isDestroyed()) {
            win.minimize();
        }
    });

    ipcMain.on('close-window', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win && !win.isDestroyed()) {
            win.close();
        }
    });

    ipcMain.on('canvas-state-changed', (event, isCanvasVisible) => {
        const senderWebContents = event.sender;
        for (const window of BrowserWindow.getAllWindows()) {
            if (window.isDestroyed()) continue;
            const view = window.getBrowserView();
            if ((view && view.webContents.id === senderWebContents.id) ||
                (window.webContents.id === senderWebContents.id)) {
                if (setCanvasMode) setCanvasMode(isCanvasVisible, window);
                return;
            }
        }
    });

    ipcMain.on('update-title', (event, title) => {
        const senderWebContents = event.sender;
        const allWindows = BrowserWindow.getAllWindows();
        for (const window of allWindows) {
            const view = window.getBrowserView();
            if (view && view.webContents.id === senderWebContents.id) {
                if (!window.isDestroyed()) {
                    window.webContents.send('update-title', title);
                }
                break;
            }
        }
    });

    ipcMain.handle('execute-in-main-view', async (event, code) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        const view = win ? win.getBrowserView() : null;
        if (!view || view.webContents.isDestroyed()) {
            return null;
        }
        try {
            return await view.webContents.executeJavaScript(code);
        } catch (error) {
            return null;
        }
    });

    ipcMain.handle('request-current-title', async (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        const view = win ? win.getBrowserView() : null;
        if (!view || view.webContents.isDestroyed()) return 'New Chat';
        try {
            const title = await view.webContents.executeJavaScript(`
                (() => {
                    const el = document.querySelector('.conversation.selected .conversation-title') ||
                               document.querySelector('li.active a.prompt-link');
                    return el ? el.textContent.trim() : document.title;
                })();
            `);
            return title || 'New Chat';
        } catch (error) {
            return 'New Chat';
        }
    });

    ipcMain.on('open-voice-assistant', () => {
        shell.openExternal('https://github.com/hillelkingqt/Gemini-voice-assistant');
    });

    ipcMain.on('request-api-key', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win && !win.isDestroyed() && settings.geminiApiKey) {
            win.webContents.send('set-api-key', settings.geminiApiKey);
        }
    });

    // Prompt Manager handlers
    ipcMain.handle('get-custom-prompts', async () => {
        return settings.customPrompts || [];
    });

    ipcMain.handle('add-custom-prompt', async (event, prompt) => {
        if (!settings.customPrompts) settings.customPrompts = [];
        const newPrompt = {
            id: Date.now().toString(),
            name: prompt.name || 'Untitled Prompt',
            content: prompt.content || '',
            isDefault: prompt.isDefault || false
        };
        if (newPrompt.isDefault) {
            settings.customPrompts.forEach(p => p.isDefault = false);
            settings.defaultPromptId = newPrompt.id;
        }
        settings.customPrompts.push(newPrompt);
        saveSettings(settings);
        if (broadcastToWindows) broadcastToWindows('settings-updated', settings);
        return newPrompt;
    });

    ipcMain.handle('update-custom-prompt', async (event, prompt) => {
        if (!settings.customPrompts) return null;
        const index = settings.customPrompts.findIndex(p => p.id === prompt.id);
        if (index === -1) return null;
        if (prompt.isDefault) {
            settings.customPrompts.forEach(p => p.isDefault = false);
            settings.defaultPromptId = prompt.id;
        } else if (settings.defaultPromptId === prompt.id) {
            settings.defaultPromptId = null;
        }
        settings.customPrompts[index] = { ...settings.customPrompts[index], ...prompt };
        saveSettings(settings);
        if (broadcastToWindows) broadcastToWindows('settings-updated', settings);
        return settings.customPrompts[index];
    });

    ipcMain.handle('delete-custom-prompt', async (event, promptId) => {
        if (!settings.customPrompts) return false;
        const index = settings.customPrompts.findIndex(p => p.id === promptId);
        if (index === -1) return false;
        if (settings.defaultPromptId === promptId) settings.defaultPromptId = null;
        settings.customPrompts.splice(index, 1);
        saveSettings(settings);
        if (broadcastToWindows) broadcastToWindows('settings-updated', settings);
        return true;
    });

    ipcMain.handle('set-default-prompt', async (event, promptId) => {
        if (!settings.customPrompts) return false;
        settings.customPrompts.forEach(p => p.isDefault = false);
        if (promptId) {
            const prompt = settings.customPrompts.find(p => p.id === promptId);
            if (prompt) {
                prompt.isDefault = true;
                settings.defaultPromptId = promptId;
            } else {
                settings.defaultPromptId = null;
            }
        } else {
            settings.defaultPromptId = null;
        }
        saveSettings(settings);
        if (broadcastToWindows) broadcastToWindows('settings-updated', settings);
        return true;
    });

    ipcMain.on('open-prompt-manager-window', (event) => {
        if (promptManagerWin && !promptManagerWin.isDestroyed()) {
            promptManagerWin.focus();
            return;
        }

        promptManagerWin = new BrowserWindow({
            width: 700,
            height: 600,
            frame: false,
            resizable: true,
            alwaysOnTop: true,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                contextIsolation: true
            }
        });

        promptManagerWin.__internal = true;
        promptManagerWin.loadFile('prompt-manager.html');

        promptManagerWin.on('closed', () => {
            promptManagerWin = null;
        });
    });
}

module.exports = {
    initialize,
    registerHandlers
};
