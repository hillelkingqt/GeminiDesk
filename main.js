const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain, dialog, screen, shell, session, nativeTheme, clipboard, nativeImage, Menu, Tray } = require('electron');

// Enable remote debugging port early so Chromium extensions and devtools work reliably
try {
    app.commandLine.appendSwitch('remote-debugging-port', '9222');
    // Reduce noisy Chromium/extension logs to avoid console spam
    app.commandLine.appendSwitch('disable-logging');
    app.commandLine.appendSwitch('v', '0');
    app.commandLine.appendSwitch('log-level', '3'); // Fatal only
} catch (e) {
    console.warn('Could not set chromium switches:', e && e.message ? e.message : e);
}
const https = require('https');

const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { spawn, fork } = require('child_process');
const os = require('os');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { autoUpdater } = require('electron-updater');
const AutoLaunch = require('auto-launch');
const translations = require('./translations.js');


// ================================================================= //
// Import Modular Components
// ================================================================= //

const settingsModule = require('./modules/settings');
const constants = require('./modules/constants');
const utils = require('./modules/utils');
const deepResearchModule = require('./modules/deep-research');
const accountsModule = require('./modules/accounts');
const extensionsModule = require('./modules/extensions');
const shortcutsModule = require('./modules/shortcuts');
const voiceAssistantModule = require('./modules/voice-assistant');
const updaterModule = require('./modules/updater');
const exportManagerModule = require('./modules/export-manager');
const screenshotModule = require('./modules/screenshot');
const geminiAutomationModule = require('./modules/gemini-automation');
const promptManagerModule = require('./modules/prompt-manager');
const notificationsModule = require('./modules/notifications');
const autoLaunchModule = require('./modules/auto-launch');
const proxyManagerModule = require('./modules/proxy-manager');
const canvasResizeModule = require('./modules/canvas-resize');
const mcpManagerModule = require('./modules/mcp-manager');
const ipcHandlersModule = require('./modules/ipc-handlers');

// Use constants from module
const { REAL_CHROME_UA, STABLE_USER_AGENT, SESSION_PARTITION, GEMINI_URL, AISTUDIO_URL, isMac, execPath, launcherPath, margin, originalSize, canvasSize } = constants;

// Helper: open an isolated login window and transfer cookies into a specific account partition
async function createAndManageLoginWindowForPartition(loginUrl, targetPartition, accountIndex = 0) {
    let tempWin = new BrowserWindow({
        width: 700,
        height: 780,
        frame: true,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            javascript: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            userAgent: STABLE_USER_AGENT
        }
    });

    try {
        await tempWin.webContents.session.clearStorageData({ storages: ['cookies', 'localstorage'], origins: ['https://accounts.google.com', 'https://google.com'] });
    } catch (e) {}

    tempWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    setupContextMenu(tempWin.webContents);
    tempWin.loadURL(loginUrl);

    tempWin.on('closed', () => { tempWin = null; });

    tempWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
        const isLoginSuccess = navigatedUrl.startsWith(GEMINI_URL) || navigatedUrl.startsWith(AISTUDIO_URL);
        if (!isLoginSuccess) return;

        const isolatedSession = tempWin.webContents.session;
        let sessionCookieFound = false;
        for (let i = 0; i < 20; i++) {
            const criticalCookies = await isolatedSession.cookies.get({ name: '__Secure-1PSID' });
            if (criticalCookies && criticalCookies.length > 0) { sessionCookieFound = true; break; }
            await new Promise(r => setTimeout(r, 500));
        }

        if (!sessionCookieFound) {
            console.log('Partitioned login: no critical session cookie found; keeping login window open to allow user to finish sign-in');
            return;
        }

        try {
            const mainSession = session.fromPartition(targetPartition);
            const googleCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
            if (googleCookies && googleCookies.length > 0) {
                for (const cookie of googleCookies) {
                    try {
                        const cookieUrl = `https://${cookie.domain.startsWith('.') ? 'www' : ''}${cookie.domain}${cookie.path}`;
                        const newCookie = {
                            url: cookieUrl,
                            name: cookie.name,
                            value: cookie.value,
                            path: cookie.path,
                            secure: cookie.secure,
                            httpOnly: cookie.httpOnly,
                            expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
                            session: false,
                            sameSite: cookie.sameSite
                        };
                        if (!cookie.name.startsWith('__Host-')) newCookie.domain = cookie.domain;
                        await mainSession.cookies.set(newCookie);
                    } catch (e) {
                        console.warn('Could not transfer cookie:', e && e.message ? e.message : e);
                    }
                }
            }

            try { await mainSession.cookies.flushStore(); } catch (e) {}

            try {
                const profileInfo = await tempWin.webContents.executeJavaScript(`(function(){
                    try {
                        const a = document.querySelector('a.gb_B') || document.querySelector('a[aria-label^="Google Account:"]') || document.querySelector('.gb_z a');
                        const img = a && a.querySelector('img') ? (a.querySelector('img').src || null) : (document.querySelector('img.gbii') ? document.querySelector('img.gbii').src : null);
                        const aria = a ? a.getAttribute('aria-label') : (document.querySelector('a[aria-label^="Google Account:"]') ? document.querySelector('a[aria-label^="Google Account:"]') .getAttribute('aria-label') : null);
                        return { img, aria };
                    } catch(e){ return {}; }
                })();`, true);

                if (profileInfo && profileInfo.img) {
                    await accountsModule.setProfileImageForAccount(accountIndex, profileInfo.img).catch(() => {});
                    if (profileInfo.aria) {
                        const text = profileInfo.aria.replace(/^Google Account:\s*/i, '').trim();
                        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
                        const email = lines[lines.length - 1] && lines[lines.length - 1].includes('@') ? lines[lines.length - 1] : null;
                        if (email) accountsModule.updateAccount(accountIndex, { email, name: lines[0] || undefined });
                    }
                }
            } catch (e) {
                console.warn('Failed to extract profile info:', e && e.message ? e.message : e);
            }

            if (tempWin && !tempWin.isDestroyed()) tempWin.close();

            try {
                if (typeof settings !== 'undefined') {
                    settings.currentAccountIndex = accountIndex;
                    try { saveSettings(settings); } catch (e) { console.warn('Failed to save settings after adding account', e); }
                }

                try {
                    const choiceWin = createWindow();
                    if (choiceWin && !choiceWin.isDestroyed()) {
                        try {
                            choiceWin.loadFile('choice.html');
                            const choiceSize = { width: 500, height: 450 };
                            choiceWin.setResizable(false);
                            choiceWin.setSize(choiceSize.width, choiceSize.height);
                            choiceWin.center();
                            choiceWin.setAlwaysOnTop(true, 'screen-saver');
                            choiceWin.focus();
                            choiceWin.show();
                        } catch (e) {
                            console.warn('Failed to prepare choice window UI:', e && e.message ? e.message : e);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to open choice window after account add:', e && e.message ? e.message : e);
                }
            } catch (err) {
                console.warn('Error while finalizing account addition:', err && err.message ? err.message : err);
            }

            BrowserWindow.getAllWindows().forEach(win => {
                if (win && !win.isDestroyed()) {
                    const view = win.getBrowserView();
                    if (view && view.webContents && !view.webContents.isDestroyed()) view.webContents.reload();
                }
            });

        } catch (error) {
            console.error('Error during partitioned login handling:', error);
        }
    });
}
    app.whenReady().then(async () => {
        try {
            const localSettings = settingsModule.getSettings();
            if (!localSettings || !localSettings.loadUnpackedExtension) {
                console.log('loadUnpackedExtension is disabled in settings - skipping automatic extension load at startup');
                return;
            }
            await extensionsModule.loadExtensionToAllSessions();
        } catch (e) {
            console.error('Failed during conditional extension load at startup:', e && e.message ? e.message : e);
        }
    });

const trayModule = require('./modules/tray');

// ================================================================= //
// Global Constants and Configuration
// ================================================================= //

app.disableHardwareAcceleration();

// Allow third-party/partitioned cookies used by Google Sign-In
app.commandLine.appendSwitch('enable-features', 'ThirdPartyStoragePartitioning');

// ================================================================= //
// Global Variables
// ================================================================= //
let deepResearchScheduleInterval = null;
let lastScheduleCheck = 0;
let isQuitting = false;
let isUserTogglingHide = false;
let lastFocusedWindow = null;
let settingsWin = null;
let confirmWin = null;
let assisWin = null;

let updateWin = null;
let installUpdateWin = null;
let notificationWin = null;
let personalMessageWin = null;
let lastFetchedMessageId = null;
let filePathToProcess = null;
let notificationIntervalId = null;
let agentProcess = null;
let tray = null;

const detachedViews = new Map();
let avatarDirectoryPath = null;


// ================================================================= //
// Settings Management (Using Module)
// ================================================================= //

const { getSettings, saveSettings, defaultSettings, settingsPath } = settingsModule;
let settings = getSettings();

// Helper function to apply invisibility mode (content protection) to a window
function applyInvisibilityMode(win) {
    if (!win || win.isDestroyed()) return;
    try {
        if (settings.invisibilityMode) {
            win.setContentProtection(true);
            win.setSkipTaskbar(true); // Also hide from taskbar/Alt+Tab
            console.log(`Invisibility mode applied to window ${win.id}`);
        }
    } catch (e) {
        console.warn('Failed to apply invisibility mode:', e && e.message ? e.message : e);
    }
}

/**
 * Helper function to apply alwaysOnTop setting with platform-specific configuration.
 */
function applyAlwaysOnTopSetting(win, shouldBeOnTop) {
    if (!win || win.isDestroyed()) return;
    try {
        if (process.platform === 'darwin') {
            if (shouldBeOnTop) {
                win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
                win.setAlwaysOnTop(true, 'screen-saver');
            } else {
                win.setVisibleOnAllWorkspaces(false);
                win.setAlwaysOnTop(false);
            }
        } else {
            win.setAlwaysOnTop(shouldBeOnTop);
        }
    } catch (e) {
        console.warn('Failed to apply alwaysOnTop setting:', e && e.message ? e.message : e);
    }
}

// Utility Functions (Using Module)
const { forceOnTop, broadcastToAllWebContents, broadcastToWindows, reportErrorToServer, playAiCompletionSound, setupContextMenu } = utils;

// Initialize utils module with settings
utils.initialize({ settings });
extensionsModule.initialize({ settings, constants, accountsModule });
updaterModule.initialize({ settings, saveSettings });
exportManagerModule.initialize({ settings });
screenshotModule.initialize({ settings, forceOnTop });
geminiAutomationModule.initialize({ settings, playAiCompletionSound });
promptManagerModule.initialize({ settings, saveSettings, broadcastToWindows });
notificationsModule.initialize({ settings, saveSettings });
proxyManagerModule.initialize({ settings, accountsModule });
canvasResizeModule.initialize({ settings });

const { setAutoLaunch } = autoLaunchModule;
const { applyProxySettings } = proxyManagerModule;
const { openMcpSetupWindow } = mcpManagerModule;
const { registerShortcuts } = shortcutsModule;
const { setCanvasMode } = canvasResizeModule;

// Initialize IPC Handlers with all dependencies
ipcHandlersModule.initialize({
    settings,
    saveSettings,
    playAiCompletionSound,
    accountsModule,
    loadGemini,
    updateWindowAppUserModelId,
    originalSize,
    createAndManageLoginWindowForPartition,
    broadcastToAllWebContents,
    broadcastToWindows,
    applyAlwaysOnTopSetting,
    applyInvisibilityMode,
    setAutoLaunch,
    applyProxySettings,
    extensionsModule,
    openMcpSetupWindow,
    registerShortcuts,
    settingsPath,
    defaultSettings,
    setCanvasMode,
    GEMINI_URL
});
ipcHandlersModule.registerHandlers();
updaterModule.registerIpcHandlers();
exportManagerModule.registerIpcHandlers();

// ================================================================= //
// Deep Research Schedule Functions (Using Module)
// ================================================================= //

const { scheduleDeepResearchCheck, checkAndExecuteScheduledResearch, executeScheduledDeepResearch } = deepResearchModule;

// ================================================================= //
// Multi-Account Support (Using Module)
// ================================================================= //

const { getAccountPartition, getCurrentAccountPartition, getAccounts, addAccount, switchAccount, createWindowWithAccount, updateTrayContextMenu, updateAccountMetadata, maybeCaptureAccountProfile } = accountsModule;

// ================================================================= //
// System Tray Icon (Using Module)
// ================================================================= //

// Tray will be created in app.whenReady()


// ================================================================= //
// Icon Path Helper
// ================================================================= //

function getIconPath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'icon.ico');
    } else {
        return path.join(__dirname, 'icon.ico');
    }
}

// ================================================================= //
// Taskbar Grouping for Gemini vs AI Studio Windows
// ================================================================= //

const GEMINI_APP_USER_MODEL_ID = 'com.geminidesk.gemini';
const AISTUDIO_APP_USER_MODEL_ID = 'com.geminidesk.aistudio';

function updateWindowAppUserModelId(win, mode) {
    if (process.platform !== 'win32') return;
    
    try {
        const appId = mode === 'aistudio' ? AISTUDIO_APP_USER_MODEL_ID : GEMINI_APP_USER_MODEL_ID;
        if (win && !win.isDestroyed() && typeof win.setAppDetails === 'function') {
            win.setAppDetails({
                appId: appId,
                appIconPath: getIconPath(),
                relaunchCommand: '',
                relaunchDisplayName: mode === 'aistudio' ? 'AI Studio' : 'Gemini'
            });
            console.log(`Set AppUserModelId for window ${win.id} to ${appId} (mode: ${mode})`);
        }
    } catch (err) {
        console.warn('Failed to set AppUserModelId:', err && err.message ? err.message : err);
    }
}

// ================================================================= //
// Session Filters for AI Studio Support
// ================================================================= //

function setupSessionFilters(sess) {
    if (!sess) return;
    sess.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = details.responseHeaders || {};
        if (details.url.includes('aistudio.google.com')) {
            delete responseHeaders['content-security-policy'];
            delete responseHeaders['Content-Security-Policy'];
            delete responseHeaders['x-frame-options'];
            delete responseHeaders['X-Frame-Options'];
        }
        callback({ responseHeaders });
    });
}

// ================================================================= //
// Shortcuts Management
// ================================================================= //

// We need to keep this function to pass it to shortcuts module as a callback
function proceedWithScreenshot() {
    let targetWin = BrowserWindow.getFocusedWindow();
    if (!targetWin) {
        if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
            targetWin = lastFocusedWindow;
        } else {
            const allWindows = BrowserWindow.getAllWindows();
            targetWin = allWindows.length > 0 ? allWindows[0] : null;
        }
    }
    screenshotModule.proceedWithScreenshot(targetWin);
}

// ================================================================= //
// Gemini-Specific Functions
// ================================================================= //

const {
    checkAndSendDefaultPrompt,
    createNewChatWithModel,
    triggerSearch,
    executeDefaultPrompt
} = geminiAutomationModule;

function reloadFocusedView() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow && !focusedWindow.isDestroyed()) {
        const view = focusedWindow.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            console.log(`Reloading view for window ID: ${focusedWindow.id}`);
            view.webContents.reload();
        }
    }
}

// ================================================================= //
// Window Creation and Management
// ================================================================= //

function createWindow(state = null) {
    const newWin = new BrowserWindow({
        width: originalSize.width,
        height: originalSize.height,
        skipTaskbar: !settings.showInTaskbar,
        frame: false,
        backgroundColor: '#1E1E1E',
        alwaysOnTop: false,
        fullscreenable: false,
        focusable: true,
        icon: getIconPath(),
        show: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            partition: SESSION_PARTITION
        }
    });

    const initialAccountIndex = state && typeof state.accountIndex === 'number'
        ? state.accountIndex
        : (settings.currentAccountIndex || 0);
    newWin.accountIndex = initialAccountIndex;

    applyAlwaysOnTopSetting(newWin, settings.alwaysOnTop);
    applyInvisibilityMode(newWin);

    newWin.isCanvasActive = false;
    newWin.prevBounds = null;
    newWin.appMode = null;
    newWin.savedScrollPosition = 0;

    setupContextMenu(newWin.webContents);

    newWin.webContents.on('before-input-event', (event, input) => {
        if (input.control || input.meta) {
            const currentZoom = newWin.webContents.getZoomLevel();
            
            if (input.type === 'keyDown') {
                if (input.key === '=' || input.key === '+') {
                    event.preventDefault();
                    newWin.webContents.setZoomLevel(currentZoom + 0.5);
                } else if (input.key === '-') {
                    event.preventDefault();
                    newWin.webContents.setZoomLevel(currentZoom - 0.5);
                } else if (input.key === '0') {
                    event.preventDefault();
                    newWin.webContents.setZoomLevel(0);
                }
            }
        }
    });

    newWin.webContents.on('zoom-changed', (event, zoomDirection) => {
        const currentZoom = newWin.webContents.getZoomLevel();
        if (zoomDirection === 'in') {
            newWin.webContents.setZoomLevel(currentZoom + 0.5);
        } else if (zoomDirection === 'out') {
            newWin.webContents.setZoomLevel(currentZoom - 0.5);
        }
    });

    newWin.webContents.on('did-finish-load', () => {
        const themeToSend = settings.theme === 'system'
            ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
            : settings.theme;
        newWin.webContents.send('theme-updated', themeToSend);

        if (!settings.shortcutsGlobal) {
            const localShortcuts = { ...settings.shortcuts };
            delete localShortcuts.showHide;
            newWin.webContents.send('set-local-shortcuts', localShortcuts);
        }
    });

    newWin.on('focus', () => {
        if (settings.alwaysOnTop) {
            applyAlwaysOnTopSetting(newWin, true);
        }
        setTimeout(() => {
            if (newWin && !newWin.isDestroyed() && newWin.isFocused()) {
                const view = newWin.getBrowserView();
                if (view && view.webContents && !view.webContents.isDestroyed()) {
                    view.webContents.focus();
                }
            }
        }, 100);

        const findShortcut = settings.shortcuts.findInPage;
        if (findShortcut) {
            globalShortcut.register(findShortcut, shortcutActions.findInPage);
        }
    });

    newWin.on('blur', () => {
        const findShortcut = settings.shortcuts.findInPage;
        if (findShortcut) {
            globalShortcut.unregister(findShortcut);
        }
    });

    newWin.on('closed', () => {
        detachedViews.delete(newWin);
    });

    newWin.on('move', async () => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            try {
                const scrollY = await view.webContents.executeJavaScript(
                    `(document.scrollingElement || document.documentElement).scrollTop`
                );
                newWin.savedScrollPosition = scrollY;
            } catch (e) { }
        }
    });

    const updateViewBounds = async (saveScroll = true, restoreScroll = true, updateBounds = true) => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            if (updateBounds) {
                const contentBounds = newWin.getContentBounds();
                view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
            }
            try { view.webContents.invalidate(); } catch (e) { }
            
            if (saveScroll) {
                try {
                    const scrollY = await view.webContents.executeJavaScript(
                        `(document.scrollingElement || document.documentElement).scrollTop`
                    );
                    newWin.savedScrollPosition = scrollY;
                } catch (e) { }
            }
            
            if (restoreScroll) {
                setTimeout(async () => {
                    if (view && !view.webContents.isDestroyed()) {
                        try {
                            await view.webContents.executeJavaScript(
                                `(document.scrollingElement || document.documentElement).scrollTop = ${newWin.savedScrollPosition};`
                            );
                        } catch (e) { }
                    }
                }, 100);
            }
        }
    };

    newWin.on('resize', () => {
        if (process.platform === 'linux') {
            updateViewBounds(true, true, true);
        }
    });

    newWin.on('resized', () => {
        updateViewBounds(false, true);
    });

    newWin.on('moved', () => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            const contentBounds = newWin.getContentBounds();
            if (contentBounds.width > 0 && contentBounds.height > 30) {
                view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                try { view.webContents.invalidate(); } catch (e) { }
            }
        }
    });

    newWin.on('will-resize', (event, newBounds) => {
        if (newWin && !newWin.isDestroyed()) {
            const view = newWin.getBrowserView();
            if (view && newBounds.width > 0 && newBounds.height > 30) {
                view.setBounds({ x: 0, y: 30, width: newBounds.width, height: newBounds.height - 30 });
                if (view.webContents && !view.webContents.isDestroyed()) {
                    try { view.webContents.invalidate(); } catch (e) { }
                }
            }
            if (view && !view.webContents.isDestroyed()) {
                view.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`)
                    .then(y => { newWin.savedScrollPosition = y; })
                    .catch(() => {});
            }
        }
    });

    newWin.on('maximize', () => {
        setTimeout(() => {
            if (newWin && !newWin.isDestroyed()) {
                const view = newWin.getBrowserView();
                if (view) {
                    const contentBounds = newWin.getContentBounds();
                    view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                    if (view.webContents && !view.webContents.isDestroyed()) {
                        try { view.webContents.invalidate(); } catch (e) { }
                    }
                }
            }
        }, 50);
    });

    newWin.on('unmaximize', () => {
        setTimeout(() => {
            if (newWin && !newWin.isDestroyed()) {
                const view = newWin.getBrowserView();
                if (view) {
                    const contentBounds = newWin.getContentBounds();
                    view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                    if (view.webContents && !view.webContents.isDestroyed()) {
                        try { view.webContents.invalidate(); } catch (e) { }
                    }
                }
            }
        }, 50);
    });

    newWin.on('focus', () => {
        setTimeout(() => {
            if (newWin && !newWin.isDestroyed()) {
                const view = newWin.getBrowserView();
                if (view) {
                    const contentBounds = newWin.getContentBounds();
                    view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                    if (view.webContents && !view.webContents.isDestroyed()) {
                        try { view.webContents.invalidate(); } catch (e) { }
                    }
                }
            }
        }, 50);
    });

    newWin.on('hide', () => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            view.webContents.setBackgroundThrottling(false);
        }
    });

    newWin.on('show', () => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            view.webContents.setBackgroundThrottling(false);
        }
    });

    if (state) {
        if (state.bounds) newWin.setBounds(state.bounds);
        const stateAccountIndex = typeof state.accountIndex === 'number'
            ? state.accountIndex
            : newWin.accountIndex;
        loadGemini(state.mode || settings.defaultMode, newWin, state.url, { accountIndex: stateAccountIndex });

        if (state.url && state.url !== GEMINI_URL && state.url !== AISTUDIO_URL) {
            console.log('Restoring window with specific chat URL:', state.url);
        }
    } else if (!settings.onboardingShown) {
        newWin.loadFile('onboarding.html');
    } else if (settings.defaultMode === 'ask') {
        newWin.loadFile('choice.html');
        const choiceSize = { width: 500, height: 450 };
        newWin.setResizable(false);
        newWin.setSize(choiceSize.width, choiceSize.height);
        newWin.center();
        applyAlwaysOnTopSetting(newWin, settings.alwaysOnTop);
        newWin.focus();
        newWin.show();
    } else {
        loadGemini(settings.defaultMode, newWin);
    }

    return newWin;
}

async function loadGemini(mode, targetWin, initialUrl, options = {}) {
    if (!targetWin || targetWin.isDestroyed()) return;

    targetWin.appMode = mode;
    updateWindowAppUserModelId(targetWin, mode);
    
    if (targetWin.webContents && !targetWin.webContents.isDestroyed()) {
        targetWin.webContents.send('app-mode-changed', mode);
    }
    
    const targetAccountIndex = typeof options.accountIndex === 'number'
        ? options.accountIndex
        : (typeof targetWin.accountIndex === 'number' ? targetWin.accountIndex : (settings.currentAccountIndex || 0));
    targetWin.accountIndex = targetAccountIndex;
    const partitionName = getAccountPartition(targetAccountIndex);

    if (options.resetSession) {
        try {
            const targetSession = session.fromPartition(partitionName, { cache: true });
            await targetSession.clearStorageData({ storages: ['cookies', 'localstorage', 'indexdb', 'serviceworkers'] });
        } catch (err) {
            console.warn('Failed to reset session for account', targetAccountIndex, err && err.message ? err.message : err);
        }
    }

    const url = initialUrl || (mode === 'aistudio' ? AISTUDIO_URL : GEMINI_URL);

    let loginWin = null;

    const createAndManageLoginWindow = async (loginUrl) => {
        if (loginWin && !loginWin.isDestroyed()) {
            loginWin.focus();
            return;
        }

        loginWin = new BrowserWindow({
            width: 700,
            height: 780,
            frame: true,
            autoHideMenuBar: true,
            alwaysOnTop: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                javascript: true,
                webSecurity: true,
                allowRunningInsecureContent: false,
                experimentalFeatures: false,
                userAgent: STABLE_USER_AGENT
            }
        });

        try {
            await loginWin.webContents.session.clearStorageData({
                storages: ['cookies', 'localstorage'],
                origins: ['https://accounts.google.com', 'https://google.com']
            });
        } catch (error) { }

        loginWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        setupContextMenu(loginWin.webContents);
        loginWin.loadURL(loginUrl);

        loginWin.on('closed', () => { loginWin = null; });

        loginWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
            const isLoginSuccess = navigatedUrl.startsWith(GEMINI_URL) || navigatedUrl.startsWith(AISTUDIO_URL);

            if (isLoginSuccess) {
                let sessionCookieFound = false;
                for (let i = 0; i < 20; i++) {
                    const criticalCookies = await loginWin.webContents.session.cookies.get({ name: '__Secure-1PSID' });
                    if (criticalCookies && criticalCookies.length > 0) {
                        sessionCookieFound = true;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                try {
                    const mainSession = session.fromPartition(partitionName);
                    const googleCookies = await loginWin.webContents.session.cookies.get({ domain: '.google.com' });

                    if (googleCookies.length > 0) {
                        for (const cookie of googleCookies) {
                            try {
                                const cookieUrl = `https://${cookie.domain.startsWith('.') ? 'www' : ''}${cookie.domain}${cookie.path}`;
                                const newCookie = {
                                    url: cookieUrl, name: cookie.name, value: cookie.value, path: cookie.path,
                                    secure: cookie.secure, httpOnly: cookie.httpOnly,
                                    expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
                                    session: false, sameSite: cookie.sameSite
                                };
                                if (!cookie.name.startsWith('__Host-')) newCookie.domain = cookie.domain;
                                await mainSession.cookies.set(newCookie);
                            } catch (e) { }
                        }
                    }

                    try { await mainSession.cookies.flushStore(); } catch (e) { }

                    try {
                        const profileInfo = await loginWin.webContents.executeJavaScript(`(function(){
                            try {
                                const a = document.querySelector('a.gb_B') || document.querySelector('a[aria-label^="Google Account:"]') || document.querySelector('.gb_z a');
                                const img = a && a.querySelector('img') ? (a.querySelector('img').src || null) : (document.querySelector('img.gbii') ? document.querySelector('img.gbii').src : null);
                                const aria = a ? a.getAttribute('aria-label') : (document.querySelector('a[aria-label^="Google Account:"]') ? document.querySelector('a[aria-label^="Google Account:"]') .getAttribute('aria-label') : null);
                                return { img, aria };
                            } catch(e){ return {}; }
                        })();`, true);

                        if (profileInfo && profileInfo.img) {
                            const idx = (settings && typeof settings.currentAccountIndex === 'number') ? settings.currentAccountIndex : 0;
                            await accountsModule.setProfileImageForAccount(idx, profileInfo.img).catch(() => {});
                            if (profileInfo.aria) {
                                const text = profileInfo.aria.replace(/^Google Account:\s*/i, '').trim();
                                const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
                                const email = lines[lines.length - 1] && lines[lines.length - 1].includes('@') ? lines[lines.length - 1] : null;
                                if (email) accountsModule.updateAccount(idx, { email, name: lines[0] || undefined });
                            }
                        }
                    } catch (e) { }

                    if (loginWin && !loginWin.isDestroyed()) loginWin.close();

                    BrowserWindow.getAllWindows().forEach(win => {
                        if (win && !win.isDestroyed() && (!loginWin || win.id !== loginWin.id)) {
                            const view = win.getBrowserView();
                            if (view && view.webContents && !view.webContents.isDestroyed()) view.webContents.reload();
                        }
                    });

                } catch (error) { }
            }
        });
    };

    const existingView = targetWin.getBrowserView();
    if (existingView && existingView.__accountPartition === partitionName) {
        existingView.webContents.loadURL(url);
        
        existingView.webContents.removeAllListeners('did-finish-load');
        existingView.webContents.removeAllListeners('did-navigate');
        existingView.webContents.removeAllListeners('did-navigate-in-page');

        existingView.webContents.on('did-finish-load', () => {
            const viewUrl = existingView.webContents.getURL() || '';
            if (viewUrl.startsWith('https://gemini.google.com') || viewUrl.startsWith('https://aistudio.google.com')) {
                maybeCaptureAccountProfile(newView, targetAccountIndex, options.forceProfileCapture);
                checkAndSendDefaultPrompt(existingView, viewUrl, mode);
            }
        });

        existingView.webContents.on('did-navigate', (event, url) => {
            checkAndSendDefaultPrompt(existingView, url, mode);
        });

        existingView.webContents.on('did-navigate-in-page', (event, url) => {
            checkAndSendDefaultPrompt(existingView, url, mode);
        });

        return;
    } else if (existingView) {
        try { targetWin.removeBrowserView(existingView); } catch (e) { }
        try { existingView.webContents.destroy(); } catch (e) { }
    }

    targetWin.loadFile('drag.html');

    const newView = new BrowserView({
        webPreferences: {
            partition: partitionName,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nativeWindowOpen: true,
            backgroundThrottling: false
        }
    });

    if (newView.webContents && newView.webContents.session) {
        setupSessionFilters(newView.webContents.session);
    }

    try {
        if (settings && settings.loadUnpackedExtension) {
            const viewSession = newView.webContents.session;
            await extensionsModule.loadExtensionToSession(viewSession, partitionName);
        }
    } catch (e) { }

    newView.webContents.setBackgroundThrottling(false);
    setupContextMenu(newView.webContents);

    newView.webContents.setWindowOpenHandler(({ url: popupUrl }) => {
        const isGoogleLogin = /^https:\/\/accounts\.google\.com\//.test(popupUrl);
        if (isGoogleLogin) {
            createAndManageLoginWindow(popupUrl);
            return { action: 'deny' };
        }
        shell.openExternal(popupUrl);
        return { action: 'deny' };
    });

    newView.webContents.on('will-navigate', async (event, navigationUrl) => {
        const isGoogleAccountUrl = /^https:\/\/accounts\.google\.com\//.test(navigationUrl);

        if (isGoogleAccountUrl) {
            event.preventDefault();
            const isSignOutUrl = navigationUrl.includes('/Logout');

            if (isSignOutUrl) {
                try {
                    const mainSession = session.fromPartition(partitionName);
                    await mainSession.clearStorageData({ storages: ['cookies', 'localstorage'] });
                    try { await mainSession.cookies.flushStore(); } catch (e) { }
                    if (newView && !newView.webContents.isDestroyed()) newView.webContents.reload();
                } catch (error) { }
            } else {
                await createAndManageLoginWindow(navigationUrl);
            }
        } else if (navigationUrl.startsWith('file://')) {
            event.preventDefault();
        }
    });

    newView.webContents.on('found-in-page', (event, result) => {
        if (event.sender && !event.sender.isDestroyed()) {
            event.sender.send('find-in-page-result', result);
        }
    });

    newView.webContents.on('before-input-event', (event, input) => {
        if (input.control || input.meta) {
            const currentZoom = newView.webContents.getZoomLevel();
            if (input.type === 'keyDown') {
                if (input.key === '=' || input.key === '+') {
                    event.preventDefault();
                    newView.webContents.setZoomLevel(currentZoom + 0.5);
                } else if (input.key === '-') {
                    event.preventDefault();
                    newView.webContents.setZoomLevel(currentZoom - 0.5);
                } else if (input.key === '0') {
                    event.preventDefault();
                    newView.webContents.setZoomLevel(0);
                }
            }
        }
    });

    newView.webContents.on('zoom-changed', (event, zoomDirection) => {
        const currentZoom = newView.webContents.getZoomLevel();
        if (zoomDirection === 'in') {
            newView.webContents.setZoomLevel(currentZoom + 0.5);
        } else if (zoomDirection === 'out') {
            newView.webContents.setZoomLevel(currentZoom - 0.5);
        }
    });

    newView.webContents.loadURL(url);
    newView.__defaultPromptSent = false;

    newView.webContents.on('did-finish-load', () => {
        const viewUrl = newView.webContents.getURL() || '';
        if (viewUrl.startsWith('https://gemini.google.com') || viewUrl.startsWith('https://aistudio.google.com')) {
            maybeCaptureAccountProfile(newView, targetAccountIndex, options.forceProfileCapture);
            checkAndSendDefaultPrompt(newView, viewUrl, mode);
        }
    });

    newView.webContents.on('did-navigate', (event, url) => {
        checkAndSendDefaultPrompt(newView, url, mode);
    });

    newView.webContents.on('did-navigate-in-page', (event, url) => {
        checkAndSendDefaultPrompt(newView, url, mode);
    });

    newView.__accountPartition = partitionName;
    targetWin.__accountPartition = partitionName;
    targetWin.setBrowserView(newView);

    const contentBounds = targetWin.getContentBounds();
    newView.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
    try { newView.webContents.invalidate(); } catch (e) { }
    newView.setAutoResize({ width: true, height: true });

    if (initialUrl && initialUrl !== GEMINI_URL && initialUrl !== AISTUDIO_URL) {
        const waitForTitleAndUpdate = async () => {
            let attempts = 0;
            while (attempts < 20) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const title = await newView.webContents.executeJavaScript(`(function(){ try { return document.title; } catch(e){ return 'Restored Chat'; } })();`, true);
                    if (title && title.trim() !== '') {
                        if (!targetWin.isDestroyed()) targetWin.webContents.send('update-title', title);
                        break;
                    }
                    attempts++;
                } catch (e) { attempts++; }
            }
        };
        newView.webContents.once('did-finish-load', () => { setTimeout(waitForTitleAndUpdate, 1000); });
        newView.webContents.on('did-navigate-in-page', waitForTitleAndUpdate);
    }

    if (!settings.shortcutsGlobal) {
        const localShortcuts = { ...settings.shortcuts };
        delete localShortcuts.showHide;
        const sendShortcuts = () => {
            if (!settings.shortcutsGlobal && newView.webContents && !newView.webContents.isDestroyed()) {
                newView.webContents.send('set-local-shortcuts', localShortcuts);
            }
        };
        sendShortcuts();
        newView.webContents.on('did-finish-load', sendShortcuts);
    }
}

// ================================================================= //
// Canvas Mode and Resizing
// ================================================================= //

const { setCanvasMode } = canvasResizeModule;

// ================================================================= //
// Theme Management
// ================================================================= //

function broadcastThemeChange(newTheme) {
    const themeToSend = newTheme === 'system'
        ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
        : newTheme;

    broadcastToAllWebContents('theme-updated', themeToSend);
}

function syncThemeWithWebsite(theme) {
    if (['light', 'dark', 'system'].includes(theme)) {
        nativeTheme.themeSource = theme;
    }
}

nativeTheme.on('updated', () => {
    if (settings.theme === 'system') {
        broadcastThemeChange('system');
    }
});

// ================================================================= //
// Notifications Management
// ================================================================= //

const {
    checkForNotifications,
    scheduleNotificationCheck,
    getNotificationWin
} = notificationsModule;

// ================================================================= //
// Update Management
// ================================================================= //

const {
    scheduleDailyUpdateCheck,
    sendUpdateStatus,
    openUpdateWindowAndCheck
} = updaterModule;

// ================================================================= //
// File Handling
// ================================================================= //

if (process.argv.length >= 2 && !process.argv[0].includes('electron')) {
    const potentialPath = process.argv[1];
    if (fs.existsSync(potentialPath)) {
        filePathToProcess = potentialPath;
    }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        let targetWin = BrowserWindow.getAllWindows().pop() || null;

        if (targetWin) {
            if (targetWin.isMinimized()) targetWin.restore();
            targetWin.focus();

            const potentialPath = commandLine.find(arg => fs.existsSync(arg));
            if (potentialPath) {
                handleFileOpen(potentialPath);
            }
        }
    });
}

function handleFileOpen(filePath) {
    let targetWin = BrowserWindow.getFocusedWindow();

    if (!targetWin) {
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length > 0) {
            targetWin = allWindows[allWindows.length - 1];
        }
    }

    if (!targetWin) {
        filePathToProcess = filePath;
        return;
    }

    const targetView = targetWin.getBrowserView();
    if (!targetView) {
        filePathToProcess = filePath;
        return;
    }

    try {
        if (!targetWin.isVisible()) targetWin.show();
        if (targetWin.isMinimized()) targetWin.restore();
        targetWin.setAlwaysOnTop(true);
        targetWin.focus();
        targetWin.moveTop();

        const ext = path.extname(filePath).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext)) {
            const image = nativeImage.createFromPath(filePath);
            clipboard.writeImage(image);
        } else {
            if (process.platform === 'win32') {
                const dropFilesStruct = Buffer.alloc(20);
                dropFilesStruct.writeUInt32LE(20, 0);
                dropFilesStruct.writeUInt32LE(1, 16);

                const utf16Path = filePath + '\0';
                const pathBuffer = Buffer.from(utf16Path, 'ucs2');

                const terminator = Buffer.from('\0\0', 'ucs2');

                const dropBuffer = Buffer.concat([dropFilesStruct, pathBuffer, terminator]);
                clipboard.writeBuffer('CF_HDROP', dropBuffer);

            } else {
                clipboard.write({ text: filePath });
            }
        }

        setTimeout(() => {
            if (targetWin && !targetWin.isDestroyed() && targetView && targetView.webContents) {
                targetView.webContents.focus();
                targetView.webContents.paste();
                setTimeout(() => {
                    if (targetWin && !targetWin.isDestroyed()) {
                        applyAlwaysOnTopSetting(targetWin, settings.alwaysOnTop);
                    }
                }, 200);
            }
            filePathToProcess = null;
        }, 300);

    } catch (error) {
        if (targetWin) {
            applyAlwaysOnTopSetting(targetWin, settings.alwaysOnTop);
        }
    }
}

// ================================================================= //
// App Lifecycle
// ================================================================= //

app.whenReady().then(() => {
    syncThemeWithWebsite(settings.theme);
    
    applyProxySettings();
    
    deepResearchModule.initialize({
        settings,
        createWindow,
        shortcutActions: shortcutsModule.shortcutActions,
        playAiCompletionSound
    });
    
    accountsModule.initialize({
        settings,
        saveSettings,
        tray: null,
        createWindow,
        Menu,
        broadcastToAllWebContents: utils.broadcastToAllWebContents
    });
    
    trayModule.initialize({
        createWindow,
        forceOnTop
    });
    
    tray = trayModule.createTray();
    accountsModule.setTray(tray);
    trayModule.setUpdateTrayCallback(updateTrayContextMenu);
    
    session.defaultSession.setSpellCheckerEnabled(true);
    session.defaultSession.setSpellCheckerLanguages(['en-US', 'he-IL', 'de-DE', 'fr-FR', 'es-ES', 'ru-RU', 'it-IT', 'pt-BR', 'nl-NL', 'pl-PL', 'tr-TR']);
    
    if (!settings.accounts || settings.accounts.length === 0) {
        addAccount('Default Account');
        settings.currentAccountIndex = 0;
        saveSettings(settings);
    }
    
    const gemSession = session.fromPartition(getCurrentAccountPartition());
    gemSession.setSpellCheckerEnabled(true);
    gemSession.setSpellCheckerLanguages(['en-US', 'he-IL', 'de-DE', 'fr-FR', 'es-ES', 'ru-RU', 'it-IT', 'pt-BR', 'nl-NL', 'pl-PL', 'tr-TR']);
    gemSession.setUserAgent(REAL_CHROME_UA);
    
    setupSessionFilters(session.defaultSession);
    setupSessionFilters(gemSession);
    
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
    app.commandLine.appendSwitch('disable-renderer-backgrounding');

    if (process.platform === 'darwin' && settings.alwaysOnTop) {
        app.dock.hide();
    }
    
    scheduleDeepResearchCheck();

    const hasPreUpdateWindows = settings.preUpdateWindowStates && Array.isArray(settings.preUpdateWindowStates) && settings.preUpdateWindowStates.length > 0;
    
    if (!hasPreUpdateWindows) {
        if (settings.restoreWindows && Array.isArray(settings.savedWindows) && settings.savedWindows.length) {
            settings.savedWindows.forEach(state => createWindow(state));
        } else {
            createWindow();
        }
    }

    const ses = session.defaultSession;
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'media') {
            callback(true);
        } else {
            callback(false);
        }
    });

    const preventWindowHiding = () => {
        const allWindows = BrowserWindow.getAllWindows();
        allWindows.forEach(win => {
            if (win && !win.isDestroyed() && win.isVisible()) {
                win.setAlwaysOnTop(true);
                setTimeout(() => {
                    if (win && !win.isDestroyed()) {
                        applyAlwaysOnTopSetting(win, settings.alwaysOnTop);
                    }
                }, 3000);
            }
        });
    };

    shortcutsModule.initialize({
        settings,
        clickMicrophoneButton: voiceAssistantModule.clickMicrophoneButton,
        createWindow,
        createNewChatWithModel,
        triggerSearch,
        setCanvasMode,
        reloadFocusedView,
        proceedWithScreenshot
    });

    registerShortcuts(broadcastToAllWebContents);
    if (settings.autoStart) {
        setAutoLaunch(true);
    }

    autoUpdater.autoDownload = false;
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.disableDifferentialDownload = true;

    let restoredFromUpdate = false;
    if (settings.preUpdateWindowStates && Array.isArray(settings.preUpdateWindowStates) && settings.preUpdateWindowStates.length > 0) {
        console.log('Restoring windows after update:', settings.preUpdateWindowStates.length, 'windows');
        restoredFromUpdate = true;
        
        setTimeout(() => {
            settings.preUpdateWindowStates.forEach((state, index) => {
                try {
                    createWindow(state);
                } catch (e) { }
            });
            
            settings.preUpdateWindowStates = null;
            saveSettings(settings);
        }, 1000);
    }
    
    updaterModule.checkAndShowPendingUpdateReminder();

    checkForNotifications();
    scheduleNotificationCheck();

    if (filePathToProcess) {
        const primaryWindow = BrowserWindow.getAllWindows()[0];
        if (primaryWindow) {
            const primaryView = primaryWindow.getBrowserView();
            if (primaryView) {
                primaryView.webContents.once('did-finish-load', () => {
                    setTimeout(() => {
                        handleFileOpen(filePathToProcess);
                    }, 1000);
                });
            }
        }
    }

    updaterModule.scheduleDailyUpdateCheck();
    
    if (!restoredFromUpdate && settings.preUpdateWindowStates) {
        settings.preUpdateWindowStates = null;
        saveSettings(settings);
    }
});

app.on('before-quit', () => {
    if (settings.restoreWindows) {
        const openWindows = BrowserWindow.getAllWindows().filter(w => !w.isDestroyed());
        settings.savedWindows = openWindows.map(w => {
            const view = w.getBrowserView();
            return {
                url: view && !view.webContents.isDestroyed() ? view.webContents.getURL() : null,
                bounds: w.getBounds(),
                mode: w.appMode || settings.defaultMode
            };
        });
    } else {
        settings.savedWindows = [];
    }
    saveSettings(settings);
});

app.on('will-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    mcpManagerModule.killProxy();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && process.platform !== 'linux' && process.platform !== 'win32') {
        app.quit();
    }
});

app.on('before-quit', async () => {
    try {
        const s = session.fromPartition(getCurrentAccountPartition());
        if (s && s.cookies && typeof s.cookies.flushStore === 'function') {
            await s.cookies.flushStore();
        } else if (s && typeof s.flushStorageData === 'function') {
            await s.flushStorageData();
        }
    } catch (e) { }
});

const { openMcpSetupWindow } = mcpManagerModule;
