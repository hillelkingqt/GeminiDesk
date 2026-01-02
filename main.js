const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain, dialog, screen, shell, session, nativeTheme, clipboard, nativeImage, Menu, Tray } = require('electron');

// Enable remote debugging port only if explicitly requested via flag or in dev mode
const isDebugMode = process.argv.includes('--debug-mode') || process.argv.includes('--remote-debugging-port');
if (isDebugMode) {
    try {
        if (!process.argv.includes('--remote-debugging-port')) {
            app.commandLine.appendSwitch('remote-debugging-port', '9222');
        }
        console.log('Remote debugging enabled on port 9222');
    } catch (e) {
        console.warn('Could not set chromium switches:', e && e.message ? e.message : e);
    }
}

// Reduce noisy Chromium/extension logs to avoid console spam
try {
    app.commandLine.appendSwitch('disable-logging');
    app.commandLine.appendSwitch('v', '0');
    app.commandLine.appendSwitch('log-level', '3'); // Fatal only
} catch (e) { }
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

// Path to unpacked extension root (must point to folder that contains manifest.json)
// In production (packaged app), use process.resourcesPath which points to resources/
// In dev, use __dirname which is the project root
// NOTE: This project ships the MCP SuperAssistant extension in `0.5.8_0`.
// The AI Studio RTL extension lives in `Ai-studio`.
const MCP_EXT_PATH = app.isPackaged
    ? path.join(process.resourcesPath, '0.5.8_0')
    : path.join(__dirname, '0.5.8_0');

const AISTUDIO_RTL_EXT_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'Ai-studio')
    : path.join(__dirname, 'Ai-studio');

const GEMINIMARK_EXT_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'geminimark')
    : path.join(__dirname, 'geminimark');

const TAMPERMONKEY_EXT_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'Tampermonkey')
    : path.join(__dirname, 'Tampermonkey');

// Track loaded extension IDs per label so we can attempt removal later
const loadedExtensions = new Map(); // label -> extensionId

async function loadExtensionToSession(sess, label, extensionPath) {
    try {
        if (!sess || typeof sess.loadExtension !== 'function') return null;
        const extPath = extensionPath || MCP_EXT_PATH;
        if (!fs.existsSync(extPath)) return null;
        const ext = await sess.loadExtension(extPath, { allowFileAccess: true });
        const id = ext && ext.id ? ext.id : (ext && ext.name ? ext.name : null);
        if (id) loadedExtensions.set(label, id);
        console.log(`Loaded extension into session (${label}) ->`, id || ext && ext.name || ext);
        return id;
    } catch (err) {
        console.warn(`Failed to load extension into session (${label}):`, err && err.message ? err.message : err);
        return null;
    }

}

async function loadAiStudioRtlExtensionToAllSessions() {
    try {
        if (!fs.existsSync(AISTUDIO_RTL_EXT_PATH)) return;

        // default
        await loadExtensionToSession(session.defaultSession, 'aistudio-rtl:default', AISTUDIO_RTL_EXT_PATH);

        // main app partition
        if (typeof constants !== 'undefined' && constants && constants.SESSION_PARTITION) {
            const mainPart = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
            await loadExtensionToSession(mainPart, `aistudio-rtl:${constants.SESSION_PARTITION}`, AISTUDIO_RTL_EXT_PATH);
        }

        // per-account partitions
        const s = getSettings();
        if (s && Array.isArray(s.accounts) && s.accounts.length > 0) {
            for (let i = 0; i < s.accounts.length; i++) {
                try {
                    const partName = accountsModule.getAccountPartition(i);
                    const accSess = session.fromPartition(partName, { cache: true });
                    await loadExtensionToSession(accSess, `aistudio-rtl:${partName}`, AISTUDIO_RTL_EXT_PATH);
                } catch (e) {
                    console.warn('Error loading AI Studio RTL extension into account partition', e && e.message ? e.message : e);
                }
            }
        }
    } catch (e) {
        console.warn('Error while loading AI Studio RTL extension into all sessions:', e && e.message ? e.message : e);
    }
}

async function loadGeminimarkExtensionToAllSessions() {
    try {
        if (!fs.existsSync(GEMINIMARK_EXT_PATH)) return;

        // default
        await loadExtensionToSession(session.defaultSession, 'geminimark:default', GEMINIMARK_EXT_PATH);

        // main app partition
        if (typeof constants !== 'undefined' && constants && constants.SESSION_PARTITION) {
            const mainPart = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
            await loadExtensionToSession(mainPart, `geminimark:${constants.SESSION_PARTITION}`, GEMINIMARK_EXT_PATH);
        }

        // per-account partitions
        const s = getSettings();
        if (s && Array.isArray(s.accounts) && s.accounts.length > 0) {
            for (let i = 0; i < s.accounts.length; i++) {
                try {
                    const partName = accountsModule.getAccountPartition(i);
                    const accSess = session.fromPartition(partName, { cache: true });
                    await loadExtensionToSession(accSess, `geminimark:${partName}`, GEMINIMARK_EXT_PATH);
                } catch (e) {
                    console.warn('Error loading geminimark extension into account partition', e && e.message ? e.message : e);
                }
            }
        }
    } catch (e) {
        console.warn('Error while loading geminimark extension into all sessions:', e && e.message ? e.message : e);
    }
}

async function loadTampermonkeyExtensionToAllSessions() {
    try {
        if (!fs.existsSync(TAMPERMONKEY_EXT_PATH)) return;

        // default
        await loadExtensionToSession(session.defaultSession, 'tampermonkey:default', TAMPERMONKEY_EXT_PATH);

        // main app partition
        if (typeof constants !== 'undefined' && constants && constants.SESSION_PARTITION) {
            const mainPart = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
            await loadExtensionToSession(mainPart, `tampermonkey:${constants.SESSION_PARTITION}`, TAMPERMONKEY_EXT_PATH);
        }

        // per-account partitions
        const s = getSettings();
        if (s && Array.isArray(s.accounts) && s.accounts.length > 0) {
            for (let i = 0; i < s.accounts.length; i++) {
                try {
                    const partName = accountsModule.getAccountPartition(i);
                    const accSess = session.fromPartition(partName, { cache: true });
                    await loadExtensionToSession(accSess, `tampermonkey:${partName}`, TAMPERMONKEY_EXT_PATH);
                } catch (e) {
                    console.warn('Error loading tampermonkey extension into account partition', e && e.message ? e.message : e);
                }
            }
        }
    } catch (e) {
        console.warn('Error while loading tampermonkey extension into all sessions:', e && e.message ? e.message : e);
    }
}

async function loadExtensionToAllSessions() {
    try {
        if (!fs.existsSync(MCP_EXT_PATH)) return;

        // default
        await loadExtensionToSession(session.defaultSession, 'default', MCP_EXT_PATH);

        // main app partition
        if (typeof constants !== 'undefined' && constants && constants.SESSION_PARTITION) {
            const mainPart = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
            await loadExtensionToSession(mainPart, constants.SESSION_PARTITION, MCP_EXT_PATH);
        }

        // per-account partitions
        const s = getSettings();
        if (s && Array.isArray(s.accounts) && s.accounts.length > 0) {
            for (let i = 0; i < s.accounts.length; i++) {
                try {
                    const partName = accountsModule.getAccountPartition(i);
                    const accSess = session.fromPartition(partName, { cache: true });
                    await loadExtensionToSession(accSess, partName, MCP_EXT_PATH);
                } catch (e) {
                    console.warn('Error loading extension into account partition', e && e.message ? e.message : e);
                }
            }
        }

        // sessions attached to existing BrowserViews
        const allWindows = BrowserWindow.getAllWindows();
        allWindows.forEach(win => {
            try {
                const view = win.getBrowserView();
                if (view && view.webContents && view.webContents.session) {
                    const label = `view:${win.id}`;
                    loadExtensionToSession(view.webContents.session, label, MCP_EXT_PATH).catch(() => { });
                }
            } catch (e) {
                // ignore
            }
        });
    } catch (e) {
        console.warn('Error while loading extension into all sessions:', e && e.message ? e.message : e);
    }
}

async function unloadLoadedExtensions() {
    try {
        for (const [label, extId] of Array.from(loadedExtensions.entries())) {
            try {
                // choose session to call removeExtension on
                if (label === 'default') {
                    if (typeof session.defaultSession.removeExtension === 'function') {
                        session.defaultSession.removeExtension(extId);
                        console.log('Removed extension', extId, 'from default session');
                    }
                } else if (label === constants.SESSION_PARTITION) {
                    const part = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
                    if (part && typeof part.removeExtension === 'function') {
                        part.removeExtension(extId);
                        console.log('Removed extension', extId, 'from partition', constants.SESSION_PARTITION);
                    }
                } else if (label.startsWith('persist:') || label.startsWith('view:')) {
                    // attempt to remove from partition named label
                    try {
                        const part = session.fromPartition(label, { cache: true });
                        if (part && typeof part.removeExtension === 'function') {
                            part.removeExtension(extId);
                            console.log('Removed extension', extId, 'from partition', label);
                        }
                    } catch (e) {
                        // fallback: try defaultSession removal
                        if (typeof session.defaultSession.removeExtension === 'function') {
                            try { session.defaultSession.removeExtension(extId); } catch (ee) { }
                        }
                    }
                } else if (label.startsWith('view:')) {
                    // handled above
                }
                loadedExtensions.delete(label);
            } catch (e) {
                console.warn('Failed to remove extension', extId, 'for', label, e && e.message ? e.message : e);
            }
        }
    } catch (e) {
        console.warn('Error unloading extensions:', e && e.message ? e.message : e);
    }
}


// ================================================================= //
// Import Modular Components
// ================================================================= //

const settingsModule = require('./modules/settings');
const constants = require('./modules/constants');
const utils = require('./modules/utils');
const deepResearchModule = require('./modules/deep-research');
const accountsModule = require('./modules/accounts');
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

    // DON'T clear storage - keep existing login sessions
    // This allows users to have multiple accounts logged in simultaneously
    // and avoids requiring 2FA on every login
    console.log('Account login window created - existing sessions preserved.');

    tempWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    setupContextMenu(tempWin.webContents);
    tempWin.loadURL(loginUrl);

    tempWin.on('closed', () => { tempWin = null; });

    tempWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
        // Treat both the canonical GEMINI_URL and URLs like
        // https://gemini.google.com/u/1/app as successful navigation.
        const isGeminiWithUserPath = /\/u\/\d+\/app(\/.*)?$/.test(navigatedUrl);
        const isLoginSuccess = navigatedUrl.startsWith(GEMINI_URL) || navigatedUrl.startsWith(AISTUDIO_URL) || isGeminiWithUserPath;
        console.log('Login popup navigated to:', navigatedUrl);
        if (!isLoginSuccess) return;

        const isolatedSession = tempWin.webContents.session;
        try {
            const preCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
            console.log('Login popup - initial .google.com cookies count:', (preCookies && preCookies.length) || 0, 'names:', (preCookies || []).map(c => c.name));
        } catch (e) {
            console.warn('Error reading initial cookies from popup session:', e && e.message ? e.message : e);
        }
        let sessionCookieFound = false;
        // If the popup navigated to a user-specific Gemini path (e.g. /u/1/app)
        // then proceed immediately — some flows don't set cookies in the
        // isolated popup even though the sign-in completed elsewhere.
        if (isGeminiWithUserPath) {
            sessionCookieFound = true;
        } else {
            // Wait until any Google cookies appear in the isolated session.
            // Some sign-in flows may set different cookie names, so checking
            // for any cookies under the Google domain is more reliable than
            // looking for a single cookie name.
            for (let i = 0; i < 20; i++) {
                const criticalCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
                if (criticalCookies && criticalCookies.length > 0) { sessionCookieFound = true; break; }
                await new Promise(r => setTimeout(r, 500));
            }
        }

        // If we didn't observe a critical session cookie, it likely means the
        // user hasn't completed the sign-in flow yet (for example they only
        // provided the email and haven't entered the password). In that case
        // normally don't proceed to transfer cookies and close the temporary
        // login window — leave it open so the user can finish authentication.
        // However, when adding a second (or later) account, the popup may
        // navigate to the Gemini URL without creating new cookies in the
        // popup session (cookies may already exist in the default session).
        // In that specific case we should attempt the transfer/close so the
        // add-account flow completes instead of leaving the popup stuck.
        if (!sessionCookieFound) {
            const currentSettings = (typeof getSettings === 'function') ? getSettings() : null;
            const hasExistingAccounts = currentSettings && Array.isArray(currentSettings.accounts) && currentSettings.accounts.length > 0;
            if (!hasExistingAccounts) {
                console.log('Partitioned login: no critical session cookie found; keeping login window open to allow user to finish sign-in');
                try {
                    const afterCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
                    console.log('Login popup - cookies after wait count:', (afterCookies && afterCookies.length) || 0, 'names:', (afterCookies || []).map(c => c.name));
                } catch (e) { }
                return;
            }
            console.log('Partitioned login: no new cookies detected but existing accounts present — proceeding to attempt transfer/close for multi-account add');
        }

        try {
            const mainSession = session.fromPartition(targetPartition);
            const googleCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
            console.log('Partitioned login: transferring', googleCookies.length, '.google.com cookies to', targetPartition);
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

            try { await mainSession.cookies.flushStore(); } catch (e) { }

            // Extract profile image and account label from the loaded page
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
                    // Save profile image for the new account
                    await accountsModule.setProfileImageForAccount(accountIndex, profileInfo.img).catch(() => { });
                    // Try to parse email/name from aria text like "Google Account: Name\n(email)"
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
                // Set the newly added account as the current account so the
                // choice window highlights it. Persist settings immediately.
                if (typeof settings !== 'undefined') {
                    settings.currentAccountIndex = accountIndex;
                    try { saveSettings(settings); } catch (e) { console.warn('Failed to save settings after adding account', e); }
                }

                // If the login popup navigated to a Gemini URL (possibly with /u/X/app),
                // open or load a window using the new account partition so the user
                // sees the newly added account immediately instead of just reloading.
                try {
                    const mode = (navigatedUrl && navigatedUrl.startsWith(AISTUDIO_URL)) ? 'aistudio' : 'gemini';
                    let targetWindow = BrowserWindow.getAllWindows().find(w => w.accountIndex === accountIndex && !w.isDestroyed());
                    if (targetWindow) {
                        try { loadGemini(mode, targetWindow, navigatedUrl, { accountIndex }); }
                        catch (e) { console.warn('Failed to load gemini into existing window for new account:', e); }
                    } else {
                        try {
                            const newWin = accountsModule.createWindowWithAccount(accountIndex);
                            if (newWin && !newWin.isDestroyed()) {
                                loadGemini(mode, newWin, navigatedUrl, { accountIndex });
                            }
                        } catch (e) {
                            console.warn('Failed to create window for new account:', e && e.message ? e.message : e);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to open/load window for new account after login:', e && e.message ? e.message : e);
                }

                // Open the choice window (the small Alt+N style chooser)
                try {
                    const choiceWin = createWindow();
                    if (choiceWin && !choiceWin.isDestroyed()) {
                        try {
                            choiceWin.loadFile('html/choice.html');
                            const choiceSize = { width: 500, height: 450 };
                            choiceWin.setResizable(false);
                            choiceWin.setSize(choiceSize.width, choiceSize.height);
                            choiceWin.center();
                            choiceWin.setAlwaysOnTop(true, 'floating');
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

            // Only reload windows that use this specific account
            // This allows different windows to use different accounts independently
            BrowserWindow.getAllWindows().forEach(win => {
                if (win && !win.isDestroyed()) {
                    // Only reload if this window uses the same account
                    if (win.accountIndex === accountIndex || (!win.accountIndex && accountIndex === 0)) {
                        const view = win.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            console.log(`Reloading window ${win.id} for account ${accountIndex}`);
                            view.webContents.reload();
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error during partitioned login handling:', error);
        }
    });
}
app.whenReady().then(async () => {
    // Conditionally load unpacked extension if user enabled it in settings
    try {
        const localSettings = settingsModule.getSettings();
        if (!localSettings || !localSettings.loadUnpackedExtension) {
            console.log('loadUnpackedExtension is disabled in settings - skipping automatic extension load at startup');
            return;
        }
        await loadExtensionToAllSessions();
    } catch (e) {
        console.error('Failed during conditional extension load at startup:', e && e.message ? e.message : e);
    }
});

// Always load the AI Studio RTL extension (it self-disables based on GeminiDesk settings via cookie/messages).
app.whenReady().then(async () => {
    try {
        await loadAiStudioRtlExtensionToAllSessions();
    } catch (e) {
        console.warn('Failed loading AI Studio RTL extension at startup:', e && e.message ? e.message : e);
    }
});

// Always load the geminimark renderer extension so its content script is available in Gemini pages.
app.whenReady().then(async () => {
    try {
        await loadGeminimarkExtensionToAllSessions();
    } catch (e) {
        console.warn('Failed loading geminimark extension at startup:', e && e.message ? e.message : e);
    }
});

// Always load the Tampermonkey (Lyra Loader) extension.
app.whenReady().then(async () => {
    try {
        await loadTampermonkeyExtensionToAllSessions();
    } catch (e) {
        console.warn('Failed loading Tampermonkey extension at startup:', e && e.message ? e.message : e);
    }
});

// ================================================================= //
// Main App Lifecycle Events
// ================================================================= //

app.on('window-all-closed', () => {
    // On macOS, applications and their menu bar stay active until the user quits
    // explicitly with Cmd + Q. On other platforms, applications usually quit.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(() => {
    const menu = createApplicationMenu();
    Menu.setApplicationMenu(menu);
});

const trayModule = require('./modules/tray');

// ================================================================= //
// Global Constants and Configuration
// ================================================================= //

app.disableHardwareAcceleration();

// Use constants from module
const { REAL_CHROME_UA, STABLE_USER_AGENT, SESSION_PARTITION, GEMINI_URL, AISTUDIO_URL, isMac, execPath, launcherPath, margin, originalSize, canvasSize } = constants;

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
let pieMenuWin = null;

let updateWin = null;
let installUpdateWin = null;
let notificationWin = null;
let personalMessageWin = null;
let lastFetchedMessageId = null;
let filePathToProcess = null;
let notificationIntervalId = null;
let agentProcess = null;
let tray = null;
let mcpProxyProcess = null; // Background MCP proxy process

// ================================================================= //
// Security: Content Security Policy (CSP)
// ================================================================= //
app.on('web-contents-created', (event, contents) => {
    // Determine the source of the content to apply appropriate policies
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        // specific validation...
    });

    // Prevent new window creation from untrusted sources if not handled separately
    contents.setWindowOpenHandler(({ url }) => {
        // ... validation logic is mostly handled in specific window creation checks
        // but a global safe default is good.
        if (url.startsWith('https://')) return { action: 'allow' };
        return { action: 'deny' };
    });
});

// Apply CSP headers
app.whenReady().then(() => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    // Relaxed CSP to allow external images/scripts needed by Gemini/AI Studio
                    // script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; - needed for complex apps like Gemini
                    "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:;"
                ]
            }
        });
    });
});

// Track active screenshot-on-send mode per window ID
const screenshotSendModeActive = new Map();

const detachedViews = new Map();
const PROFILE_CAPTURE_COOLDOWN_MS = 60 * 1000;
const PROFILE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const UPDATE_REMINDER_DELAY_MS = 60 * 60 * 1000; // 1 hour
const UPDATER_INITIALIZATION_DELAY_MS = 5 * 1000; // 5 seconds
const UPDATE_FOUND_DISPLAY_DURATION_MS = 1500; // 1.5 seconds - how long to show "update available" message before starting download
const MAX_UPDATE_CHECK_RETRIES = 3; // Maximum retries for update check when reminder is pending
const profileCaptureTimestamps = new Map();
let avatarDirectoryPath = null;

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
            if (updatedAccount) {
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

/**
 * Execute default prompt in a new chat - inserts text and clicks send button
 * Uses the same approach as deep-research.js for reliable text insertion
 */
async function executeDefaultPrompt(view, promptContent, mode) {
    if (!view || view.webContents.isDestroyed()) {
        console.log('Prompt Manager: View not available, skipping auto-prompt');
        return;
    }

    const script = `
    (async function() {
        console.log('Prompt Manager: Starting auto-prompt insertion');
        
        const waitForElement = (selector, timeout = 15000) => {
            return new Promise((resolve, reject) => {
                const timer = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element && !element.disabled && element.offsetParent !== null) {
                        clearInterval(timer);
                        resolve(element);
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(timer);
                    reject(new Error('Element not found: ' + selector));
                }, timeout);
            });
        };

        const simulateClick = (element) => {
            ['mousedown', 'mouseup', 'click'].forEach(type => {
                const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                element.dispatchEvent(event);
            });
        };

        const insertTextSafely = (element, text) => {
            try {
                element.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('delete', false, null);
                document.execCommand('insertText', false, text);
                console.log('Prompt Manager: Text inserted using execCommand');
                return true;
            } catch (e) {
                console.log('Prompt Manager: execCommand failed, trying alternative');
            }

            try {
                element.focus();
                element.textContent = text;
                element.dispatchEvent(new InputEvent('input', {
                    data: text, inputType: 'insertText', bubbles: true, cancelable: true
                }));
                console.log('Prompt Manager: Text inserted using textContent');
                return true;
            } catch (e) {
                console.log('Prompt Manager: All text insertion methods failed');
                return false;
            }
        };

        try {
            console.log('Prompt Manager: Looking for input area');
            const inputArea = await waitForElement('.ql-editor[contenteditable="true"], rich-textarea .ql-editor, [data-placeholder*="Ask"]');
            
            const promptText = \`${promptContent.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\${/g, '\\${')}\`;
            
            console.log('Prompt Manager: Inserting prompt text...');
            const insertSuccess = insertTextSafely(inputArea, promptText);
            
            if (!insertSuccess) {
                throw new Error('Failed to insert prompt text');
            }
            
            console.log('Prompt Manager: Prompt inserted successfully');
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Prompt Manager: Looking for Send button');
            const sendButton = await waitForElement('button.send-button[jslog*="173899"], button[aria-label="Send message"], button.send-button.submit, button[data-test-id="send-button"]');
            simulateClick(sendButton);
            console.log('Prompt Manager: Send button clicked');
            
            return { success: true };
        } catch (error) {
            console.error('Prompt Manager: Auto-prompt failed:', error);
            return { success: false, error: error.message };
        }
    })();
    `;

    try {
        const result = await view.webContents.executeJavaScript(script);
        if (result.success) {
            console.log('Prompt Manager: Default prompt sent successfully');
        } else {
            console.error('Prompt Manager: Failed to send default prompt:', result.error);
        }
    } catch (error) {
        console.error('Prompt Manager: Script execution failed:', error);
    }
}

// ================================================================= //
// Settings Management (Using Module)
// ================================================================= //

const { getSettings, saveSettings, defaultSettings, settingsPath } = settingsModule;
let settings = getSettings();

// Helper function to apply invisibility mode (content protection) to a window
// This hides the window from screen capture/sharing apps like Zoom, Teams, Discord
// Also hides from taskbar/Alt+Tab when invisibility mode is enabled
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
 * 
 * On macOS, this function uses special configuration to ensure the window appears
 * on top of fullscreen applications by calling setVisibleOnAllWorkspaces with
 * visibleOnFullScreen option and setting the alwaysOnTop level to 'floating'.
 * 
 * On other platforms (Windows, Linux), it simply calls setAlwaysOnTop with the
 * boolean value.
 * 
 * @param {BrowserWindow} win - The Electron BrowserWindow to apply the setting to
 * @param {boolean} shouldBeOnTop - Whether the window should be always on top
 */
function applyAlwaysOnTopSetting(win, shouldBeOnTop) {
    if (!win || win.isDestroyed()) return;
    try {
        if (process.platform === 'darwin') {
            if (shouldBeOnTop) {
                // macOS-specific configuration for fullscreen window support
                win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
                win.setAlwaysOnTop(true, 'floating');
            } else {
                // Disable alwaysOnTop and restore normal workspace behavior
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

// Initialize utils module with settings
utils.initialize({ settings });

// --- Ensure extension is loaded into account partitions (if any) ---
(async () => {
    try {
        const extPath = path.join(__dirname, '0.5.8_0');
        if (!fs.existsSync(extPath)) return;
        if (!settings || !settings.loadUnpackedExtension) {
            console.log('Skipping loading extension into account partitions (user disabled loadUnpackedExtension)');
            return;
        }

        // If there are accounts defined in settings, load the extension into each account partition
        if (settings && Array.isArray(settings.accounts) && settings.accounts.length > 0) {
            for (let i = 0; i < settings.accounts.length; i++) {
                try {
                    const partName = accountsModule.getAccountPartition(i);
                    const accSession = session.fromPartition(partName, { cache: true });
                    if (accSession && typeof accSession.loadExtension === 'function') {
                        await accSession.loadExtension(extPath, { allowFileAccess: true });
                        console.log(`Loaded extension into account partition: ${partName}`);
                    } else {
                        console.warn(`Session for partition ${partName} does not support loadExtension`);
                    }
                } catch (err) {
                    console.warn(`Failed to load extension into account partition index ${i}:`, err && err.message ? err.message : err);
                }
            }
        }
    } catch (e) {
        console.warn('Error while attempting to load extension into account partitions:', e && e.message ? e.message : e);
    }
})();

// ================================================================= //
// Auto Launch Configuration
// ================================================================= //

const autoLauncher = new AutoLaunch({
    name: 'GeminiApp',
    path: launcherPath,
    isHidden: true,
});

function setAutoLaunch(shouldEnable) {
    if (shouldEnable) {
        autoLauncher.enable();
    } else {
        autoLauncher.disable();
    }
}

/**
 * Apply proxy settings to all browser sessions.
 * Supports HTTP, HTTPS, and SOCKS5 proxies.
 */
async function applyProxySettings() {
    const proxyEnabled = settings.proxyEnabled || false;
    const proxyUrl = settings.proxyUrl || '';

    let proxyConfig = {};

    if (proxyEnabled && proxyUrl) {
        // Parse proxy URL to determine protocol
        // Supports: http://host:port, https://host:port, socks5://host:port
        proxyConfig = {
            proxyRules: proxyUrl
            // No bypass rules - proxy applies to all URLs
        };
        console.log(`Applying proxy settings: ${proxyUrl}`);
    } else {
        // Disable proxy (use direct connection)
        proxyConfig = {
            proxyRules: 'direct://'
        };
        console.log('Proxy disabled, using direct connection');
    }

    try {
        // Apply to default session
        await session.defaultSession.setProxy(proxyConfig);

        // Apply to all partitioned sessions (accounts)
        const accounts = settings.accounts || [];
        for (let i = 0; i < accounts.length; i++) {
            const partition = accountsModule.getAccountPartition(i);
            const accountSession = session.fromPartition(partition);
            await accountSession.setProxy(proxyConfig);
        }

        console.log('Proxy settings applied successfully to all sessions');
    } catch (error) {
        console.error('Failed to apply proxy settings:', error);
    }
}

// ================================================================= //
// Deep Research Schedule Functions (Using Module)
// ================================================================= //

const { scheduleDeepResearchCheck, checkAndExecuteScheduledResearch, executeScheduledDeepResearch } = deepResearchModule;

// ================================================================= //
// Multi-Account Support (Using Module)
// ================================================================= //

const { getAccountPartition, getCurrentAccountPartition, getAccounts, addAccount, switchAccount, createWindowWithAccount, updateTrayContextMenu, updateAccountMetadata } = accountsModule;

// ================================================================= //
// System Tray Icon (Using Module)
// ================================================================= //

// Tray will be created in app.whenReady()

// ================================================================= //
// Utility Functions (Using Module)
// ================================================================= //

const { forceOnTop, broadcastToAllWebContents, broadcastToWindows, reportErrorToServer, playAiCompletionSound, setupContextMenu, debounce, sendNotification } = utils;

// Debounced version of saveSettings to prevent race conditions with rapid updates
const debouncedSaveSettings = debounce((settingsToSave) => {
    saveSettings(settingsToSave);
    console.log('Settings saved via debounce');
}, 300);

// ================================================================= //
// Icon Path Helper
// ================================================================= //

/**
 * Get the correct icon path for both dev and production
 * In production (packaged app), the icon is in extraResources
 * In dev, it's in the __dirname
 */
function getIconPath() {
    if (app.isPackaged) {
        // Production: icon is in extraResources folder
        return path.join(process.resourcesPath, 'icons', 'icon.ico');
    } else {
        // Development: icon is in project root
        return path.join(__dirname, 'icons', 'icon.ico');
    }
}

// ================================================================= //
// Taskbar Grouping for Gemini vs AI Studio Windows
// ================================================================= //

// Different AppUserModelIds for taskbar grouping (Windows only)
const GEMINI_APP_USER_MODEL_ID = 'com.geminidesk.gemini';
const AISTUDIO_APP_USER_MODEL_ID = 'com.geminidesk.aistudio';

/**
 * Update the window's AppUserModelId to group windows by app mode in the taskbar.
 * On Windows, this separates Gemini windows from AI Studio windows in the taskbar.
 * @param {BrowserWindow} win - The window to update
 * @param {string} mode - 'gemini' or 'aistudio'
 */
function updateWindowAppUserModelId(win, mode) {
    if (process.platform !== 'win32') return; // Only relevant on Windows

    try {
        const appId = mode === 'aistudio' ? AISTUDIO_APP_USER_MODEL_ID : GEMINI_APP_USER_MODEL_ID;
        // Set the AppUserModelId for this specific window
        // Use the same icon for both modes
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

    // Remove restrictive CSP headers for AI Studio
    sess.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = details.responseHeaders || {};

        // Remove or modify CSP headers that block resources
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

// Helper function to click microphone button
async function clickMicrophoneButton(targetWin, view) {
    const script = `
        (async function() {
            console.log('Voice Assistant: Looking for microphone button...');
            
            const waitForElement = (selector, timeout = 5000) => {
                return new Promise((resolve, reject) => {
                    const timer = setInterval(() => {
                        const element = document.querySelector(selector);
                        if (element && !element.disabled && element.offsetParent !== null) {
                            clearInterval(timer);
                            resolve(element);
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(timer);
                        reject(new Error('Element not found: ' + selector));
                    }, timeout);
                });
            };
            
            const simulateClick = (element) => {
                ['mousedown', 'mouseup', 'click'].forEach(type => {
                    const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                    element.dispatchEvent(event);
                });
            };
            
            try {
                // Find the microphone button using multiple selectors
                const micSelectors = [
                    'button[aria-label*="microphone" i]',
                    'button[aria-label*="mic" i]',
                    'button.speech_dictation_mic_button',
                    'speech-dictation-mic-button button',
                    '.mic-button-container button',
                    'button[data-node-type="speech_dictation_mic_button"]'
                ];
                
                let micButton = null;
                for (const selector of micSelectors) {
                    try {
                        micButton = await waitForElement(selector, 1000);
                        if (micButton) {
                            console.log('Voice Assistant: Found mic button with selector:', selector);
                            break;
                        }
                    } catch (e) {
                        // Try next selector
                    }
                }
                
                if (!micButton) {
                    throw new Error('Could not find microphone button');
                }
                
                // Click the microphone button
                simulateClick(micButton);
                console.log('Voice Assistant: Clicked microphone button successfully!');
                
                return { success: true };
                
            } catch (error) {
                console.error('Voice Assistant Error:', error);
                return { success: false, error: error.message };
            }
        })();
    `;

    try {
        const result = await view.webContents.executeJavaScript(script);
        if (result.success) {
            console.log('Voice Assistant activated successfully!');
        } else {
            console.error('Voice Assistant failed:', result.error);
        }
    } catch (error) {
        console.error('Voice Assistant script execution failed:', error);
    }
}

const shortcutActions = {
    quit: () => app.quit(),
    closeWindow: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            const allWindows = BrowserWindow.getAllWindows();
            if (allWindows.length > 1) {
                focusedWindow.close();
            } else {
                focusedWindow.hide();
            }
        }
    },
    voiceAssistant: async () => {
        console.log('Voice Assistant activated!');

        // FIRST: Use the exact same showHide logic to show windows (like Alt+G)
        const allWindows = BrowserWindow.getAllWindows();
        const userWindows = allWindows.filter(w => !w.__internal);

        if (userWindows.length === 0) {
            // No windows, create one and wait for it to be ready
            const newWin = createWindow();
            await new Promise(resolve => {
                const checkView = () => {
                    const view = newWin.getBrowserView();
                    if (view && !view.webContents.isDestroyed() && view.webContents.getURL()) {
                        setTimeout(() => clickMicrophoneButton(newWin, view), 1000);
                        resolve();
                    } else {
                        setTimeout(checkView, 200);
                    }
                };
                checkView();
            });
            return;
        }

        // Check if windows are hidden - same logic as showHide shortcut
        const shouldShow = userWindows.some(win => !win.isVisible());

        if (!shouldShow) {
            // If windows are already visible, we still need to focus them
            const focused = userWindows.find(w => w.isFocused());
            lastFocusedWindow = focused && !focused.isDestroyed() ? focused : userWindows[0];
        } else {
            // Show/restore windows (exactly like Alt+G does)
            userWindows.forEach(win => {
                if (win.isMinimized()) win.restore();
                win.show();
            });

            const focused = userWindows.find(w => w.isFocused());
            lastFocusedWindow = (focused && !focused.isDestroyed())
                ? focused
                : (userWindows[0] || null);

            if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
                setTimeout(() => {
                    forceOnTop(lastFocusedWindow);
                    const view = lastFocusedWindow.getBrowserView();
                    if (view && view.webContents && !view.webContents.isDestroyed()) {
                        view.webContents.focus();
                    }
                }, 100);
            }
        }

        // Wait for window to be fully visible and focused
        await new Promise(resolve => setTimeout(resolve, shouldShow ? 1200 : 300));

        // NOW click the microphone on the target window
        const targetWin = lastFocusedWindow || userWindows[0];
        if (!targetWin || targetWin.isDestroyed()) {
            console.error('No target window available for voice assistant');
            return;
        }

        const view = targetWin.getBrowserView();
        if (!view || view.webContents.isDestroyed()) {
            console.error('No browser view available for voice assistant');
            return;
        }

        // Ensure the target window is focused and on top
        if (!targetWin.isVisible()) targetWin.show();
        if (targetWin.isMinimized()) targetWin.restore();
        targetWin.focus();

        await clickMicrophoneButton(targetWin, view);
    },
    findInPage: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            const view = focusedWindow.getBrowserView();
            if (view && !view.webContents.isDestroyed()) {
                view.webContents.send('show-find-bar');
            }
        }
    },
    newWindow: () => createWindow(),
    newChat: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat');
        } else {
            // Open new chat - Robust Version with Navigation Fallback
            const script = `
                (async function() {
                    console.log('GeminiDesk: Executing New Chat command');
                    
                    const waitForElement = (selector, timeout = 1000) => {
                        return new Promise((resolve) => {
                            const interval = setInterval(() => {
                                const el = document.querySelector(selector);
                                if (el && !el.disabled && el.offsetParent !== null) { 
                                    clearInterval(interval);
                                    resolve(el);
                                }
                            }, 100);
                            setTimeout(() => {
                                clearInterval(interval);
                                resolve(null);
                            }, timeout);
                        });
                    };

                    const simulateClick = (element) => {
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
                        });
                    };

                    // Selectors for the New Chat button
                    const selectors = [
                        'button[aria-label="New chat"]',
                        'button[aria-label="Create new chat"]',
                        '[data-test-id="new-chat-button"] button', 
                        '[data-test-id="new-chat-button"]',
                        '.chat-history-new-chat-button',
                        'button.new-chat-button' // Generic guess
                    ];

                    // 1. Try to find the button directly
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el && !el.disabled && el.offsetParent !== null) {
                            console.log('GeminiDesk: Found New Chat button directly:', sel);
                            simulateClick(el);
                            return;
                        }
                    }

                    // 2. If not found, try to open the main menu
                    console.log('GeminiDesk: Button not visible, trying menu toggle...');
                    const menuButton = document.querySelector('button[aria-label="Main menu"]') || 
                                       document.querySelector('button[aria-label="Expand menu"]');
                    
                    if (menuButton) {
                        simulateClick(menuButton);
                        // Wait for menu animation
                        for (const sel of selectors) {
                            const newChatButton = await waitForElement(sel, 1000);
                            if (newChatButton) {
                                console.log('GeminiDesk: Found button after menu toggle:', sel);
                                simulateClick(newChatButton);
                                return;
                            }
                        }
                    }

                    // 3. FALLBACK: Direct Navigation
                    // If UI interaction failed, force load the new chat URL
                    console.log('GeminiDesk: UI interaction failed. forcing navigation to /app');
                    window.location.href = 'https://gemini.google.com/app';
                })();
            `;
            view.webContents.executeJavaScript(script).catch(err => {
                console.error('Failed to execute new chat script:', err);
                // Last resort fallback from main process
                view.webContents.loadURL('https://gemini.google.com/app');
            });
        }
    },
    changeModelPro: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            // For AI Studio, open model selector and click Pro model
            const script = `
                (async function() {
                    const waitForElement = (selector, timeout = 5000) => {
                        return new Promise((resolve, reject) => {
                            const timer = setInterval(() => {
                                const element = document.querySelector(selector);
                                if (element && !element.disabled && element.offsetParent !== null) {
                                    clearInterval(timer);
                                    resolve(element);
                                }
                            }, 100);
                            setTimeout(() => {
                                clearInterval(timer);
                                reject(new Error('Element not found: ' + selector));
                            }, timeout);
                        });
                    };

                    const simulateClick = (element) => {
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                            element.dispatchEvent(event);
                        });
                    };

                    try {
                        // Step 1: Click the settings toggle button
                        const toggleButton = await waitForElement('button[aria-label="Toggle run settings panel"], button[iconname="tune"]');
                        simulateClick(toggleButton);
                        console.log('AI Studio: Clicked settings toggle');
                        
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Step 2: Click the model selector card
                        const modelSelector = await waitForElement('button.model-selector-card, ms-model-selector-v3 button');
                        simulateClick(modelSelector);
                        console.log('AI Studio: Clicked model selector');
                        
                        await new Promise(resolve => setTimeout(resolve, 800));

                        // Step 3: Click the Pro model
                        const proModel = await waitForElement('ms-model-carousel-row button[id*="gemini-3-pro-preview"], ms-model-carousel-row button[id*="gemini-2.5-pro"], ms-model-carousel-row button[id*="gemini-pro"]');
                        simulateClick(proModel);
                        console.log('AI Studio: Selected Pro model');
                        
                        // Wait a bit and close the model selection panel
                        await new Promise(resolve => setTimeout(resolve, 400));
                        const closeModelPanel = await waitForElement('button[aria-label="Close panel"][mat-dialog-close], button[data-test-close-button][iconname="close"]', 3000);
                        simulateClick(closeModelPanel);
                        console.log('AI Studio: Closed model selection panel');
                        
                        // Wait and close the settings panel
                        await new Promise(resolve => setTimeout(resolve, 300));
                        try {
                            const closeSettingsPanel = await waitForElement('button[aria-label="Close run settings panel"][iconname="close"]', 3000);
                            simulateClick(closeSettingsPanel);
                            console.log('AI Studio: Closed settings panel');
                        } catch (e) {
                            console.log('AI Studio: Could not find close settings button (might be already closed or changed):', e.message);
                        }
                        
                    } catch (error) {
                        console.error('AI Studio: Failed to change to Pro model:', error);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).catch(console.error);
        } else {
            createNewChatWithModel('Pro');
        }
    },
    changeModelFlash: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            // For AI Studio, open model selector and click Flash model
            const script = `
                (async function() {
                    const waitForElement = (selector, timeout = 5000) => {
                        return new Promise((resolve, reject) => {
                            const timer = setInterval(() => {
                                const element = document.querySelector(selector);
                                if (element && !element.disabled && element.offsetParent !== null) {
                                    clearInterval(timer);
                                    resolve(element);
                                }
                            }, 100);
                            setTimeout(() => {
                                clearInterval(timer);
                                reject(new Error('Element not found: ' + selector));
                            }, timeout);
                        });
                    };

                    const simulateClick = (element) => {
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                            element.dispatchEvent(event);
                        });
                    };

                    try {
                        // Step 1: Click the settings toggle button
                        const toggleButton = await waitForElement('button[aria-label="Toggle run settings panel"], button[iconname="tune"]');
                        simulateClick(toggleButton);
                        console.log('AI Studio: Clicked settings toggle');
                        
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Step 2: Click the model selector card
                        const modelSelector = await waitForElement('button.model-selector-card, ms-model-selector-v3 button');
                        simulateClick(modelSelector);
                        console.log('AI Studio: Clicked model selector');
                        
                        await new Promise(resolve => setTimeout(resolve, 800));

                        // Step 3: Click the Flash model
                        const flashModel = await waitForElement('ms-model-carousel-row button[id*="gemini-flash-latest"], ms-model-carousel-row button[id*="gemini-flash"]');
                        simulateClick(flashModel);
                        console.log('AI Studio: Selected Flash model');
                        
                        // Wait a bit and close the model selection panel
                        await new Promise(resolve => setTimeout(resolve, 400));
                        const closeModelPanel = await waitForElement('button[aria-label="Close panel"][mat-dialog-close], button[data-test-close-button][iconname="close"]', 3000);
                        simulateClick(closeModelPanel);
                        console.log('AI Studio: Closed model selection panel');
                        
                        // Wait and close the settings panel
                        await new Promise(resolve => setTimeout(resolve, 300));
                        try {
                            const closeSettingsPanel = await waitForElement('button[aria-label="Close run settings panel"][iconname="close"]', 3000);
                            simulateClick(closeSettingsPanel);
                            console.log('AI Studio: Closed settings panel');
                        } catch (e) {
                            console.log('AI Studio: Could not find close settings button (might be already closed or changed):', e.message);
                        }
                        
                    } catch (error) {
                        console.error('AI Studio: Failed to change to Flash model:', error);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).catch(console.error);
        } else {
            createNewChatWithModel('Flash');
        }
    },
    changeModelThinking: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            // For AI Studio - similar logic to Pro/Flash
            const script = `
                (async function() {
                    const waitForElement = (selector, timeout = 5000) => {
                        return new Promise((resolve, reject) => {
                            const timer = setInterval(() => {
                                const element = document.querySelector(selector);
                                if (element && !element.disabled && element.offsetParent !== null) {
                                    clearInterval(timer);
                                    resolve(element);
                                }
                            }, 100);
                            setTimeout(() => {
                                clearInterval(timer);
                                reject(new Error('Element not found: ' + selector));
                            }, timeout);
                        });
                    };

                    const simulateClick = (element) => {
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                            element.dispatchEvent(event);
                        });
                    };

                    try {
                        const toggleButton = await waitForElement('button[aria-label="Toggle run settings panel"], button[iconname="tune"]');
                        simulateClick(toggleButton);
                        console.log('AI Studio: Clicked settings toggle');
                        
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const modelSelector = await waitForElement('button.model-selector-card, ms-model-selector-v3 button');
                        simulateClick(modelSelector);
                        console.log('AI Studio: Clicked model selector');
                        
                        await new Promise(resolve => setTimeout(resolve, 800));

                        const thinkingModel = await waitForElement('ms-model-carousel-row button[id*="gemini-thinking"]');
                        simulateClick(thinkingModel);
                        console.log('AI Studio: Selected Thinking model');
                        
                        await new Promise(resolve => setTimeout(resolve, 400));
                        const closeModelPanel = await waitForElement('button[aria-label="Close panel"][mat-dialog-close], button[data-test-close-button][iconname="close"]', 3000);
                        simulateClick(closeModelPanel);
                        console.log('AI Studio: Closed model selection panel');
                        
                        await new Promise(resolve => setTimeout(resolve, 300));
                        try {
                            const closeSettingsPanel = await waitForElement('button[aria-label="Close run settings panel"][iconname="close"]', 3000);
                            simulateClick(closeSettingsPanel);
                            console.log('AI Studio: Closed settings panel');
                        } catch (e) {
                            console.log('AI Studio: Could not find close settings button (might be already closed or changed):', e.message);
                        }
                        
                    } catch (error) {
                        console.error('AI Studio: Failed to change to Thinking model:', error);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).catch(console.error);
        } else {
            createNewChatWithModel('Thinking');
        }
    },
    newChatWithPro: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-pro');
        } else {
            // First open new chat, then change model
            const script = `
                (function() {
                    // First click the main menu button
                    const menuButton = document.querySelector('button[aria-label="Main menu"]');
                    if (menuButton) {
                        menuButton.click();
                        // Wait for menu to open, then click New chat
                        setTimeout(() => {
                            const newChatButton = document.querySelector('button[aria-label="New chat"]');
                            if (newChatButton) {
                                newChatButton.click();
                            }
                        }, 100);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).then(() => {
                // Wait for new chat to load, then select model
                setTimeout(() => {
                    createNewChatWithModel('Pro');
                }, 500);
            }).catch(console.error);
        }
    },
    newChatWithFlash: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat?model=gemini-flash-latest');
        } else {
            // First open new chat, then change model
            const script = `
                (function() {
                    // First click the main menu button
                    const menuButton = document.querySelector('button[aria-label="Main menu"]');
                    if (menuButton) {
                        menuButton.click();
                        // Wait for menu to open, then click New chat
                        setTimeout(() => {
                            const newChatButton = document.querySelector('button[aria-label="New chat"]');
                            if (newChatButton) {
                                newChatButton.click();
                            }
                        }, 100);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).then(() => {
                // Wait for new chat to load, then select model
                setTimeout(() => {
                    createNewChatWithModel('Flash');
                }, 500);
            }).catch(console.error);
        }
    },
    newChatWithThinking: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat?model=gemini-thinking');
        } else {
            // First open new chat, then change model
            const script = `
                (function() {
                    // First click the main menu button
                    const menuButton = document.querySelector('button[aria-label="Main menu"]');
                    if (menuButton) {
                        menuButton.click();
                        // Wait for menu to open, then click New chat
                        setTimeout(() => {
                            const newChatButton = document.querySelector('button[aria-label="New chat"]');
                            if (newChatButton) {
                                newChatButton.click();
                            }
                        }, 100);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).then(() => {
                // Wait for new chat to load, then select model
                setTimeout(() => {
                    createNewChatWithModel('Thinking');
                }, 500);
            }).catch(console.error);
        }
    },
    tempChat: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            // For AI Studio - click the incognito button
            const script = `
                (async function() {
                    console.log('AI Studio: Toggling Temporary Chat (Incognito)');

                    const waitForElement = (selector, timeout = 3000) => {
                        return new Promise((resolve, reject) => {
                            const timer = setInterval(() => {
                                const element = document.querySelector(selector);
                                if (element && !element.disabled) {
                                    clearInterval(timer);
                                    resolve(element);
                                }
                            }, 100);
                            setTimeout(() => {
                                clearInterval(timer);
                                resolve(null); // Resolve null instead of reject to handle multiple attempts
                            }, timeout);
                        });
                    };

                    const simulateClick = (element) => {
                        if (!element) return;
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                            element.dispatchEvent(event);
                        });
                    };

                    try {
                        // Selectors for AI Studio incognito button
                        const selectors = [
                            'button[aria-label="Temporary chat toggle"]',
                            'button[iconname="incognito"]',
                            'ms-incognito-mode-toggle button'
                        ];

                        for (const sel of selectors) {
                            const btn = await waitForElement(sel, 1000);
                            if (btn) {
                                console.log('AI Studio: Found incognito button:', sel);
                                simulateClick(btn);
                                return;
                            }
                        }
                        console.warn('AI Studio: Could not find incognito button');
                    } catch (error) {
                        console.error('AI Studio: Failed to toggle temporary chat:', error);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).catch(console.error);
        } else {
            // For Gemini - open nav bar (if needed) and click temporary chat button
            const script = `
                (async function() {
                    console.log('Gemini: Starting Temporary Chat sequence');

                    const waitForElement = (selector, timeout = 3000) => {
                        return new Promise((resolve) => {
                            const interval = setInterval(() => {
                                const el = document.querySelector(selector);
                                if (el && !el.disabled && el.offsetParent !== null) {
                                    clearInterval(interval);
                                    resolve(el);
                                }
                            }, 100);
                            setTimeout(() => {
                                clearInterval(interval);
                                resolve(null);
                            }, timeout);
                        });
                    };

                    const simulateClick = (element) => {
                        if (!element) return;
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
                        });
                    };

                    const tempChatSelectors = [
                        '[data-test-id="temp-chat-button"]',
                        'button[aria-label="Temporary chat"]',
                        'button[mattooltip="Temporary chat"]'
                    ];

                    // 1. Try to find the button directly (if nav bar is open)
                    for (const sel of tempChatSelectors) {
                        const el = document.querySelector(sel);
                        if (el && !el.disabled && el.offsetParent !== null) {
                            console.log('Gemini: Found Temp Chat button directly:', sel);
                            simulateClick(el);
                            return;
                        }
                    }

                    // 2. If not found, try to open the main menu
                    console.log('Gemini: Temp Chat button not visible, trying menu toggle...');
                    const menuButton = document.querySelector('button[aria-label="Main menu"]') ||
                                       document.querySelector('button[aria-label="Expand menu"]');

                    if (menuButton) {
                        simulateClick(menuButton);
                        // Wait for menu animation
                        for (const sel of tempChatSelectors) {
                            const tempChatButton = await waitForElement(sel, 2000);
                            if (tempChatButton) {
                                console.log('Gemini: Found Temp Chat button after menu toggle:', sel);
                                simulateClick(tempChatButton);
                                return;
                            }
                        }
                    }

                    console.warn('Gemini: Could not find Temporary Chat button');
                })();
            `;
            view.webContents.executeJavaScript(script).catch(console.error);
        }
    },
    search: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;

        if (focusedWindow.appMode === 'aistudio') {
            const view = focusedWindow.getBrowserView();
            if (!view) return;

            const libraryUrl = 'https://aistudio.google.com/library';
            const focusScript = `
        const input = document.querySelector('input[placeholder="Search"]');
        if (input) input.focus();
      `;

            if (view.webContents.getURL().startsWith(libraryUrl)) {
                view.webContents.executeJavaScript(focusScript).catch(console.error);
            } else {
                view.webContents.loadURL(libraryUrl);
                view.webContents.once('did-finish-load', () => {
                    setTimeout(() => view.webContents.executeJavaScript(focusScript).catch(console.error), 500);
                });
            }
        } else {
            triggerSearch();
        }
    },
    showInstructions: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow && !focusedWindow.isDestroyed()) {
            const currentUrl = focusedWindow.webContents.getURL();

            // אם אנחנו כבר בעמוד onboarding, נחזיר את ה-view
            if (currentUrl.includes('html/onboarding.html')) {
                const view = detachedViews.get(focusedWindow);
                if (view && !view.webContents.isDestroyed()) {
                    // טוען את drag.html קודם, ואז מחזיר את ה-view - בדיוק כמו ב-onboarding-complete
                    focusedWindow.loadFile('html/drag.html').then(() => {
                        focusedWindow.setBrowserView(view);
                        const contentBounds = focusedWindow.getContentBounds();
                        view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                        // Force repaint after setting bounds
                        try {
                            view.webContents.invalidate();
                        } catch (e) {
                            // Ignore errors
                        }

                        // אל תקרא ל-setCanvasMode כי זה משנה את גודל החלון
                        detachedViews.delete(focusedWindow);

                        focusedWindow.focus();
                        view.webContents.focus();

                        // שלח את הכותרת הנוכחית
                        const sendCurrentTitle = async () => {
                            try {
                                const title = await view.webContents.executeJavaScript(`
                                    (function() {
                                        try {
                                            const text = el => el ? (el.textContent || el.innerText || '').trim() : '';
                                            const selectors = [
                                                '.conversation.selected .conversation-title',
                                                'li.active a.prompt-link',
                                                '[data-test-id="conversation-title"]',
                                                'h1.conversation-title', 
                                                '.conversation-title',
                                                '.chat-title'
                                            ];
                                            for (const selector of selectors) {
                                                const el = document.querySelector(selector);
                                                if (el) {
                                                    const t = text(el);
                                                    if (t && t !== 'Gemini' && t !== 'New Chat') return t;
                                                }
                                            }
                                            return document.title || 'New Chat';
                                        } catch (e) {
                                            return 'New Chat';
                                        }
                                    })();
                                `, true);
                                if (!focusedWindow.isDestroyed()) {
                                    focusedWindow.webContents.send('update-title', title || 'New Chat');
                                }
                            } catch (e) {
                                if (!focusedWindow.isDestroyed()) {
                                    focusedWindow.webContents.send('update-title', 'New Chat');
                                }
                            }
                        };
                        sendCurrentTitle();
                    }).catch(err => console.error('Failed to reload drag.html:', err));
                }
            } else {
                // אם אנחנו לא בעמוד onboarding, נפתח אותו
                const view = focusedWindow.getBrowserView();
                if (view) {
                    focusedWindow.removeBrowserView(view);
                    detachedViews.set(focusedWindow, view);
                }
                focusedWindow.loadFile('html/onboarding.html');
                setCanvasMode(false, focusedWindow);
            }
        }
    },
    refresh: () => reloadFocusedView(),
    screenshot: () => {
        let isScreenshotProcessActive = false;

        if (isQuitting || isScreenshotProcessActive) {
            return;
        }
        isScreenshotProcessActive = true;

        let targetWin = BrowserWindow.getFocusedWindow();
        if (!targetWin) {
            if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
                targetWin = lastFocusedWindow;
            } else {
                const allWindows = BrowserWindow.getAllWindows();
                targetWin = allWindows.length > 0 ? allWindows[0] : null;
            }
        }

        if (!targetWin) {
            isScreenshotProcessActive = false;
            return;
        }

        // Check if auto full-screen screenshot is enabled
        if (settings.autoScreenshotFullScreen) {
            proceedWithFullScreenScreenshot();
        } else {
            proceedWithScreenshot();
        }

        // Full screen screenshot - captures entire screen without selection
        async function proceedWithFullScreenScreenshot() {
            const screenshotTargetWindow = targetWin;
            try {
                const { desktopCapturer } = require('electron');

                // Get the primary display
                const primaryDisplay = screen.getPrimaryDisplay();
                const { width, height } = primaryDisplay.size;
                const scaleFactor = primaryDisplay.scaleFactor;

                // Hide the target window temporarily for cleaner screenshot
                // If invisibilityMode is enabled, the window is already protected
                // from capture (no need to hide -> avoids visible flicker).
                const wasVisible = screenshotTargetWindow.isVisible();
                let hidePerformed = false;
                if (!settings.invisibilityMode && wasVisible) {
                    screenshotTargetWindow.hide();
                    hidePerformed = true;
                }

                // Wait a bit for window to hide (only useful when we actually hid it)
                if (hidePerformed) await new Promise(resolve => setTimeout(resolve, 100));

                // Get screen sources
                const sources = await desktopCapturer.getSources({
                    types: ['screen'],
                    thumbnailSize: {
                        width: Math.round(width * scaleFactor),
                        height: Math.round(height * scaleFactor)
                    }
                });

                if (sources.length > 0) {
                    const primarySource = sources[0];
                    const thumbnail = primarySource.thumbnail;

                    // Copy to clipboard
                    clipboard.writeImage(thumbnail);
                    console.log('Full screen screenshot captured and copied to clipboard!');

                    // Verify clipboard has the image
                    const verifyImage = clipboard.readImage();
                    if (verifyImage.isEmpty()) {
                        console.error('Failed to copy image to clipboard!');
                    }

                    // Show and focus the target window (only if we hid it earlier)
                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                        if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
                        if (hidePerformed) screenshotTargetWindow.show();
                        screenshotTargetWindow.setAlwaysOnTop(true);
                        screenshotTargetWindow.focus();

                        const viewInstance = screenshotTargetWindow.getBrowserView();
                        if (viewInstance && viewInstance.webContents) {
                            // Multiple paste attempts with retry logic
                            let pasteAttempts = 0;
                            const maxPasteAttempts = 3;

                            const attemptPaste = () => {
                                pasteAttempts++;
                                console.log(`Full screen paste attempt ${pasteAttempts}/${maxPasteAttempts}`);

                                try {
                                    viewInstance.webContents.focus();

                                    setTimeout(() => {
                                        viewInstance.webContents.paste();
                                        console.log('Full screen screenshot paste() called');

                                        // Second attempt shortly after
                                        setTimeout(() => {
                                            const imgCheck = clipboard.readImage();
                                            if (!imgCheck.isEmpty()) {
                                                viewInstance.webContents.paste();
                                                console.log('Full screen second paste() attempt');
                                            }
                                        }, 100);
                                    }, 150);

                                    // Retry if needed
                                    if (pasteAttempts < maxPasteAttempts) {
                                        setTimeout(attemptPaste, 400);
                                    } else {
                                        // Final cleanup
                                        setTimeout(() => {
                                            if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                                                applyAlwaysOnTopSetting(screenshotTargetWindow, settings.alwaysOnTop);
                                            }
                                        }, 800);
                                    }
                                } catch (err) {
                                    console.error('Full screen paste attempt failed:', err);
                                }
                            };

                            attemptPaste();
                        }
                    }
                } else {
                    console.error('No screen sources found for full screen capture');
                    // Restore window if capture failed
                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                        if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
                        screenshotTargetWindow.show();
                    }
                }
            } catch (err) {
                console.error('Full screen screenshot failed:', err);
                // Restore window on error
                if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                    if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
                    screenshotTargetWindow.show();
                }
            }

            isScreenshotProcessActive = false;
        }

        function proceedWithScreenshot() {
            const screenshotTargetWindow = targetWin;
            clipboard.clear();
            let cmd, args;
            if (process.platform === 'win32') {
                cmd = 'explorer';
                args = ['ms-screenclip:'];
            } else {
                cmd = 'screencapture';
                args = ['-i', '-c'];
            }
            const snippingTool = spawn(cmd, args, { detached: true, stdio: 'ignore' });
            snippingTool.unref();

            let processExited = false;
            let imageFoundOnce = false;

            snippingTool.on('exit', () => {
                processExited = true;
                console.log('Screenshot tool exited');
            });

            snippingTool.on('error', (err) => {
                console.error('Failed to start snipping tool:', err);
                isScreenshotProcessActive = false;
            });

            let checkAttempts = 0;
            const maxAttempts = 100; // Increased from 60 to 100 (50 seconds)

            // Start checking immediately, more frequently at first
            const fastCheckDuration = 20; // Check every 250ms for first 5 seconds

            const intervalId = setInterval(() => {
                checkAttempts++;

                try {
                    const image = clipboard.readImage();
                    const hasImage = !image.isEmpty();

                    // Log every 10 attempts for debugging
                    if (checkAttempts % 10 === 0) {
                        console.log(`Screenshot check attempt ${checkAttempts}/${maxAttempts}, processExited: ${processExited}, hasImage: ${hasImage}`);
                    }

                    // Found image - try to paste it
                    if (hasImage) {
                        if (!imageFoundOnce) {
                            console.log('Image found in clipboard!');
                            imageFoundOnce = true;
                        }

                        // Try pasting even if process hasn't exited yet (user might be done)
                        // Wait at least 1 second before attempting paste
                        if (checkAttempts > 4 || processExited) {
                            clearInterval(intervalId);

                            if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                                console.log('Preparing to paste screenshot...');

                                // Restore and show window immediately
                                if (screenshotTargetWindow.isMinimized()) {
                                    screenshotTargetWindow.restore();
                                }
                                if (!screenshotTargetWindow.isVisible()) {
                                    screenshotTargetWindow.show();
                                }

                                screenshotTargetWindow.setAlwaysOnTop(true);
                                screenshotTargetWindow.focus();

                                const viewInstance = screenshotTargetWindow.getBrowserView();
                                if (viewInstance && viewInstance.webContents) {
                                    // Single robust paste attempt
                                    const performPaste = () => {
                                        console.log('Performing screenshot paste...');
                                        try {
                                            // Check if window still exists
                                            if (!screenshotTargetWindow || screenshotTargetWindow.isDestroyed()) {
                                                console.error('Screenshot target window was destroyed');
                                                return;
                                            }

                                            // Double-check window state before paste
                                            if (screenshotTargetWindow.isMinimized()) {
                                                screenshotTargetWindow.restore();
                                            }
                                            if (!screenshotTargetWindow.isVisible()) {
                                                screenshotTargetWindow.show();
                                            }

                                            // Force focus
                                            screenshotTargetWindow.setAlwaysOnTop(true);
                                            screenshotTargetWindow.focus();
                                            screenshotTargetWindow.moveTop();
                                            viewInstance.webContents.focus();

                                            // Focus the text input field in the page
                                            viewInstance.webContents.executeJavaScript(`
                                                (function() {
                                                    try {
                                                        const textArea = document.querySelector('rich-textarea[aria-label*="prompt"], rich-textarea, textarea[aria-label*="prompt"], textarea[placeholder*="Gemini"], .ql-editor, [contenteditable="true"]');
                                                        if (textArea) {
                                                            textArea.focus();
                                                            console.log('Text input focused for screenshot paste');
                                                            return true;
                                                        }
                                                    } catch(e) {
                                                        console.error('Failed to focus text input:', e);
                                                    }
                                                    return false;
                                                })();
                                            `).catch(err => console.error('Failed to execute focus script:', err));

                                            // Wait for focus to settle then paste
                                            setTimeout(() => {
                                                if (!viewInstance.webContents.isDestroyed()) {
                                                    viewInstance.webContents.paste();
                                                    console.log('Screenshot paste() executed');
                                                }

                                                // Restore original AlwaysOnTop setting after a delay
                                                setTimeout(() => {
                                                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                                                        applyAlwaysOnTopSetting(screenshotTargetWindow, settings.alwaysOnTop);
                                                    }
                                                }, 1000);
                                            }, 400);
                                        } catch (err) {
                                            console.error('Paste failed:', err);
                                        }
                                    };

                                    // Wait longer for window to fully restore and get focus
                                    setTimeout(performPaste, 500);
                                }
                            }

                            isScreenshotProcessActive = false;
                        }
                    } else if (checkAttempts > maxAttempts) {
                        // Timeout - no image found
                        clearInterval(intervalId);
                        console.log('Screenshot timeout - no image found after max attempts');
                        isScreenshotProcessActive = false;
                    }
                } catch (err) {
                    console.error('Error checking clipboard:', err);
                }
            }, checkAttempts < fastCheckDuration ? 250 : 500); // Fast checks for first 5s, then slower
        }
    }
};

function createApplicationMenu() {
    const isMac = process.platform === 'darwin';
    const newWindowShortcut = settings.shortcuts.newWindow;

    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: newWindowShortcut,
                    click: shortcutActions.newWindow
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        ...(isMac ? [{
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        }] : [])
    ];

    return Menu.buildFromTemplate(template);
}

function registerShortcuts() {
    globalShortcut.unregisterAll();
    const shortcuts = settings.shortcuts;

    // helper to check whether shortcut is enabled (default: enabled)
    const isShortcutEnabled = (action) => {
        return !(settings.shortcutsEnabled && settings.shortcutsEnabled[action] === false);
    };
    if (shortcuts.showHide && isShortcutEnabled('showHide')) {
        globalShortcut.register(shortcuts.showHide, () => {
            const allWindows = BrowserWindow.getAllWindows();
            const userWindows = allWindows.filter(w => !w.__internal);

            if (userWindows.length === 0) {
                createWindow();
                return;
            }

            const shouldShow = userWindows.some(win => !win.isVisible());

            if (!shouldShow) {
                isUserTogglingHide = true;
                setTimeout(() => { isUserTogglingHide = false; }, 500);
            }

            userWindows.forEach(win => {
                if (shouldShow) {
                    if (win.isMinimized()) win.restore();
                    win.show();
                } else {
                    win.hide();
                }
            });

            if (shouldShow) {
                const focused = userWindows.find(w => w.isFocused());
                lastFocusedWindow = (focused && !focused.isDestroyed())
                    ? focused
                    : (userWindows[0] || null);

                if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
                    setTimeout(() => {
                        forceOnTop(lastFocusedWindow);
                        const view = lastFocusedWindow.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            view.webContents.focus();
                        }
                    }, 100);
                }
            }
        });
    }

    if (shortcuts.pieMenu && isShortcutEnabled('pieMenu')) {
        globalShortcut.register(shortcuts.pieMenu, () => {
            togglePieMenu();
        });
    }
    const localShortcuts = { ...settings.shortcuts };
    delete localShortcuts.showHide;

    const globalShortcuts = {};
    const localOnlyShortcuts = {};

    // Separate shortcuts based on global/local setting
    for (const action in localShortcuts) {
        // Skip disabled shortcuts
        if (!isShortcutEnabled(action)) continue;
        if (action === 'findInPage') continue;

        // Check per-key setting first, then fall back to global setting
        const isGlobal = settings.shortcutsGlobalPerKey && settings.shortcutsGlobalPerKey.hasOwnProperty(action)
            ? settings.shortcutsGlobalPerKey[action]
            : settings.shortcutsGlobal;

        if (isGlobal) {
            globalShortcuts[action] = localShortcuts[action];
        } else {
            localOnlyShortcuts[action] = localShortcuts[action];
        }
    }

    // Register global shortcuts
    if (Object.keys(globalShortcuts).length > 0) {
        console.log('Registering GLOBAL shortcuts:', Object.keys(globalShortcuts));
        for (const action in globalShortcuts) {
            if (globalShortcuts[action] && shortcutActions[action]) {
                try {
                    const registered = globalShortcut.register(globalShortcuts[action], shortcutActions[action]);
                    if (registered) {
                        console.log(`Successfully registered: ${action} (${globalShortcuts[action]})`);
                    } else {
                        console.warn(`Failed to register: ${action} (${globalShortcuts[action]})`);
                    }
                } catch (error) {
                    console.error(`Error registering ${action}:`, error);
                }
            }
        }
    }

    // Broadcast local-only shortcuts to renderer
    if (Object.keys(localOnlyShortcuts).length > 0) {
        console.log('Registering LOCAL shortcuts:', Object.keys(localOnlyShortcuts));
        broadcastToAllWebContents('set-local-shortcuts', localOnlyShortcuts);
    } else {
        broadcastToAllWebContents('set-local-shortcuts', {});
    }
}

// ================================================================= //
// Gemini-Specific Functions
// ================================================================= //

function checkAndSendDefaultPrompt(view, url, mode) {
    if (!view || view.webContents.isDestroyed()) return;

    let isNewChat = false;

    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'gemini.google.com') {
            // Gemini new chat is /app or /app/
            // Existing chat is /app/ID
            if (urlObj.pathname === '/app' || urlObj.pathname === '/app/') {
                isNewChat = true;
            }
        } else if (urlObj.hostname === 'aistudio.google.com') {
            if (url.includes('/prompts/new_chat')) {
                isNewChat = true;
            }
        }
    } catch (e) {
        console.error('Error parsing URL in checkAndSendDefaultPrompt:', e);
    }

    if (isNewChat) {
        if (!view.__defaultPromptSent && settings.defaultPromptId && settings.customPrompts) {
            const defaultPrompt = settings.customPrompts.find(p => p.id === settings.defaultPromptId);
            if (defaultPrompt && defaultPrompt.content) {
                view.__defaultPromptSent = true;
                console.log('Prompt Manager: Auto-sending default prompt:', defaultPrompt.name);
                // Wait for the page to fully load and then insert the prompt
                setTimeout(() => {
                    // Double check we are still on the new chat page
                    if (!view || view.webContents.isDestroyed()) return;
                    const currentUrl = view.webContents.getURL();
                    let stillNewChat = false;
                    try {
                        const currentUrlObj = new URL(currentUrl);
                        if (currentUrlObj.hostname === 'gemini.google.com') {
                            if (currentUrlObj.pathname === '/app' || currentUrlObj.pathname === '/app/') {
                                stillNewChat = true;
                            }
                        } else if (currentUrlObj.hostname === 'aistudio.google.com') {
                            if (currentUrl.includes('/prompts/new_chat')) {
                                stillNewChat = true;
                            }
                        }
                    } catch (e) { }

                    if (stillNewChat) {
                        executeDefaultPrompt(view, defaultPrompt.content, mode);
                    } else {
                        console.log('Prompt Manager: Aborted auto-send, user navigated away from new chat');
                    }
                }, 2000);
            }
        }
    } else {
        // Reset the flag if we are NOT in a new chat, so it can trigger again later
        if (view.__defaultPromptSent) {
            view.__defaultPromptSent = false;
            console.log('Prompt Manager: Resetting default prompt sent flag (navigated to existing chat)');
        }
    }
}

// ...existing code...
function createNewChatWithModel(modelType) {
    let focusedWindow = BrowserWindow.getFocusedWindow();

    // If the focused window is the Pie Menu (or null), try to use the last focused window
    if (!focusedWindow || focusedWindow === pieMenuWin || focusedWindow.__internal) {
        if (lastFocusedWindow && !lastFocusedWindow.isDestroyed() && !lastFocusedWindow.__internal) {
            focusedWindow = lastFocusedWindow;
        } else {
            // Find any valid user window
            const allWindows = BrowserWindow.getAllWindows();
            focusedWindow = allWindows.find(w => !w.__internal && w !== pieMenuWin && !w.isDestroyed());
        }
    }

    // If still no valid window, create a new one
    if (!focusedWindow) {
        console.log('GeminiDesk: No existing window found for model switch. Creating new one.');
        focusedWindow = createWindow();
        // Wait for window to be ready before injecting script? 
        // For now, let's just create it. The script injection below might run too early if we don't wait.
        // But the script is designed for an existing chat view. 
        // If we create a new window, it defaults to the last used model or standard Gemini.
        // We might need a more robust "create and set model" flow, but for now let's ensure we at least have a window.

        // Actually, if we create a new window, we can just return, as the user can select the model there.
        // Or we could try to wait and then run the switcher. 
        // Let's return for now to avoid errors, effectively just opening a new window.
        return;
    }

    const targetView = focusedWindow.getBrowserView();
    if (!targetView) return;

    if (!focusedWindow.isVisible()) focusedWindow.show();
    if (focusedWindow.isMinimized()) focusedWindow.restore();
    focusedWindow.focus();

    // Fast = 0, Thinking = 1, Pro = 2
    const modelIndex = modelType.toLowerCase() === 'flash' ? 0
        : modelType.toLowerCase() === 'thinking' ? 1
            : 2;

    const script = `
    (async function() {
      console.log('--- GeminiDesk: Starting script v7 ---');
      
      const waitForElement = (selector, timeout = 3000) => {
        console.log(\`Waiting for an active element: \${selector}\`);
        return new Promise((resolve, reject) => {
          const timer = setInterval(() => {
            const element = document.querySelector(selector);
            if (element && !element.disabled) {
              clearInterval(timer);
              console.log(\`Found active element: \${selector}\`);
              resolve(element);
            }
          }, 100);
          setTimeout(() => {
            clearInterval(timer);
            console.warn('GeminiDesk Warn: Timeout. Could not find an active element for:', selector);
            reject(new Error('Element not found or disabled: ' + selector));
          }, timeout);
        });
      };

      const simulateClick = (element) => {
        console.log('Simulating a click on:', element);
        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
        const mouseupEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        element.dispatchEvent(mousedownEvent);
        element.dispatchEvent(mouseupEvent);
        element.dispatchEvent(clickEvent);
      };

      try {
        let modelSwitcher;
        try {
          console.log('GeminiDesk: Attempt #1 - Direct model menu opening.');
          modelSwitcher = await waitForElement('[data-test-id="bard-mode-menu-button"]');
        } catch (e) {
          console.log('GeminiDesk: Attempt #1 failed. Falling back to plan B - clicking "New Chat".');
          const newChatButton = await waitForElement('[data-test-id="new-chat-button"] button', 5000);
          simulateClick(newChatButton);
          console.log('GeminiDesk: Clicked "New Chat", waiting for UI to stabilize...');
          await new Promise(resolve => setTimeout(resolve, 500));
          modelSwitcher = await waitForElement('[data-test-id="bard-mode-menu-button"]', 5000);
        }
        
        simulateClick(modelSwitcher);
        console.log('GeminiDesk: Clicked model switcher dropdown.');

        const menuPanel = await waitForElement('mat-bottom-sheet-container, .mat-mdc-menu-panel', 5000);
        console.log('GeminiDesk: Found model panel. Selecting by index...');
        
        const modelIndexToSelect = ${modelIndex};
        console.log(\`Target index: \${modelIndexToSelect}\`);
        
        const items = menuPanel.querySelectorAll('button.mat-mdc-menu-item.bard-mode-list-button');
        console.log(\`Found \${items.length} models in the menu.\`);
        
        if (items.length > modelIndexToSelect) {
          const targetButton = items[modelIndexToSelect];
          console.log('Target button:', targetButton.textContent.trim());
          await new Promise(resolve => setTimeout(resolve, 150));
          simulateClick(targetButton);
          console.log('GeminiDesk: Success! Clicked model at index:', modelIndexToSelect);
        } else {
          console.error(\`GeminiDesk Error: Could not find a model at index \${modelIndexToSelect}\`);
          document.body.click();
        }

      } catch (error) {
        console.error('GeminiDesk Error: The entire process failed.', error);
      }
      console.log('--- GeminiDesk: Script v7 finished ---');
    })();
  `;

    targetView.webContents.executeJavaScript(script).catch(console.error);
}

function triggerSearch() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;
    const targetView = focusedWindow.getBrowserView();
    if (!targetView) return;

    if (!focusedWindow.isVisible()) focusedWindow.show();
    if (focusedWindow.isMinimized()) focusedWindow.restore();
    focusedWindow.focus();

    const script = `
    (async function() {
      console.log('--- GeminiDesk: Triggering Search ---');

      const waitForElement = (selector, timeout = 3000) => {
        console.log(\`Waiting for element: \${selector}\`);
        return new Promise((resolve, reject) => {
          let timeoutHandle = null;
          const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
              if (timeoutHandle) clearTimeout(timeoutHandle);
              clearInterval(interval);
              console.log(\`Found element: \${selector}\`);
              resolve(element);
            }
          }, 100);
          timeoutHandle = setTimeout(() => {
            clearInterval(interval);
            console.error(\`GeminiDesk Error: Timeout waiting for \${selector}\`);
            reject(new Error('Timeout for selector: ' + selector));
          }, timeout);
        });
      };
      
      const simulateClick = (element) => {
        if (!element) {
            console.error('SimulateClick called on a null element.');
            return;
        }
        console.log('Simulating click on:', element);
        const events = ['mousedown', 'mouseup', 'click'];
        events.forEach(type => {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(event);
        });
      };

      try {
        const menuButton = document.querySelector('button[aria-label="Main menu"]');
        if (menuButton) {
            console.log('Step 1: Found and clicking main menu button.');
            simulateClick(menuButton);
            await new Promise(resolve => setTimeout(resolve, 300));
        } else {
            console.log('Step 1: Main menu button not found. Assuming sidebar is already open.');
        }

        const searchNavBarButton = await waitForElement('search-nav-bar button.search-nav-bar');
        console.log('Step 2: Found and clicking search navigation bar.');
        simulateClick(searchNavBarButton);
        await new Promise(resolve => setTimeout(resolve, 150));

        const searchInput = await waitForElement('input.search-input, input[placeholder="Search chats"]');
        console.log('Step 3: Found search input field.');
        searchInput.focus();
        
        console.log('--- GeminiDesk: SUCCESS! Search input focused. ---');

      } catch (error) {
        console.error('GeminiDesk Error during search sequence:', error.message);
      }
    })();
  `;

    targetView.webContents.executeJavaScript(script).catch(console.error);
}

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

function createWindow(state = null, show = true) {
    const windowOptions = {
        width: originalSize.width,
        height: originalSize.height,
        skipTaskbar: !settings.showInTaskbar,
        frame: false,
        backgroundColor: '#1E1E1E',
        alwaysOnTop: false, // Will be set explicitly below with platform-specific logic
        fullscreenable: false,
        focusable: true,
        icon: getIconPath(),
        show: show,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            partition: SESSION_PARTITION
        }
    };

    if (settings.preserveWindowSize && settings.windowBounds) {
        windowOptions.width = settings.windowBounds.width || originalSize.width;
        windowOptions.height = settings.windowBounds.height || originalSize.height;
        // Only set x/y if they are valid numbers to avoid window appearing off-screen
        if (typeof settings.windowBounds.x === 'number' && typeof settings.windowBounds.y === 'number') {
            windowOptions.x = settings.windowBounds.x;
            windowOptions.y = settings.windowBounds.y;
        }
    }

    const newWin = new BrowserWindow(windowOptions);

    const initialAccountIndex = state && typeof state.accountIndex === 'number'
        ? state.accountIndex
        : (settings.currentAccountIndex || 0);
    newWin.accountIndex = initialAccountIndex;

    // Handle alwaysOnTop with special macOS configuration for fullscreen windows
    // Credit: https://github.com/astron8t-voyagerx
    applyAlwaysOnTopSetting(newWin, settings.alwaysOnTop);

    // Apply invisibility mode (content protection) if enabled - hides window from screen sharing
    applyInvisibilityMode(newWin);

    newWin.isCanvasActive = false;
    newWin.prevBounds = null;
    newWin.appMode = null;
    newWin.savedScrollPosition = 0;

    // Setup context menu for the main window
    setupContextMenu(newWin.webContents);

    // Text zoom support for main window (settings, onboarding, etc.)
    newWin.webContents.on('before-input-event', (event, input) => {
        if (input.control || input.meta) {
            const currentZoom = newWin.webContents.getZoomLevel();

            if (input.type === 'keyDown') {
                // Ctrl + Plus/Equal (zoom in)
                if (input.key === '=' || input.key === '+') {
                    event.preventDefault();
                    newWin.webContents.setZoomLevel(currentZoom + 0.5);
                }
                // Ctrl + Minus (zoom out)
                else if (input.key === '-') {
                    event.preventDefault();
                    newWin.webContents.setZoomLevel(currentZoom - 0.5);
                }
                // Ctrl + 0 (reset zoom)
                else if (input.key === '0') {
                    event.preventDefault();
                    newWin.webContents.setZoomLevel(0);
                }
            }
        }
    });

    // Mouse wheel zoom support for main window
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

    // Helper function to update BrowserView bounds
    const updateViewBounds = async (saveScroll = true, restoreScroll = true, updateBounds = true) => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            if (updateBounds) {
                const contentBounds = newWin.getContentBounds();
                view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
            }

            // Force repaint of BrowserView to fix Windows snap rendering issue (Win+Arrow keys)
            // This is necessary in packaged builds where BrowserView doesn't auto-repaint
            try {
                view.webContents.invalidate();
            } catch (e) {
                // Ignore errors
            }

            if (saveScroll) {
                try {
                    const scrollY = await view.webContents.executeJavaScript(
                        `(document.scrollingElement || document.documentElement).scrollTop`
                    );
                    newWin.savedScrollPosition = scrollY;
                } catch (e) {
                    // Ignore errors
                }
            }

            if (restoreScroll) {
                // Restore scroll position after resize
                setTimeout(async () => {
                    if (view && !view.webContents.isDestroyed()) {
                        try {
                            await view.webContents.executeJavaScript(
                                `(document.scrollingElement || document.documentElement).scrollTop = ${newWin.savedScrollPosition};`
                            );
                        } catch (e) {
                            // Ignore errors
                        }
                    }
                }, 100);
            }
        }
    };

    // Handle resize event (fires during resize)
    newWin.on('resize', () => {
        // On Windows and macOS, we rely on 'will-resize' for bounds updates and to fix Snap issues.
        // We also skip scroll saving/restoring during the high-frequency resize loop to avoid
        // severe performance degradation caused by IPC calls.
        // Scroll position is saved in 'will-resize' and restored in 'resized'.
        if (process.platform === 'linux') {
            updateViewBounds(true, true, true);
        }
    });

    // Handle resized event (fires after resize completes - crucial for Windows snap with Win+Arrow keys)
    newWin.on('resized', () => {
        updateViewBounds(false, true);
        if (settings.preserveWindowSize && newWin && !newWin.isDestroyed()) {
            settings.windowBounds = newWin.getBounds();
            debouncedSaveSettings(settings);
        }
    });

    // Handle moved event (fires after window position changes - may accompany snap operations)
    newWin.on('moved', () => {
        if (settings.preserveWindowSize && newWin && !newWin.isDestroyed()) {
            settings.windowBounds = newWin.getBounds();
            debouncedSaveSettings(settings);
        }
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            const contentBounds = newWin.getContentBounds();
            if (contentBounds.width > 0 && contentBounds.height > 30) {
                view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                // Force repaint to fix Windows snap rendering issue
                try {
                    view.webContents.invalidate();
                } catch (e) {
                    // Ignore errors
                }
            }
        }
    });

    // Handle will-resize event (fires before resize - immediate bounds update for Windows snap)
    newWin.on('will-resize', (event, newBounds) => {
        // Force immediate update to target bounds to prevent blank content or clipping
        if (newWin && !newWin.isDestroyed()) {
            const view = newWin.getBrowserView();
            // Ensure bounds are valid (avoid negative height)
            if (view && newBounds.width > 0 && newBounds.height > 30) {
                // Since frame: false, newBounds (window bounds) is roughly content bounds
                view.setBounds({ x: 0, y: 30, width: newBounds.width, height: newBounds.height - 30 });
                // Force repaint to fix Windows snap rendering issue
                if (view.webContents && !view.webContents.isDestroyed()) {
                    try {
                        view.webContents.invalidate();
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }

            // Save scroll position before/during resize to ensure we have a valid restore point.
            // This is crucial because we skip scroll saving in the 'resize' event on Windows/Mac for performance.
            if (view && !view.webContents.isDestroyed()) {
                view.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`)
                    .then(y => { newWin.savedScrollPosition = y; })
                    .catch(() => { });
            }
        }
    });

    // Handle maximize/unmaximize to ensure BrowserView bounds are correct
    newWin.on('maximize', () => {
        setTimeout(() => {
            if (newWin && !newWin.isDestroyed()) {
                const view = newWin.getBrowserView();
                if (view) {
                    const contentBounds = newWin.getContentBounds();
                    view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                    // Force repaint to fix Windows snap rendering issue
                    if (view.webContents && !view.webContents.isDestroyed()) {
                        try {
                            view.webContents.invalidate();
                        } catch (e) {
                            // Ignore errors
                        }
                    }
                    console.log('Maximize: Updated BrowserView bounds to', contentBounds.width, 'x', contentBounds.height - 30);
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
                    // Force repaint to fix Windows snap rendering issue
                    if (view.webContents && !view.webContents.isDestroyed()) {
                        try {
                            view.webContents.invalidate();
                        } catch (e) {
                            // Ignore errors
                        }
                    }
                    console.log('Unmaximize: Updated BrowserView bounds to', contentBounds.width, 'x', contentBounds.height - 30);
                }
            }
        }, 50);
    });

    // Handle focus event to ensure BrowserView bounds are correct after snap operations
    newWin.on('focus', () => {
        // Small delay to allow Windows snap animation to complete
        setTimeout(() => {
            if (newWin && !newWin.isDestroyed()) {
                const view = newWin.getBrowserView();
                if (view) {
                    const contentBounds = newWin.getContentBounds();
                    view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                    // Force repaint to fix Windows snap rendering issue
                    if (view.webContents && !view.webContents.isDestroyed()) {
                        try {
                            view.webContents.invalidate();
                        } catch (e) {
                            // Ignore errors
                        }
                    }
                }
            }
        }, 50);
    });

    // Prevent webContents throttling when window is hidden
    newWin.on('hide', () => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            view.webContents.setBackgroundThrottling(false);
            console.log('Background throttling disabled for hidden window');
        }
    });

    newWin.on('show', () => {
        const view = newWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            view.webContents.setBackgroundThrottling(false);
            console.log('Background throttling kept disabled for shown window');
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
        newWin.loadFile('html/onboarding.html');
    } else if (settings.defaultMode === 'ask') {
        newWin.loadFile('html/choice.html');
        const choiceSize = { width: 500, height: 450 };
        newWin.setResizable(false);
        newWin.setSize(choiceSize.width, choiceSize.height);
        newWin.center();
        // Ensure the window respects the saved always-on-top preference even in choice mode
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

    // Update taskbar grouping based on mode (Windows only)
    updateWindowAppUserModelId(targetWin, mode);

    // Notify the drag.html window of the mode change
    if (targetWin.webContents && !targetWin.webContents.isDestroyed()) {
        targetWin.webContents.send('app-mode-changed', mode);
    }

    const targetAccountIndex = typeof options.accountIndex === 'number'
        ? options.accountIndex
        : (typeof targetWin.accountIndex === 'number' ? targetWin.accountIndex : (settings.currentAccountIndex || 0));
    targetWin.accountIndex = targetAccountIndex;
    const partitionName = getAccountPartition(targetAccountIndex);

    // Don't reset sessions anymore - preserve cookies and login data for multi-account support
    // This allows users to switch between accounts without having to log in again
    if (options.resetSession) {
        console.log('resetSession option ignored - sessions are now persistent for multi-account support');
    }

    const url = initialUrl || (mode === 'aistudio' ? AISTUDIO_URL : GEMINI_URL);

    if (mode === 'aistudio') {
        console.log('GeminiDesk: Loading AI Studio mode');
    }

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

        // DON'T clear storage - keep existing login sessions
        // This allows users to have multiple accounts logged in simultaneously
        // and avoids requiring 2FA on every login
        console.log('Login window created - existing sessions preserved for multi-account support.');

        loginWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        setupContextMenu(loginWin.webContents);
        loginWin.loadURL(loginUrl);

        loginWin.on('closed', () => {
            loginWin = null;
        });

        loginWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
            // Treat both the canonical GEMINI_URL and URLs like
            // https://gemini.google.com/u/1/app as successful navigation.
            const isGeminiWithUserPath = /\/u\/\d+\/app(\/.*)?$/.test(navigatedUrl);
            const isLoginSuccess = navigatedUrl.startsWith(GEMINI_URL) || navigatedUrl.startsWith(AISTUDIO_URL) || isGeminiWithUserPath;
            console.log('Legacy login window navigated to:', navigatedUrl);

            if (isLoginSuccess) {
                let sessionCookieFound = false;
                const maxAttempts = 20;
                const isolatedSession = loginWin.webContents.session;

                try {
                    const preCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
                    console.log('Legacy login - initial .google.com cookies:', (preCookies && preCookies.length) || 0, (preCookies || []).map(c => c.name));
                } catch (e) { }

                if (isGeminiWithUserPath) {
                    sessionCookieFound = true;
                } else {
                    for (let i = 0; i < maxAttempts; i++) {
                        const criticalCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
                        if (criticalCookies && criticalCookies.length > 0) {
                            sessionCookieFound = true;
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }

                if (!sessionCookieFound) {
                    const currentSettings = (typeof getSettings === 'function') ? getSettings() : null;
                    const hasExistingAccounts = currentSettings && Array.isArray(currentSettings.accounts) && currentSettings.accounts.length > 0;
                    if (!hasExistingAccounts) {
                        console.warn('Timed out waiting for critical session cookie. Transfer may be incomplete.');
                    } else {
                        console.log('Timed out waiting for critical session cookie but existing accounts present — proceeding to attempt transfer/close for multi-account add');
                    }
                }

                try {
                    // Use the current account's partition instead of the default
                    const mainSession = session.fromPartition(partitionName);
                    const googleCookies = await isolatedSession.cookies.get({ domain: '.google.com' });

                    if (googleCookies.length === 0) {
                        console.warn("Login successful, but no cookies found to transfer.");
                    } else {
                        let successfulTransfers = 0;
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

                                if (!cookie.name.startsWith('__Host-')) {
                                    newCookie.domain = cookie.domain;
                                }

                                await mainSession.cookies.set(newCookie);
                                successfulTransfers++;
                            } catch (cookieError) {
                                console.warn(`Could not transfer cookie "${cookie.name}": ${cookieError.message}`);
                            }
                        }
                        console.log(`${successfulTransfers}/${googleCookies.length} cookies transferred successfully.`);
                    }

                    try {
                        await mainSession.cookies.flushStore();
                    } catch (flushErr) {
                        console.error('Failed to flush cookies store:', flushErr);
                    }

                    // Try to extract profile image and aria label from the login window
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
                            await accountsModule.setProfileImageForAccount(idx, profileInfo.img).catch(() => { });
                            if (profileInfo.aria) {
                                const text = profileInfo.aria.replace(/^Google Account:\s*/i, '').trim();
                                const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
                                const email = lines[lines.length - 1] && lines[lines.length - 1].includes('@') ? lines[lines.length - 1] : null;
                                if (email) accountsModule.updateAccount(idx, { email, name: lines[0] || undefined });
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to extract profile info from login window:', e && e.message ? e.message : e);
                    }

                    if (loginWin && !loginWin.isDestroyed()) {
                        loginWin.close();
                    }

                    // Load the newly added account into an app window so the user
                    // sees it immediately. If a window already uses this account,
                    // load into that window; otherwise create a new window for it.
                    try {
                        const mode = (loginWin && loginWin.getURL && loginWin.getURL().startsWith(AISTUDIO_URL)) ? 'aistudio' : 'gemini';
                        let targetWindow = BrowserWindow.getAllWindows().find(w => w.accountIndex === targetAccountIndex && !w.isDestroyed());
                        if (targetWindow) {
                            try { loadGemini(mode, targetWindow, navigatedUrl, { accountIndex: targetAccountIndex }); }
                            catch (e) { console.warn('Failed to load gemini into existing window for new account:', e); }
                        } else {
                            try {
                                const newWin = accountsModule.createWindowWithAccount(targetAccountIndex);
                                if (newWin && !newWin.isDestroyed()) {
                                    loadGemini(mode, newWin, navigatedUrl, { accountIndex: targetAccountIndex });
                                }
                            } catch (e) {
                                console.warn('Failed to create window for new account:', e && e.message ? e.message : e);
                            }
                        }
                    } catch (e) {
                        console.warn('Error while opening/loading window for new account:', e && e.message ? e.message : e);
                    }

                } catch (error) {
                    console.error('Error during login success handling:', error);
                }
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
                maybeCaptureAccountProfile(existingView, targetAccountIndex, options.forceProfileCapture);
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
        try {
            targetWin.removeBrowserView(existingView);
        } catch (err) {
            // ignore detach errors
        }
        try {
            existingView.webContents.destroy();
        } catch (err) {
            // ignore destroy errors
        }
    }

    targetWin.loadFile('html/drag.html');

    const newView = new BrowserView({
        webPreferences: {
            partition: partitionName,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nativeWindowOpen: true,
            backgroundThrottling: false
        }
    });

    // Apply session filters for AI Studio support
    if (newView.webContents && newView.webContents.session) {
        setupSessionFilters(newView.webContents.session);
    }

    // Try to ensure the unpacked extension is loaded into this view's session (only if enabled)
    try {
        if (settings && settings.loadUnpackedExtension && fs.existsSync(EXT_PATH)) {
            const viewSession = newView.webContents.session;
            if (viewSession && typeof viewSession.loadExtension === 'function') {
                try {
                    await viewSession.loadExtension(EXT_PATH, { allowFileAccess: true });
                    console.log(`Loaded extension into view session for partition: ${partitionName}`);
                } catch (err) {
                    // If already loaded or unsupported, warn but continue
                    console.warn('Could not load extension into view session:', err && err.message ? err.message : err);
                }
            } else {
                console.warn('viewSession does not support loadExtension for partition', partitionName);
            }
        }
    } catch (e) {
        console.warn('Error while attempting to load extension into view session:', e && e.message ? e.message : e);
    }

    // Prevent webContents from being throttled when window is hidden
    newView.webContents.setBackgroundThrottling(false);

    // Setup context menu for the browser view
    setupContextMenu(newView.webContents);

    newView.webContents.setWindowOpenHandler(({ url: popupUrl }) => {
        try {
            const parsed = new URL(popupUrl);
            const isGoogleLogin = /^https:\/\/accounts\.google\.com\//.test(popupUrl);
            const isGemini = parsed.hostname === 'gemini.google.com' || parsed.hostname.endsWith('.gemini.google.com');
            const isAistudio = parsed.hostname === 'aistudio.google.com' || parsed.hostname.endsWith('.aistudio.google.com');

            if (isGoogleLogin) {
                createAndManageLoginWindow(popupUrl);
                return { action: 'deny' };
            }

            // Handle gemini/aistudio links opened from within the webview: load inside the app
            if (isGemini || isAistudio) {
                try {
                    // Determine account index from query param `authuser` if present
                    let authuser = parsed.searchParams.get('authuser');
                    let accountIdx = (typeof authuser === 'string' && authuser.length) ? parseInt(authuser, 10) : undefined;
                    if (Number.isNaN(accountIdx)) accountIdx = undefined;

                    if (typeof accountIdx === 'number') {
                        try { accountsModule.switchAccount(accountIdx); } catch (e) { console.warn('Failed to switch account to', accountIdx, e); }
                    }

                    const mode = isAistudio ? 'aistudio' : 'gemini';
                    try {
                        loadGemini(mode, targetWin, popupUrl, (typeof accountIdx === 'number') ? { accountIndex: accountIdx } : {});
                    } catch (e) {
                        console.warn('Failed to load gemini/aistudio URL into app window:', e && e.message ? e.message : e);
                    }
                } catch (e) {
                    console.warn('Error handling internal gemini/aistudio popup URL:', e && e.message ? e.message : e);
                }
                return { action: 'deny' };
            }
        } catch (e) {
            // ignore parse errors and fallthrough to external open
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
                console.log('Sign-out detected. Clearing main application session...');
                try {
                    // Use the current account's partition instead of the default
                    const mainSession = session.fromPartition(partitionName);
                    await mainSession.clearStorageData({ storages: ['cookies', 'localstorage'] });
                    try {
                        await mainSession.cookies.flushStore();
                    } catch (flushErr) {
                        console.error('Failed to flush cookies store after sign-out:', flushErr);
                    }
                    console.log('Main session cleared. Reloading the view to show logged-out state.');

                    if (newView && !newView.webContents.isDestroyed()) {
                        newView.webContents.reload();
                    }
                } catch (error) {
                    console.error('Failed to clear main session on sign-out:', error);
                }
            } else {
                console.log('Sign-in or Add Account detected. Opening isolated login window.');
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

    // Text zoom support with Ctrl+/Ctrl- and Ctrl+Mouse Wheel
    newView.webContents.on('before-input-event', (event, input) => {
        if (input.control || input.meta) {
            const currentZoom = newView.webContents.getZoomLevel();

            if (input.type === 'keyDown') {
                // Ctrl + Plus/Equal (zoom in)
                if (input.key === '=' || input.key === '+') {
                    event.preventDefault();
                    newView.webContents.setZoomLevel(currentZoom + 0.5);
                }
                // Ctrl + Minus (zoom out)
                else if (input.key === '-') {
                    event.preventDefault();
                    newView.webContents.setZoomLevel(currentZoom - 0.5);
                }
                // Ctrl + 0 (reset zoom)
                else if (input.key === '0') {
                    event.preventDefault();
                    newView.webContents.setZoomLevel(0);
                }
            }
        }
    });

    // Mouse wheel zoom support
    newView.webContents.on('zoom-changed', (event, zoomDirection) => {
        const currentZoom = newView.webContents.getZoomLevel();
        if (zoomDirection === 'in') {
            newView.webContents.setZoomLevel(currentZoom + 0.5);
        } else if (zoomDirection === 'out') {
            newView.webContents.setZoomLevel(currentZoom - 0.5);
        }
    });

    newView.webContents.loadURL(url);

    // Track if default prompt has been sent for this view to avoid duplicates
    newView.__defaultPromptSent = false;

    newView.webContents.on('did-finish-load', () => {
        // Restore screenshot-on-send mode if active for this window
        const win = BrowserWindow.fromBrowserView(newView);
        if (win && screenshotSendModeActive.get(win.id)) {
            newView.webContents.send('set-screenshot-send-mode', true);
        }

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

    // Use getContentBounds for accurate content area dimensions
    const contentBounds = targetWin.getContentBounds();
    newView.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
    // Force repaint after initial bounds setup
    try {
        newView.webContents.invalidate();
    } catch (e) {
        // Ignore errors
    }
    newView.setAutoResize({ width: true, height: true });



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

async function setCanvasMode(isCanvas, targetWin) {
    if (!settings.enableCanvasResizing) {
        return;
    }
    if (!targetWin || targetWin.isDestroyed() || isCanvas === targetWin.isCanvasActive) {
        return;
    }

    const activeView = targetWin.getBrowserView();
    targetWin.isCanvasActive = isCanvas;
    const currentBounds = targetWin.getBounds();
    if (targetWin.isMinimized()) targetWin.restore();

    // Save current scroll position
    let scrollY = targetWin.savedScrollPosition || 0;
    if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
        try {
            scrollY = await activeView.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`);
            targetWin.savedScrollPosition = scrollY;
        } catch (e) {
            console.error('Could not read scroll position:', e);
        }
    }

    if (isCanvas) {
        if (!activeView) {
            console.warn("Canvas mode requested, but no active view found. Aborting.");
            targetWin.isCanvasActive = false;
            return;
        }

        targetWin.prevBounds = { ...currentBounds };
        const display = screen.getDisplayMatching(currentBounds);
        const workArea = display.workArea;
        const targetWidth = Math.min(canvasSize.width, workArea.width - margin * 2);
        const targetHeight = Math.min(canvasSize.height, workArea.height - margin * 2);
        const newX = Math.max(workArea.x + margin, Math.min(currentBounds.x, workArea.x + workArea.width - targetWidth - margin));
        const newY = Math.max(workArea.y + margin, Math.min(currentBounds.y, workArea.y + workArea.height - targetHeight - margin));

        animateResize({ x: newX, y: newY, width: targetWidth, height: targetHeight }, targetWin, activeView);
    } else {
        if (targetWin.prevBounds) {
            animateResize(targetWin.prevBounds, targetWin, activeView);
            targetWin.prevBounds = null;
        } else {
            const newBounds = { ...originalSize, x: currentBounds.x, y: currentBounds.y };
            animateResize(newBounds, targetWin, activeView);
            setTimeout(() => { if (targetWin && !targetWin.isDestroyed()) targetWin.center(); }, 210);
        }
    }

    // Restore scroll position after animation completes
    if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
        // Try multiple times to ensure scroll position is restored
        const restoreScroll = () => {
            if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
                activeView.webContents.executeJavaScript(
                    `(document.scrollingElement || document.documentElement).scrollTop = ${scrollY};`
                ).catch(console.error);
            }
        };

        setTimeout(restoreScroll, 100);
        setTimeout(restoreScroll, 300);
        setTimeout(restoreScroll, 500);
    }
}

function animateResize(targetBounds, activeWin, activeView, duration_ms = 200) {
    if (!activeWin || activeWin.isDestroyed()) return;

    const start = activeWin.getBounds();
    const steps = 20;
    const interval = duration_ms / steps;
    const delta = {
        x: (targetBounds.x - start.x) / steps,
        y: (targetBounds.y - start.y) / steps,
        width: (targetBounds.width - start.width) / steps,
        height: (targetBounds.height - start.height) / steps
    };
    let i = 0;

    function step() {
        i++;
        const b = {
            x: Math.round(start.x + delta.x * i),
            y: Math.round(start.y + delta.y * i),
            width: Math.round(start.width + delta.width * i),
            height: Math.round(start.height + delta.height * i)
        };
        if (activeWin && !activeWin.isDestroyed()) {
            activeWin.setBounds(b);
            if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
                activeView.setBounds({ x: 0, y: 30, width: b.width, height: b.height - 30 });
                // Force repaint on final step to ensure proper rendering
                if (i >= steps) {
                    try {
                        activeView.webContents.invalidate();
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }
            if (i < steps) setTimeout(step, interval);
        }
    }
    step();
}

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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    notificationWin.loadFile('html/notification.html');

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

    const sendToNotificationWindow = (data) => {
        if (!notificationWin || notificationWin.isDestroyed()) return;
        const wc = notificationWin.webContents;
        const send = () => wc.send('notification-data', data);
        if (wc.isLoadingMainFrame()) {
            wc.once('did-finish-load', send);
        } else {
            send();
        }
    };

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

// ================================================================= //
// Update Management
// ================================================================= //

function scheduleDailyUpdateCheck() {
    // Check if daily update check is disabled in settings
    if (settings.disableAutoUpdateCheck) {
        console.log('Automatic update checks are disabled in settings.');
        return;
    }

    const checkForUpdates = async () => {
        console.log('Checking for updates...');
        try {
            await autoUpdater.checkForUpdates();
        } catch (error) {
            console.error('Background update check failed. This is not critical and will be ignored:', error.message);
        }
    };

    checkForUpdates();
    // Check for updates once every 24 hours (24 * 60 * 60 * 1000 milliseconds)
    setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    updateWin.loadFile('html/update-available.html');

    updateWin.once('ready-to-show', async () => {
        if (!updateWin) return;
        updateWin.show();
        updateWin.webContents.send('update-info', { status: 'checking' });
        try {
            await autoUpdater.checkForUpdates();
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
        width: 420, height: 500, frame: false, resizable: false,
        show: false, parent: parentWindow, modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    installUpdateWin.loadFile('html/install-update-confirm.html');

    installUpdateWin.once('ready-to-show', () => {
        if (!installUpdateWin) return;
        installUpdateWin.show();
    });

    installUpdateWin.on('closed', () => {
        installUpdateWin = null;
    });
}

async function showInstallConfirmation() {
    if (!updateInfo) return;

    openInstallUpdateWindow();

    // Fetch release notes and show install confirmation
    try {
        const { marked } = await import('marked');
        const options = { hostname: 'api.github.com', path: '/repos/hillelkingqt/GeminiDesk/releases/latest', method: 'GET', headers: { 'User-Agent': 'GeminiDesk-App' } };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let releaseNotesHTML = '<p>Could not load release notes.</p>';
                try {
                    const releaseInfo = JSON.parse(data);
                    if (releaseInfo.body) { releaseNotesHTML = marked.parse(releaseInfo.body); }
                } catch (e) { console.error('Failed to parse release notes JSON:', e); }

                if (installUpdateWin && !installUpdateWin.isDestroyed()) {
                    installUpdateWin.webContents.send('install-update-info', {
                        status: 'ready-to-install',
                        version: updateInfo.version,
                        releaseNotesHTML: releaseNotesHTML
                    });
                }
            });
        });
        req.on('error', (e) => {
            if (installUpdateWin && !installUpdateWin.isDestroyed()) {
                installUpdateWin.webContents.send('install-update-info', { status: 'error', message: e.message });
            }
        });
        req.end();
    } catch (importError) {
        if (installUpdateWin && !installUpdateWin.isDestroyed()) {
            installUpdateWin.webContents.send('install-update-info', { status: 'error', message: 'Failed to load modules.' });
        }
    }
}

function checkAndShowPendingUpdateReminder(retryCount = 0) {
    // Check if there's a pending update reminder from a previous session
    if (settings.updateInstallReminderTime) {
        // Validate the timestamp
        const reminderTime = new Date(settings.updateInstallReminderTime);

        // Check if the date is valid
        if (isNaN(reminderTime.getTime())) {
            console.error('Invalid update reminder timestamp, clearing it');
            settings.updateInstallReminderTime = null;
            saveSettings(settings);
            return;
        }

        // Restore updateInfo from settings if available
        if (!updateInfo && settings.pendingUpdateInfo) {
            updateInfo = settings.pendingUpdateInfo;
            console.log('Restored pending update info from settings:', updateInfo.version);
        }

        // If we still don't have updateInfo, we need to check for updates first
        if (!updateInfo) {
            if (retryCount >= MAX_UPDATE_CHECK_RETRIES) {
                console.error(`Max update check retries (${MAX_UPDATE_CHECK_RETRIES}) reached, clearing reminder`);
                settings.updateInstallReminderTime = null;
                saveSettings(settings);
                return;
            }

            console.log(`No update info available, checking for updates before showing reminder (attempt ${retryCount + 1}/${MAX_UPDATE_CHECK_RETRIES})`);
            // Schedule a check after autoUpdater is ready
            setTimeout(async () => {
                try {
                    await autoUpdater.checkForUpdates();
                    // After update check, re-run this function with incremented retry count
                    checkAndShowPendingUpdateReminder(retryCount + 1);
                } catch (error) {
                    console.error('Failed to check for updates for pending reminder:', error.message);
                    // Clear the reminder if we can't check for updates
                    settings.updateInstallReminderTime = null;
                    saveSettings(settings);
                }
            }, UPDATER_INITIALIZATION_DELAY_MS);
            return;
        }

        const now = new Date();

        if (now >= reminderTime) {
            // Reminder time has passed, show the install confirmation
            console.log('Showing pending update reminder from previous session');
            showInstallConfirmation();
            // Clear the reminder
            settings.updateInstallReminderTime = null;
            saveSettings(settings);
        } else {
            // Schedule the reminder for the future
            const delay = reminderTime.getTime() - now.getTime();
            console.log(`Scheduling update reminder in ${Math.round(delay / 1000 / 60)} minutes`);
            reminderTimeoutId = setTimeout(() => {
                showInstallConfirmation();
                settings.updateInstallReminderTime = null;
                saveSettings(settings);
            }, delay);
        }
    }
}

const sendUpdateStatus = (status, data = {}) => {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('update-status', { status, ...data });
        }
    });
};

// Store update info for later use
let updateInfo = null;

// Reminder timeout ID for "remind me in 1 hour"
let reminderTimeoutId = null;

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
                console.log('Pasting file from clipboard:', filePath);

                setTimeout(() => {
                    if (targetWin && !targetWin.isDestroyed()) {
                        applyAlwaysOnTopSetting(targetWin, settings.alwaysOnTop);
                    }
                }, 200);
            }
            filePathToProcess = null;
        }, 300);

    } catch (error) {
        console.error('Failed to process file for pasting:', error);
        dialog.showErrorBox('File Error', 'Could not copy the selected file to the clipboard.');
        if (targetWin) {
            applyAlwaysOnTopSetting(targetWin, settings.alwaysOnTop);
        }
    }
}

// ================================================================= //
// Internal Agent Management
// ================================================================= //

// ================================================================= //
// IPC Handlers
// ================================================================= //
// Deep Research Schedule Window
let deepResearchScheduleWin = null;
let pdfDirectionWin = null;
let exportFormatWin = null;
let selectedPdfDirection = null;
let selectedExportFormat = null;
let pendingPdfExportData = null;

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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    deepResearchScheduleWin.loadFile('html/deep-research-schedule.html');

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

ipcMain.on('execute-shortcut', (event, action) => {
    if (shortcutActions[action]) {
        shortcutActions[action]();
    }
});

ipcMain.on('ai-response-completed', () => {
    console.log('🔊 Main process received ai-response-completed event, playing sound...');
    playAiCompletionSound();
});

ipcMain.on('select-app-mode', (event, mode) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (senderWindow && !senderWindow.isDestroyed()) {
        // --- Restore original window size ---
        senderWindow.setResizable(true); // Re-enable resizing
        senderWindow.setBounds(originalSize);
        senderWindow.center();
        // ------------------------------------

        // Accept either a mode string or an object { mode: 'gemini'|'aistudio', accountIndex: n }
        let targetMode = mode;
        if (mode && typeof mode === 'object') {
            targetMode = mode.mode;
            if (typeof mode.accountIndex === 'number') {
                // switch current account globally and load the requested account
                accountsModule.switchAccount(mode.accountIndex);
                loadGemini(targetMode, senderWindow, undefined, { accountIndex: mode.accountIndex });
                return;
            }
        }

        loadGemini(targetMode, senderWindow);
    }
});

// Toggle app mode (switch between Gemini and AI Studio)
ipcMain.on('toggle-app-mode', (event, newMode) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (senderWindow && !senderWindow.isDestroyed()) {
        const targetMode = newMode || (senderWindow.appMode === 'gemini' ? 'aistudio' : 'gemini');
        loadGemini(targetMode, senderWindow);
        // Notify the window of the mode change
        senderWindow.webContents.send('app-mode-changed', targetMode);
        // Also update the taskbar grouping
        updateWindowAppUserModelId(senderWindow, targetMode);
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

ipcMain.on('toggle-full-screen', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        const view = win.getBrowserView();

        // Save scroll position before toggling
        let scrollY = 0;
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            try {
                scrollY = await view.webContents.executeJavaScript(
                    `(document.scrollingElement || document.documentElement).scrollTop`
                );
                win.savedScrollPosition = scrollY;
                console.log('Fullscreen: Saved scroll position:', scrollY);
            } catch (e) {
                console.log('Fullscreen: Could not save scroll position:', e.message);
            }
        }

        // Store current bounds if not maximized (for restoration)
        if (!win.isMaximized()) {
            win.prevNormalBounds = win.getBounds();
        }

        if (win.isMaximized()) {
            // Restore from fullscreen/maximized
            win.unmaximize();

            // Restore original "always on top" state from settings
            setTimeout(() => {
                if (win && !win.isDestroyed()) {
                    applyAlwaysOnTopSetting(win, settings.alwaysOnTop);
                    win.focus();

                    // Restore to saved bounds if available
                    if (win.prevNormalBounds) {
                        win.setBounds(win.prevNormalBounds);
                        win.prevNormalBounds = null;
                    }

                    // Update BrowserView bounds after unmaximize
                    const view = win.getBrowserView();
                    if (view) {
                        const contentBounds = win.getContentBounds();
                        view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                        // Force repaint after setting bounds
                        if (view.webContents && !view.webContents.isDestroyed()) {
                            try {
                                view.webContents.invalidate();
                            } catch (e) {
                                // Ignore errors
                            }
                        }
                    }
                }
            }, 50);
        } else {
            // Enter fullscreen/maximized
            // Temporarily disable "always on top" before maximizing
            win.setAlwaysOnTop(false);
            setTimeout(() => {
                if (win && !win.isDestroyed()) {
                    win.maximize();
                    win.focus();

                    // Update BrowserView bounds after maximize to fix scrollbar
                    setTimeout(() => {
                        if (win && !win.isDestroyed()) {
                            const view = win.getBrowserView();
                            if (view) {
                                const contentBounds = win.getContentBounds();
                                view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                                // Force repaint after setting bounds
                                if (view.webContents && !view.webContents.isDestroyed()) {
                                    try {
                                        view.webContents.invalidate();
                                    } catch (e) {
                                        // Ignore errors
                                    }
                                }
                            }
                        }
                    }, 100);
                }
            }, 50);
        }

        // Restore scroll position after toggling - multiple attempts with proper timing
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            const restoreScroll = async () => {
                if (view && !view.webContents.isDestroyed()) {
                    try {
                        await view.webContents.executeJavaScript(
                            `(document.scrollingElement || document.documentElement).scrollTop = ${scrollY};`
                        );
                        console.log('Fullscreen: Restored scroll position to', scrollY);
                    } catch (e) {
                        console.log('Fullscreen: Could not restore scroll position:', e.message);
                    }
                }
            };

            // Multiple restoration attempts with proper delays for different window states
            setTimeout(restoreScroll, 100);   // Quick restore
            setTimeout(restoreScroll, 300);   // After layout
            setTimeout(restoreScroll, 600);   // After animation
            setTimeout(restoreScroll, 1000);  // Final attempt
            setTimeout(restoreScroll, 1500);  // Safety net
        }
    }
});


// ================================================================= //
// Theme Management
// ================================================================= //

function broadcastThemeChange(newTheme) {
    const themeToSend = newTheme === 'system'
        ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
        : newTheme;

    // Use this function to send the update to both main window and BrowserView
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
    broadcastThemeChange(newTheme);
    syncThemeWithWebsite(newTheme);
});


// Automatically create MCP config and launch proxy in background
ipcMain.handle('mcp-setup-doitforme', async () => {
    try {
        const userDataDir = app.getPath('userData');
        const cfgDir = path.join(userDataDir, 'mcp');
        const cfgPath = path.join(cfgDir, 'config.json');

        if (!fs.existsSync(cfgDir)) {
            fs.mkdirSync(cfgDir, { recursive: true });
        }

        // Minimal default config using Desktop Commander
        const defaultConfig = {
            mcpServers: {
                'desktop-commander': {
                    command: 'npx',
                    args: ['-y', '@wonderwhy-er/desktop-commander']
                }
            }
        };

        // Write or overwrite config.json
        try {
            fs.writeFileSync(cfgPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        } catch (e) {
            return { success: false, step: 'write-config', message: e && e.message ? e.message : String(e) };
        }

        // If already running, return success with existing info
        if (mcpProxyProcess && !mcpProxyProcess.killed) {
            return { success: true, reused: true, configPath: cfgPath, url: 'http://localhost:3006/sse' };
        }

        // Launch the proxy server in a VISIBLE terminal window (so user sees it running)
        try {
            const proxyCmd = `npx -y @srbhptl39/mcp-superassistant-proxy@latest --config "${cfgPath}" --outputTransport sse`;
            if (process.platform === 'win32') {
                // Open a new PowerShell window with -NoExit so it stays open
                // Using cmd /c start ... to ensure a new window is spawned
                spawn('cmd.exe', ['/c', 'start', 'powershell.exe', '-NoExit', '-Command', proxyCmd], {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: false,
                    env: { ...process.env }
                }).unref();
                // We cannot reliably track the child PID started via 'start', so do not set mcpProxyProcess
            } else if (process.platform === 'darwin') {
                // On macOS, open a visible Terminal.app window with the command
                // Use osascript to tell Terminal to run the command in a new window
                const escapedCmd = proxyCmd.replace(/"/g, '\\"');
                const appleScript = `tell application "Terminal"
                    activate
                    do script "${escapedCmd}"
                end tell`;
                spawn('osascript', ['-e', appleScript], {
                    detached: true,
                    stdio: 'ignore',
                    env: { ...process.env }
                }).unref();
            } else {
                // On Linux, try common terminal emulators in order of preference
                const terminals = [
                    { cmd: 'gnome-terminal', args: ['--', 'bash', '-c', `${proxyCmd}; exec bash`] },
                    { cmd: 'konsole', args: ['-e', 'bash', '-c', `${proxyCmd}; exec bash`] },
                    { cmd: 'xfce4-terminal', args: ['-e', `bash -c "${proxyCmd}; exec bash"`] },
                    { cmd: 'xterm', args: ['-hold', '-e', proxyCmd] }
                ];

                let launched = false;
                for (const term of terminals) {
                    try {
                        // Check if terminal exists using 'which'
                        const which = require('child_process').spawnSync('which', [term.cmd]);
                        if (which.status === 0) {
                            spawn(term.cmd, term.args, {
                                detached: true,
                                stdio: 'ignore',
                                env: { ...process.env }
                            }).unref();
                            launched = true;
                            break;
                        }
                    } catch (e) {
                        // Try next terminal
                    }
                }

                // Fallback: run in background if no terminal found
                if (!launched) {
                    const child = spawn('npx', ['-y', '@srbhptl39/mcp-superassistant-proxy@latest', '--config', cfgPath, '--outputTransport', 'sse'], {
                        shell: true,
                        detached: true,
                        stdio: 'ignore',
                        env: { ...process.env }
                    });
                    child.unref();
                    mcpProxyProcess = child;
                }
            }
        } catch (e) {
            return { success: false, step: 'spawn-proxy', message: e && e.message ? e.message : String(e) };
        }

        return { success: true, configPath: cfgPath, url: 'http://localhost:3006/sse', visibleShell: true };
    } catch (err) {
        return { success: false, step: 'unexpected', message: err && err.message ? err.message : String(err) };
    }
});

// ================================================================= //
// Recording Special Shortcuts (Alt+Space interception)
// ================================================================= //

ipcMain.on('start-recording-shortcut', (event) => {
    try {
        const registered = globalShortcut.register('Alt+Space', () => {
            console.log('Intercepted Alt+Space during recording');
            event.sender.send('shortcut-captured', 'Alt+Space');
        });

        if (!registered) {
            console.log('Failed to register Alt+Space for recording');
        } else {
            console.log('Global shortcut registered for recording: Alt+Space');
        }
    } catch (err) {
        console.error('Error registering recording shortcut:', err);
    }
});

ipcMain.on('stop-recording-shortcut', () => {
    try {
        globalShortcut.unregister('Alt+Space');
        console.log('Unregistered Alt+Space (recording mode stopped)');
        registerShortcuts();
    } catch (err) {
        console.error('Error stopping recording shortcut:', err);
    }
});

// ================================================================= //
// App Lifecycle
// ================================================================= //

app.whenReady().then(() => {
    syncThemeWithWebsite(settings.theme);

    // Apply proxy settings on startup if configured
    applyProxySettings();

    // Initialize modules with dependencies
    deepResearchModule.initialize({
        settings,
        createWindow,
        shortcutActions,
    playAiCompletionSound,
    sendNotification,
    translations
    });

    accountsModule.initialize({
        settings,
        saveSettings,
        tray: null, // Will be set after creation
        createWindow,
        Menu
    });

    trayModule.initialize({
        createWindow,
        forceOnTop
    });

    // Ensure AI Studio RTL cookie matches saved setting at startup so the
    // content script sees the correct default when pages load.
    (async () => {
        try {
            const boolVal = !!settings.aiStudioRtlEnabled;
            const setCookieForSession = async (sess) => {
                try {
                    if (!sess || !sess.cookies || typeof sess.cookies.set !== 'function') return;
                    await sess.cookies.set({
                        url: 'https://aistudio.google.com',
                        name: 'geminidesk_rtl',
                        value: boolVal ? '1' : '0',
                        path: '/',
                        secure: true,
                        httpOnly: false,
                        expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
                    });
                } catch (e) { }
            };

            try { await setCookieForSession(session.defaultSession); } catch (e) { }
            try { if (constants && constants.SESSION_PARTITION) await setCookieForSession(session.fromPartition(constants.SESSION_PARTITION, { cache: true })); } catch (e) { }
            try {
                if (settings && Array.isArray(settings.accounts)) {
                    for (let i = 0; i < settings.accounts.length; i++) {
                        try {
                            const partName = accountsModule.getAccountPartition(i);
                            await setCookieForSession(session.fromPartition(partName, { cache: true }));
                        } catch (e) { }
                    }
                }
            } catch (e) { }
        } catch (e) {
            console.warn('Failed to apply AI Studio RTL cookie at startup:', e && e.message ? e.message : e);
        }
        // Ensure geminimark cookie matches saved setting at startup so the
        // geminimark content script sees the correct default when pages load.
        try {
            const gmBool = (settings && typeof settings.geminimarkEnabled !== 'undefined') ? !!settings.geminimarkEnabled : true;
            const setGmCookieForSession = async (sess) => {
                try {
                    if (!sess || !sess.cookies || typeof sess.cookies.set !== 'function') return;
                    await sess.cookies.set({
                        url: 'https://gemini.google.com',
                        name: 'geminidesk_geminimark',
                        value: gmBool ? '1' : '0',
                        path: '/',
                        secure: true,
                        httpOnly: false,
                        expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
                    });
                } catch (e) { }
            };

            try { await setGmCookieForSession(session.defaultSession); } catch (e) { }
            try { if (constants && constants.SESSION_PARTITION) await setGmCookieForSession(session.fromPartition(constants.SESSION_PARTITION, { cache: true })); } catch (e) { }
            try {
                if (settings && Array.isArray(settings.accounts)) {
                    for (let i = 0; i < settings.accounts.length; i++) {
                        try {
                            const partName = accountsModule.getAccountPartition(i);
                            await setGmCookieForSession(session.fromPartition(partName, { cache: true }));
                        } catch (e) { }
                    }
                }
            } catch (e) { }
        } catch (e) {
            console.warn('Failed to apply geminimark cookie at startup:', e && e.message ? e.message : e);
        }
    })();

    // Create system tray icon
    tray = trayModule.createTray();
    accountsModule.setTray(tray);
    trayModule.setUpdateTrayCallback(updateTrayContextMenu);

    // Enable spell checking with multiple languages (unless disabled)
    const spellcheckEnabled = !settings.disableSpellcheck;
    session.defaultSession.setSpellCheckerEnabled(spellcheckEnabled);
    // Support common languages: English, Hebrew, German, French, Spanish, Russian, etc.
    session.defaultSession.setSpellCheckerLanguages(['en-US', 'he-IL', 'de-DE', 'fr-FR', 'es-ES', 'ru-RU', 'it-IT', 'pt-BR', 'nl-NL', 'pl-PL', 'tr-TR']);

    // Initialize first account if none exist
    if (!settings.accounts || settings.accounts.length === 0) {
        addAccount('Default Account');
        settings.currentAccountIndex = 0;
        saveSettings(settings);
    }

    // Also enable for Gemini session and set user agent (use current account's partition)
    const gemSession = session.fromPartition(getCurrentAccountPartition());
    gemSession.setSpellCheckerEnabled(spellcheckEnabled);
    gemSession.setSpellCheckerLanguages(['en-US', 'he-IL', 'de-DE', 'fr-FR', 'es-ES', 'ru-RU', 'it-IT', 'pt-BR', 'nl-NL', 'pl-PL', 'tr-TR']);
    gemSession.setUserAgent(REAL_CHROME_UA);

    // Apply session filters for AI Studio support
    setupSessionFilters(session.defaultSession);
    setupSessionFilters(gemSession);

    // Disable background throttling globally to keep AI responses working when hidden
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
    app.commandLine.appendSwitch('disable-renderer-backgrounding');

    // Hide dock on macOS when alwaysOnTop is enabled to allow window on top of fullscreen apps
    // Credit: https://github.com/astron8t-voyagerx
    if (process.platform === 'darwin' && settings.alwaysOnTop) {
        app.dock.hide();
    }

    // Start Deep Research Schedule monitoring
    scheduleDeepResearchCheck();

    // Check if we have windows to restore from update (this takes priority)
    const hasPreUpdateWindows = settings.preUpdateWindowStates && Array.isArray(settings.preUpdateWindowStates) && settings.preUpdateWindowStates.length > 0;

    if (!hasPreUpdateWindows) {
        // Only create windows from normal restore/new if we're not restoring from update
        const shouldShow = !settings.startMinimized && !settings.startInBackground;
        if (settings.restoreWindows && Array.isArray(settings.savedWindows) && settings.savedWindows.length) {
            settings.savedWindows.forEach(state => createWindow(state, shouldShow));
        } else {
            createWindow(null, shouldShow);
        }
    }

    // --- 1. Handle permission requests (like microphone) ---
    const ses = session.defaultSession;
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
        // Check if request is for 'media' (includes microphone)
        if (permission === 'media') {
            // Automatically approve the permission every time
            callback(true);
        } else {
            // Deny any other permission request for security reasons
            callback(false);
        }
    });

    // --- 2. Fix for Windows screenshot bug causing windows to disappear ---
    const preventWindowHiding = () => {
        const allWindows = BrowserWindow.getAllWindows();
        allWindows.forEach(win => {
            if (win && !win.isDestroyed() && win.isVisible()) {
                // Temporarily set window to "always on top" to prevent it from hiding
                win.setAlwaysOnTop(true);
                setTimeout(() => {
                    if (win && !win.isDestroyed()) {
                        // Restore original "always on top" setting from settings
                        applyAlwaysOnTopSetting(win, settings.alwaysOnTop);
                    }
                }, 3000); // Restore state after 3 seconds
            }
        });
    };

    // --- 3. Register shortcuts and startup settings ---
    registerShortcuts();
    if (settings.autoStart) {
        setAutoLaunch(true);
    }

    // --- 4. Auto-updater system settings ---
    autoUpdater.autoDownload = false;
    autoUpdater.forceDevUpdateConfig = true; // Good for testing, can remain
    autoUpdater.disableDifferentialDownload = true; // Disable differential downloads to avoid ENOENT errors

    // --- 4b. Restore windows from previous session if app was relaunched after update ---
    let restoredFromUpdate = false;
    if (settings.preUpdateWindowStates && Array.isArray(settings.preUpdateWindowStates) && settings.preUpdateWindowStates.length > 0) {
        console.log('Restoring windows after update:', settings.preUpdateWindowStates.length, 'windows');
        restoredFromUpdate = true;

        // Small delay to ensure app is fully ready
        setTimeout(() => {
            settings.preUpdateWindowStates.forEach((state, index) => {
                try {
                    createWindow(state);
                } catch (e) {
                    console.warn('Failed to restore window', index, ':', e);
                }
            });

            // Clear the saved states
            settings.preUpdateWindowStates = null;
            saveSettings(settings);
        }, 1000);
    }

    // --- 4c. Check for pending update reminders from previous session ---
    checkAndShowPendingUpdateReminder();

    // --- 5. Start server notifications system ---
    checkForNotifications(); // Perform one initial check immediately on app launch
    scheduleNotificationCheck();

    // --- 6. Handle file opening via "Open With" ---
    if (filePathToProcess) {
        const primaryWindow = BrowserWindow.getAllWindows()[0];
        if (primaryWindow) {
            const primaryView = primaryWindow.getBrowserView();
            if (primaryView) {
                // Wait until Gemini content is fully loaded before pasting file
                primaryView.webContents.once('did-finish-load', () => {
                    setTimeout(() => {
                        handleFileOpen(filePathToProcess);
                    }, 1000);
                });
            }
        }
    }

    // --- 7. Schedule daily update check ---
    scheduleDailyUpdateCheck();

    // Clear any stale preUpdateWindowStates that might exist
    if (!restoredFromUpdate && settings.preUpdateWindowStates) {
        console.log('Clearing stale preUpdateWindowStates');
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

    // Clear update reminder timeout
    if (reminderTimeoutId) {
        clearTimeout(reminderTimeoutId);
        reminderTimeoutId = null;
    }

    try {
        if (mcpProxyProcess && !mcpProxyProcess.killed) {
            process.kill(mcpProxyProcess.pid);
        }
    } catch (e) {
        // ignore kill errors
    }
});

app.on('window-all-closed', () => {
    // On macOS and Linux, keep app running in system tray even when all windows are closed
    // On Windows, this is also common behavior for tray applications
    if (process.platform !== 'darwin' && process.platform !== 'linux' && process.platform !== 'win32') {
        app.quit();
    }
    // For all platforms with tray icon, we keep the app running in the background
});

app.on('before-quit', async () => {
    try {
        // Flush cookies for current account
        const s = session.fromPartition(getCurrentAccountPartition());
        if (s && s.cookies && typeof s.cookies.flushStore === 'function') {
            await s.cookies.flushStore();
        } else if (s && typeof s.flushStorageData === 'function') {
            // Older Electron versions
            await s.flushStorageData();
        }
    } catch (e) {
        console.error('Failed to flush cookies store:', e);
    }
});

ipcMain.on('check-for-updates', () => {
    openUpdateWindowAndCheck();
});

ipcMain.on('manual-check-for-notifications', () => {
    checkForNotifications(true); // true = isManualCheck
});

ipcMain.on('open-release-notes', (event, version) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const releaseNotesWin = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        parent: parentWindow,
        modal: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    releaseNotesWin.loadFile('html/release-notes.html');

    releaseNotesWin.once('ready-to-show', () => {
        releaseNotesWin.show();
        // Fetch release notes from GitHub API
        const url = `https://api.github.com/repos/hillelkingqt/GeminiDesk/releases/tags/v${version}`;
        fetch(url)
            .then(res => res.json())
            .then(json => {
                if (json.body) {
                    releaseNotesWin.webContents.send('release-notes-content', { version, notes: json.body });
                } else {
                    releaseNotesWin.webContents.send('release-notes-content', { version, notes: 'No release notes found for this version.' });
                }
            })
            .catch(err => {
                console.error('Failed to fetch release notes:', err);
                releaseNotesWin.webContents.send('release-notes-content', { version, notes: 'Could not load release notes.' });
            });
    });
});




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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    updateWin.loadFile('html/update-available.html');

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

autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('checking');
});

autoUpdater.on('update-available', async (info) => {
    updateInfo = info; // Store update info

    // Persist updateInfo to settings for recovery after restart
    settings.pendingUpdateInfo = {
        version: info.version,
        releaseNotes: info.releaseNotes || '',
        releaseDate: info.releaseDate || ''
    };
    saveSettings(settings);

    // Check if auto-install is enabled
    const autoInstall = settings.autoInstallUpdates !== false;

    if (autoInstall) {
        // Auto-install mode: Start downloading immediately
        console.log('Auto-install enabled, starting download...');

        // If update window is open (manual check), show brief update found message before transitioning
        if (updateWin && !updateWin.isDestroyed()) {
            // Show update available message briefly to inform user
            updateWin.webContents.send('update-info', {
                status: 'update-available',
                version: info.version,
                releaseNotesHTML: `<p>Automatic download will start shortly...</p>`
            });

            // After configured duration, close updateWin and open installUpdateWin
            setTimeout(() => {
                try {
                    if (updateWin && !updateWin.isDestroyed()) {
                        updateWin.close();
                    }
                    openInstallUpdateWindow();
                    autoUpdater.downloadUpdate();
                } catch (error) {
                    console.error('Error starting auto-update download:', error);
                    // If download fails, show error in update window if it still exists
                    if (updateWin && !updateWin.isDestroyed()) {
                        updateWin.webContents.send('update-info', {
                            status: 'error',
                            message: 'Failed to start download: ' + (error.message || 'Unknown error')
                        });
                    }
                }
            }, UPDATE_FOUND_DISPLAY_DURATION_MS);
        } else {
            // No update window open (automatic background check)
            try {
                console.log('Starting background update download...');
                autoUpdater.downloadUpdate();
            } catch (error) {
                console.error('Error starting auto-update download (background):', error);
            }
        }
    } else {
        // Manual mode: Show the update available dialog
        if (!updateWin) {
            // If window wasn't manually opened, open it now (in case of automatic check)
            openUpdateWindowAndCheck();
            return; // Function will call itself again after window is ready
        }

        try {
            const { marked } = await import('marked');
            const options = {
                hostname: 'api.github.com',
                path: '/repos/hillelkingqt/GeminiDesk/releases/latest',
                method: 'GET',
                headers: { 'User-Agent': 'GeminiDesk-App' }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    let releaseNotesHTML = '<p>Could not load release notes.</p>';
                    try {
                        const releaseInfo = JSON.parse(data);
                        if (releaseInfo.body) {
                            releaseNotesHTML = marked.parse(releaseInfo.body);
                        }
                    } catch (e) {
                        console.error('Failed to parse release notes JSON:', e);
                    }

                    if (updateWin) {
                        updateWin.webContents.send('update-info', {
                            status: 'update-available',
                            version: info.version,
                            releaseNotesHTML: releaseNotesHTML
                        });
                    }
                });
            });
            req.on('error', (e) => {
                if (updateWin) {
                    updateWin.webContents.send('update-info', { status: 'error', message: e.message });
                }
            });
            req.end();
        } catch (importError) {
            if (updateWin) {
                updateWin.webContents.send('update-info', { status: 'error', message: 'Failed to load modules.' });
            }
        }
    }
});

// Replace existing 'update-not-available' listener with this:
autoUpdater.on('update-not-available', (info) => {
    if (updateWin) {
        updateWin.webContents.send('update-info', { status: 'up-to-date' });
    }
    sendUpdateStatus('up-to-date'); // Also send to settings, just in case
});

// Replace existing 'error' listener with this:
autoUpdater.on('error', (err) => {
    if (updateWin) {
        updateWin.webContents.send('update-info', { status: 'error', message: err.message });
    }
    if (installUpdateWin && !installUpdateWin.isDestroyed()) {
        installUpdateWin.webContents.send('install-update-info', { status: 'error', message: err.message });
    }
    sendUpdateStatus('error', { message: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
    const progress = {
        percent: Math.round(progressObj.percent),
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
    };

    console.log(`Download progress: ${progress.percent}%`);
    sendUpdateStatus('downloading', progress);
});

autoUpdater.on('update-downloaded', async () => {
    sendUpdateStatus('downloaded');

    // Show install confirmation with changelog
    if (updateInfo) {
        // Make sure install window exists
        if (!installUpdateWin || installUpdateWin.isDestroyed()) {
            openInstallUpdateWindow();
        }
        showInstallConfirmation();
    } else {
        console.error('Update downloaded but no update info available');
    }
});

// ================================================================= //
// IPC Event Handlers
// ================================================================= //

ipcMain.on('open-download-page', () => {
    const repoUrl = `https://github.com/hillelkingqt/GeminiDesk/releases/latest`;
    shell.openExternal(repoUrl);
    // Close update window after opening browser
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

ipcMain.on('close-notification-window', () => {
    if (notificationWin) {
        notificationWin.close();
    }
});

ipcMain.on('close-personal-message-window', () => {
    if (personalMessageWin) {
        personalMessageWin.close();
    }
});

ipcMain.on('close-download-window', () => {
    if (downloadWin) {
        downloadWin.close();
    }
});

// Generic close window handler
ipcMain.on('close-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        win.close();
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
            // When explicitly requesting, we always treat it as 'found' to show the content.
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

ipcMain.on('install-update-now', () => {
    // Save current window state before updating
    try {
        const openWindows = BrowserWindow.getAllWindows().filter(w =>
            !w.isDestroyed() &&
            w !== updateWin &&
            w !== installUpdateWin &&
            w !== notificationWin &&
            w !== personalMessageWin
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

    // Clear pending update info and reminder
    settings.updateInstallReminderTime = null;
    settings.pendingUpdateInfo = null;
    saveSettings(settings);

    // Use silent install (isSilent=true) and force run after (isForceRunAfter=true)
    // This will install the update silently and automatically relaunch the app
    autoUpdater.quitAndInstall(true, true);
});

ipcMain.on('remind-later-update', () => {
    // Clear any existing reminder
    if (reminderTimeoutId) {
        clearTimeout(reminderTimeoutId);
        reminderTimeoutId = null;
    }

    // Close the install update window
    if (installUpdateWin) {
        installUpdateWin.close();
    }

    // Calculate reminder time (1 hour from now)
    const reminderTime = new Date();
    reminderTime.setTime(reminderTime.getTime() + UPDATE_REMINDER_DELAY_MS);

    // Save reminder time to settings for persistence across restarts
    settings.updateInstallReminderTime = reminderTime.toISOString();
    saveSettings(settings);

    // Set a reminder for 1 hour
    reminderTimeoutId = setTimeout(() => {
        showInstallConfirmation();
        // Clear the reminder from settings
        settings.updateInstallReminderTime = null;
        saveSettings(settings);
    }, UPDATE_REMINDER_DELAY_MS);

    console.log('Update reminder set for 1 hour from now:', reminderTime.toISOString());
});

ipcMain.on('close-install-update-window', () => {
    if (installUpdateWin) {
        installUpdateWin.close();
    }
});

ipcMain.on('open-new-window', () => {
    createWindow();
});

ipcMain.on('minimize-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        win.minimize();
    }
});

ipcMain.on('export-chat', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const view = win ? win.getBrowserView() : null;
    if (!view) return;

    try {
        // שלב 1: חילוץ הכותרת של הצ'אט לקביעת שם הקובץ (תומך ב-Gemini וב-AI Studio)
        const title = await view.webContents.executeJavaScript(`
            (() => {
                try {
                    const text = (el) => el ? (el.textContent || el.innerText || '').trim() : '';
                    if (location.hostname.includes('aistudio.google.com')) {
                        let el = document.querySelector('li.active a.prompt-link')
                              || document.querySelector('[data-test-id="conversation-title"]')
                              || document.querySelector('h1.conversation-title');
                        let t = text(el);
                        if (!t) t = (document.title || '').replace(/\s*\|\s*Google AI Studio$/i, '').trim();
                        return t || 'chat';
                    } else {
                        const el = document.querySelector('.conversation.selected .conversation-title')
                               || document.querySelector('[data-test-id="conversation-title"]');
                        return text(el) || (document.title || 'chat');
                    }
                } catch (e) {
                    return document.title || 'chat';
                }
            })();
        `);

        // שלב 2: חילוץ כל התוכן של הצ'אט כולל HTML מלא (AISTUDIO או GEMINI)
        const chatHTML = await view.webContents.executeJavaScript(`
            (async () => {
                // אם זה AI Studio - משתמשים במבנה ms-chat-turn, כולל גלילה כדי לטעון את כל ההודעות
                if (document.querySelector('ms-chat-turn') || location.hostname.includes('aistudio.google.com')) {
                    const conversation = [];

                    // פונקציית עזר להמתנה
                    const delay = (ms) => new Promise(r => setTimeout(r, ms));

                    // לגלול את מכולת ההודעות כדי לטעון את כולן (בשל וירטואליזציה)
                    const scrollContainer = document.querySelector('ms-autoscroll-container');
                    if (scrollContainer) {
                        // גלילה למעלה ואז עד למטה, בצעדים, כדי לגרום לטעינת כל ה-turns
                        try {
                            scrollContainer.scrollTop = 0;
                            await delay(120);
                            const step = Math.max(200, scrollContainer.clientHeight - 50);
                            for (let y = 0; y <= scrollContainer.scrollHeight + step; y += step) {
                                scrollContainer.scrollTop = y;
                                await delay(100);
                            }
                            // חזרה לראש לצורך סדר קריאה טבעי
                            scrollContainer.scrollTop = 0;
                            await delay(120);
                        } catch (_) {}
                    }

                    const turns = Array.from(document.querySelectorAll('ms-chat-turn'));
                    turns.forEach(turn => {
                        // קביעת סוג התור
                        const roleContainer = turn.querySelector('.virtual-scroll-container');
                        const roleAttr = roleContainer?.getAttribute('data-turn-role') || '';
                        const isUser = /user/i.test(roleAttr) || turn.querySelector('.user-prompt-container') !== null;
                        const isModel = /model/i.test(roleAttr) || turn.querySelector('.model-prompt-container') !== null;

                        const contentEl = turn.querySelector('.turn-content');
                        if (!contentEl) return;
                        const clone = contentEl.cloneNode(true);

                        // הסרה מפורשת של "תהליך חשיבה" והאייקונים/תמונות שלו
                        const thoughtSelectors = [
                            'ms-thought-chunk',
                            '.thought-panel',
                            '.thought-collapsed-text',
                            'img.thinking-progress-icon',
                            'mat-accordion.thought-panel',
                            'mat-expansion-panel.thought-panel',
                            // כל expansion panels שנמצאים בתוך ms-thought-chunk
                            'ms-thought-chunk mat-expansion-panel',
                            'ms-thought-chunk mat-accordion',
                            // ביטוי כללי למקרה שמחלקות משתנות
                            '[class*="thought"]'
                        ];
                        thoughtSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

                        // חילוץ LaTeX מקורי לפני שהדפדפן רינדר אותו
                        clone.querySelectorAll('math-inline, .math-inline, [class*="math-inline"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') || 
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');
                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }
                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }
                            if (latex) {
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$' + latex.trim() + '$');
                                marker.textContent = '$' + latex.trim() + '$';
                                mathEl.replaceWith(marker);
                            }
                        });
                        
                        clone.querySelectorAll('math-block, .math-block, [class*="math-block"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') || 
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');
                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }
                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }
                            if (latex) {
                                const marker = document.createElement('div');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$$' + latex.trim() + '$$');
                                marker.textContent = '$$' + latex.trim() + '$$';
                                mathEl.replaceWith(marker);
                            }
                        });
                        
                        clone.querySelectorAll('.katex, [class*="katex"]').forEach(katexEl => {
                            const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]');
                            if (annotation) {
                                const latex = annotation.textContent.trim();
                                const isDisplay = katexEl.closest('.katex-display') || katexEl.classList.contains('katex-display');
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                if (isDisplay) {
                                    marker.setAttribute('data-latex', '$$' + latex + '$$');
                                    marker.textContent = '$$' + latex + '$$';
                                } else {
                                    marker.setAttribute('data-latex', '$' + latex + '$');
                                    marker.textContent = '$' + latex + '$';
                                }
                                katexEl.replaceWith(marker);
                            }
                        });

                        // ניקוי אלמנטים מיותרים/תפעוליים
                        const removeSelectors = [
                            'button', 'ms-chat-turn-options', 'mat-menu', '.actions-container', '.actions',
                            '.mat-mdc-menu-trigger', '[aria-label*="Rerun" i]', '[aria-label*="options" i]',
                            '[name="rerun-button"]', '.author-label', '.turn-separator'
                        ];
                        removeSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

                        const text = (clone.textContent || '').trim();
                        const hasImg = !!clone.querySelector('img');
                        if (!text && !hasImg) return; // דחה הודעות ריקות לחלוטין

                        conversation.push({
                            type: isUser ? 'user' : 'model',
                            html: clone.innerHTML,
                            text: text
                        });
                    });
                    return conversation;
                }

                // אחרת - Gemini הישן
                const conversation = [];
                const conversationContainers = document.querySelectorAll('.conversation-container');

                conversationContainers.forEach(container => {
                    // שאילתת משתמש
                    const userQuery = container.querySelector('user-query .query-text');
                    if (userQuery) {
                        const clone = userQuery.cloneNode(true);

                        const userImageSelectors = [
                            'user-query img',
                            'user-query .attachment-container img',
                            'user-query .image-container img',
                            'user-query uploaded-image img'
                        ];

                        let userImagesFound = [];
                        userImageSelectors.forEach(selector => {
                            const imgs = container.querySelectorAll(selector);
                            imgs.forEach(img => {
                                const imgSrc = img.src || img.getAttribute('src');
                                if (imgSrc && imgSrc.startsWith('http') && !userImagesFound.includes(imgSrc)) {
                                    userImagesFound.push(imgSrc);
                                    const imgTag = document.createElement('img');
                                    imgTag.src = imgSrc;
                                    imgTag.alt = img.alt || img.getAttribute('alt') || 'User uploaded image';
                                    imgTag.style.maxWidth = '100%';
                                    imgTag.style.height = 'auto';
                                    imgTag.style.display = 'block';
                                    imgTag.style.margin = '15px auto';
                                    imgTag.style.borderRadius = '8px';
                                    const imgContainer = document.createElement('div');
                                    imgContainer.className = 'user-image-container';
                                    imgContainer.appendChild(imgTag);
                                    clone.appendChild(imgContainer);
                                }
                            });
                        });

                        clone.querySelectorAll('button, mat-icon').forEach(el => el.remove());

                        conversation.push({
                            type: 'user',
                            html: clone.innerHTML,
                            text: userQuery.innerText.trim()
                        });
                    }

                    // תשובת המודל
                    const modelResponse = container.querySelector('model-response .markdown');
                    if (modelResponse) {
                        const clone = modelResponse.cloneNode(true);

                        // חילוץ LaTeX מקורי לפני שהדפדפן רינדר אותו
                        // Gemini שומר את ה-LaTeX המקורי ב-annotation tags או ב-data attributes
                        clone.querySelectorAll('math-inline, .math-inline, [class*="math-inline"]').forEach(mathEl => {
                            // נסה למצוא את ה-LaTeX המקורי
                            let latex = mathEl.getAttribute('data-original') || 
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');
                            
                            // אם לא מצאנו, נסה בתוך annotation
                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }
                            
                            // אם לא מצאנו, נסה ב-semantics
                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }
                            
                            if (latex) {
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$' + latex.trim() + '$');
                                marker.textContent = '$' + latex.trim() + '$';
                                mathEl.replaceWith(marker);
                            }
                        });
                        
                        clone.querySelectorAll('math-block, .math-block, [class*="math-block"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') || 
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');
                            
                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }
                            
                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }
                            
                            if (latex) {
                                const marker = document.createElement('div');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$$' + latex.trim() + '$$');
                                marker.textContent = '$$' + latex.trim() + '$$';
                                mathEl.replaceWith(marker);
                            }
                        });
                        
                        // גם לחפש בתוך katex elements
                        clone.querySelectorAll('.katex, [class*="katex"]').forEach(katexEl => {
                            const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]');
                            if (annotation) {
                                const latex = annotation.textContent.trim();
                                const isDisplay = katexEl.closest('.katex-display') || katexEl.classList.contains('katex-display');
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                if (isDisplay) {
                                    marker.setAttribute('data-latex', '$$' + latex + '$$');
                                    marker.textContent = '$$' + latex + '$$';
                                } else {
                                    marker.setAttribute('data-latex', '$' + latex + '$');
                                    marker.textContent = '$' + latex + '$';
                                }
                                katexEl.replaceWith(marker);
                            }
                        });

                        const imageSelectors = [
                            'generated-image img',
                            '.attachment-container img',
                            'single-image img',
                            '.generated-images img',
                            'response-element img',
                            '.image-container img'
                        ];

                        let imagesFound = [];
                        imageSelectors.forEach(selector => {
                            const imgs = container.querySelectorAll(selector);
                            imgs.forEach(img => {
                                const imgSrc = img.src || img.getAttribute('src');
                                if (imgSrc && imgSrc.startsWith('http') && !imagesFound.includes(imgSrc)) {
                                    imagesFound.push(imgSrc);
                                    const imgTag = document.createElement('img');
                                    imgTag.src = imgSrc;
                                    imgTag.alt = img.alt || img.getAttribute('alt') || 'Generated image';
                                    imgTag.style.maxWidth = '100%';
                                    imgTag.style.height = 'auto';
                                    imgTag.style.display = 'block';
                                    imgTag.style.margin = '15px auto';
                                    imgTag.style.borderRadius = '8px';
                                    const imgContainer = document.createElement('div');
                                    imgContainer.className = 'generated-image-container';
                                    imgContainer.appendChild(imgTag);
                                    clone.insertBefore(imgContainer, clone.firstChild);
                                }
                            });
                        });

                        const existingImages = clone.querySelectorAll('img');
                        existingImages.forEach(img => {
                            const imgSrc = img.src || img.getAttribute('src');
                            if (imgSrc && imgSrc.startsWith('http')) {
                                img.style.maxWidth = '100%';
                                img.style.height = 'auto';
                                img.style.display = 'block';
                                img.style.margin = '15px auto';
                                img.style.borderRadius = '8px';
                            }
                        });

                        clone.querySelectorAll('button, .action-button, .copy-button, mat-icon, .export-sheets-button-container').forEach(el => el.remove());

                        conversation.push({
                            type: 'model',
                            html: clone.innerHTML,
                            text: modelResponse.innerText.trim()
                        });
                    }
                });

                return conversation;
            })();
        `);

        if (!chatHTML || chatHTML.length === 0) {
            dialog.showErrorBox('Export Failed', 'Could not find any chat content to export.');
            return;
        }

        // שמירת הנתונים לשימוש מאוחר יותר
        pendingPdfExportData = { win, title, chatHTML };

        // בדיקת הגדרת הייצוא
        const exportFormat = settings.exportFormat || 'ask';

        if (exportFormat === 'md') {
            // ייצוא ישיר ל-MD
            await exportToMarkdown(win, title, chatHTML);
            pendingPdfExportData = null;
        } else if (exportFormat === 'pdf') {
            // ייצוא ישיר ל-PDF - פתיחת חלון בחירת כיוון
            openPdfDirectionWindow(win);
        } else {
            // ask - פתיחת חלון בחירת פורמט
            openFormatChoiceWindow(win);
        }

    } catch (err) {
        console.error('Failed to prepare chat export:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while preparing the export.');
    }
});

function openFormatChoiceWindow(parentWin) {
    if (exportFormatWin) {
        exportFormatWin.focus();
        return;
    }

    exportFormatWin = new BrowserWindow({
        width: 550,
        height: 450,
        frame: false,
        resizable: false,
        show: false,
        parent: parentWin,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    exportFormatWin.loadFile('html/export-format-choice.html');

    exportFormatWin.once('ready-to-show', () => {
        if (exportFormatWin) exportFormatWin.show();
    });

    exportFormatWin.on('closed', () => {
        exportFormatWin = null;
        // אם בחרנו PDF, לא מנקים - נמתין לבחירת כיוון
        // אם בחרנו MD, כבר ניקינו אחרי הייצוא
        // אם סגרו בלי לבחור, ננקה הכל
        if (!selectedExportFormat) {
            pendingPdfExportData = null;
        }
        if (selectedExportFormat !== 'pdf') {
            selectedExportFormat = null;
        }
    });
}

function openPdfDirectionWindow(parentWin) {
    if (pdfDirectionWin) {
        pdfDirectionWin.focus();
        return;
    }

    pdfDirectionWin = new BrowserWindow({
        width: 550,
        height: 450,
        frame: false,
        resizable: false,
        show: false,
        parent: parentWin,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    pdfDirectionWin.loadFile('html/pdf-direction-choice.html');

    pdfDirectionWin.once('ready-to-show', () => {
        if (pdfDirectionWin) pdfDirectionWin.show();
    });

    pdfDirectionWin.on('closed', () => {
        pdfDirectionWin = null;
        // אם סגרו את החלון בלי לבחור כיוון (ביטול), ננקה הכל
        if (!selectedPdfDirection) {
            pendingPdfExportData = null;
            selectedExportFormat = null;
        }
    });
}

ipcMain.on('select-export-format', async (event, format) => {
    if (exportFormatWin) {
        exportFormatWin.close();
    }

    if (!pendingPdfExportData) {
        console.error('No pending export data found');
        return;
    }

    const { win, title, chatHTML } = pendingPdfExportData;
    selectedExportFormat = format;

    try {
        if (format === 'md') {
            await exportToMarkdown(win, title, chatHTML);
            pendingPdfExportData = null;
            selectedExportFormat = null;
        } else if (format === 'pdf') {
            // פתיחת חלון בחירת כיוון
            // שמירת המידע ל-pending כדי שיהיה זמין כש-select-pdf-direction ירוץ
            openPdfDirectionWindow(win);
            // לא מנקים את pendingPdfExportData כאן - הוא יתנקה אחרי שבוחרים כיוון
        }
    } catch (err) {
        console.error('Failed to export:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while exporting.');
        pendingPdfExportData = null;
        selectedExportFormat = null;
    }
});

async function exportToMarkdown(win, title, chatHTML) {
    try {
        // Get user's language for labels
        const userLang = settings.language || 'en';
        const t = translations[userLang] || translations.en;
        const userLabel = t['pdf-user-label'] || 'You:';
        const modelLabel = t['pdf-model-label'] || 'Gemini:';

        const { filePath } = await dialog.showSaveDialog(win, {
            title: 'Export Chat to Markdown',
            defaultPath: `${(title || 'chat').replace(/[\\/:*?"<>|]/g, '')}.md`,
            filters: [{ name: 'Markdown Files', extensions: ['md'] }]
        });

        if (!filePath) {
            console.log('User cancelled MD export.');
            return;
        }

        // Helper function to convert HTML to Markdown while preserving LaTeX
        function htmlToMarkdown(html) {
            let result = html;

            // Step 1: Extract and preserve LaTeX from annotation tags (MathML)
            const latexMap = new Map();
            let latexCounter = 0;

            // Extract LaTeX from annotation tags (this is where KaTeX stores original LaTeX)
            result = result.replace(/<annotation[^>]*encoding=["']application\/x-tex["'][^>]*>([\s\S]*?)<\/annotation>/gi, (_, latex) => {
                const placeholder = `__LATEX_${latexCounter}__`;
                latexMap.set(placeholder, latex.trim());
                latexCounter++;
                return placeholder;
            });

            // Extract display math blocks ($$...$$)
            result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
                const placeholder = `__LATEX_DISPLAY_${latexCounter}__`;
                latexMap.set(placeholder, `$$${latex.trim()}$$`);
                latexCounter++;
                return placeholder;
            });

            // Extract inline math ($...$) - but not currency like $50
            result = result.replace(/\$([^\$\n]+?)\$/g, (match, latex) => {
                // Skip if it looks like currency
                if (/^\d+([.,]\d+)?$/.test(latex.trim())) return match;
                const placeholder = `__LATEX_INLINE_${latexCounter}__`;
                latexMap.set(placeholder, `$${latex.trim()}$`);
                latexCounter++;
                return placeholder;
            });

            // Extract \[...\] display math
            result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, latex) => {
                const placeholder = `__LATEX_DISPLAY_${latexCounter}__`;
                latexMap.set(placeholder, `$$${latex.trim()}$$`);
                latexCounter++;
                return placeholder;
            });

            // Extract \(...\) inline math
            result = result.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
                const placeholder = `__LATEX_INLINE_${latexCounter}__`;
                latexMap.set(placeholder, `$${latex.trim()}$`);
                latexCounter++;
                return placeholder;
            });

            // Step 2: Remove MathML/SVG rendered math (keep only our placeholders)
            result = result.replace(/<math[\s\S]*?<\/math>/gi, '');
            result = result.replace(/<svg[\s\S]*?<\/svg>/gi, '');
            result = result.replace(/<span[^>]*class="[^"]*katex[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

            // Step 3: Remove script tags
            result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

            // Step 4: Extract images
            const images = [];
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
            let imgMatch;
            while ((imgMatch = imgRegex.exec(result)) !== null) {
                const imgSrc = imgMatch[1];
                const imgAlt = imgMatch[2] || 'Image';
                if (imgSrc && imgSrc.startsWith('http')) {
                    images.push({ src: imgSrc, alt: imgAlt });
                }
            }
            result = result.replace(/<img[^>]*>/gi, '');

            // Step 5: Convert code blocks
            // Handle pre > code blocks with language detection
            result = result.replace(/<pre[^>]*(?:data-language="([^"]*)")?[^>]*>\s*<code[^>]*(?:class="[^"]*language-([^"]*)[^"]*")?[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
                (_, dataLang, classLang, code) => {
                    const lang = dataLang || classLang || '';
                    const cleanCode = code
                        .replace(/<[^>]+>/g, '')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");
                    return `\n\`\`\`${lang}\n${cleanCode.trim()}\n\`\`\`\n`;
                });

            // Handle standalone pre blocks
            result = result.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
                const cleanCode = code
                    .replace(/<[^>]+>/g, '')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                return `\n\`\`\`\n${cleanCode.trim()}\n\`\`\`\n`;
            });

            // Convert inline code
            result = result.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, code) => {
                if (code.includes('__LATEX_')) return code;
                return `\`${code.replace(/<[^>]+>/g, '')}\``;
            });

            // Step 6: Convert headers
            result = result.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
                const cleanText = text.replace(/<[^>]+>/g, '').trim();
                return `\n${'#'.repeat(parseInt(level))} ${cleanText}\n\n`;
            });

            // Step 7: Convert text formatting
            result = result.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
            result = result.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
            result = result.replace(/<(del|s|strike)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~');
            result = result.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
            result = result.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '==$1==');

            // Step 8: Convert lists
            result = result.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
                const cleanContent = content.replace(/<[^>]+>/g, '').trim();
                return `- ${cleanContent}\n`;
            });
            result = result.replace(/<\/?[ou]l[^>]*>/gi, '\n');

            // Step 9: Convert blockquotes
            result = result.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
                const lines = content.replace(/<[^>]+>/g, '').trim().split('\n');
                return lines.map(line => `> ${line}`).join('\n') + '\n';
            });

            // Step 10: Convert tables
            result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
                let md = '\n';
                const rows = tableContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
                let isHeader = true;

                rows.forEach(row => {
                    const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
                    const cellContents = cells.map(cell => {
                        return cell.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/i, '$1')
                            .replace(/<[^>]+>/g, '')
                            .trim();
                    });

                    if (cellContents.length > 0) {
                        md += '| ' + cellContents.join(' | ') + ' |\n';
                        if (isHeader) {
                            md += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
                            isHeader = false;
                        }
                    }
                });

                return md + '\n';
            });

            // Step 11: Convert links
            result = result.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
                const cleanText = text.replace(/<[^>]+>/g, '').trim();
                return `[${cleanText}](${href})`;
            });

            // Step 12: Convert line breaks and paragraphs
            result = result.replace(/<br\s*\/?>/gi, '\n');
            result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
            result = result.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');

            // Step 13: Convert horizontal rules
            result = result.replace(/<hr[^>]*>/gi, '\n---\n');

            // Step 14: Remove remaining HTML tags
            result = result.replace(/<[^>]+>/g, '');

            // Step 15: Decode HTML entities
            result = result
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
                .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

            // Step 16: Restore LaTeX expressions
            latexMap.forEach((latex, placeholder) => {
                // Determine if it should be display or inline
                if (placeholder.includes('DISPLAY')) {
                    result = result.replace(new RegExp(placeholder, 'g'), `\n\n${latex}\n\n`);
                } else {
                    result = result.replace(new RegExp(placeholder, 'g'), latex.includes('$$') ? latex : `$${latex}$`);
                }
            });

            // Step 17: Clean up whitespace
            result = result.replace(/\n{3,}/g, '\n\n');
            result = result.trim();

            // Prepend images at the start
            let imagesMd = '';
            images.forEach(img => {
                imagesMd += `![${img.alt}](${img.src})\n\n`;
            });

            return imagesMd + result;
        }

        let mdContent = `# ${title}\n\n`;

        chatHTML.forEach(message => {
            if (message.type === 'user') {
                mdContent += `## ${userLabel}\n\n`;
                mdContent += htmlToMarkdown(message.html);
                mdContent += '\n\n---\n\n';
            } else {
                mdContent += `## ${modelLabel}\n\n`;
                mdContent += htmlToMarkdown(message.html);
                mdContent += '\n\n---\n\n';
            }
        });

        fs.writeFileSync(filePath, mdContent, 'utf-8');

        console.log(`MD successfully saved to ${filePath}`);

        // Check if user wants to open file after export
        if (settings.openFileAfterExport) {
            shell.openPath(filePath).catch(err => {
                console.error('Failed to open MD file:', err);
            });
        }

        dialog.showMessageBox(win, {
            type: 'info',
            title: 'Export Successful',
            message: 'Chat exported successfully to Markdown!',
            buttons: ['OK']
        });

    } catch (err) {
        console.error('Failed to export to Markdown:', err);
        dialog.showErrorBox('Export Error', 'Failed to export chat to Markdown.');
    }
}

ipcMain.on('select-pdf-direction', async (event, direction) => {
    if (pdfDirectionWin) {
        pdfDirectionWin.close();
    }

    if (!pendingPdfExportData) {
        console.error('No pending PDF export data found');
        return;
    }

    const { win, title, chatHTML } = pendingPdfExportData;
    selectedPdfDirection = direction;

    try {
        // שלב 1: פתיחת דיאלוג שמירת קובץ
        const { filePath } = await dialog.showSaveDialog(win, {
            title: 'Export Chat to PDF',
            defaultPath: `${(title || 'chat').replace(/[\\/:*?"<>|]/g, '')}.pdf`,
            filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
        });

        if (!filePath) {
            console.log('User cancelled PDF export.');
            pendingPdfExportData = null;
            return;
        }

        // שלב 2: יצירת קובץ HTML זמני עם KaTeX
        const tempHtmlPath = path.join(app.getPath('temp'), `gemini-chat-${Date.now()}.html`);

        // --- KaTeX inline (ללא רשת) ---
        const katexCssPath = require.resolve('katex/dist/katex.min.css');
        const katexJsPath = require.resolve('katex/dist/katex.min.js');
        const katexAutoPath = require.resolve('katex/dist/contrib/auto-render.min.js');
        const katexDistDir = path.dirname(katexCssPath);

        function inlineKatexFonts(css) {
            // מטפל בכל הפורמטים: woff2, woff, ttf
            return css.replace(/url\((?:\.\.\/)?fonts\/([^)]+\.(woff2|woff|ttf))\)/g, (_m, file) => {
                try {
                    const fontPath = path.join(katexDistDir, 'fonts', file);
                    const data = fs.readFileSync(fontPath).toString('base64');
                    const ext = file.split('.').pop();
                    const mimeType = ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : 'font/ttf';
                    return `url(data:${mimeType};base64,${data})`;
                } catch (e) {
                    console.warn(`Failed to inline font: ${file}`, e);
                    return _m; // החזר את המקור אם נכשל
                }
            });
        }

        const katexCSS = inlineKatexFonts(fs.readFileSync(katexCssPath, 'utf8'));
        const katexJS = fs.readFileSync(katexJsPath, 'utf8');
        const katexAuto = fs.readFileSync(katexAutoPath, 'utf8');

        // Get user's language for labels
        const currentSettings = getSettings();
        const userLang = currentSettings.language || 'en';
        console.log('PDF Export - User language:', userLang);
        console.log('PDF Export - Available translations:', Object.keys(translations));
        const t = translations[userLang] || translations['en'] || {};
        console.log('PDF Export - Translation object keys:', Object.keys(t).slice(0, 5));
        console.log('PDF Export - pdf-user-label:', t['pdf-user-label']);
        console.log('PDF Export - pdf-model-label:', t['pdf-model-label']);
        const userLabel = t['pdf-user-label'] || 'You:';
        const modelLabel = t['pdf-model-label'] || 'Gemini:';

        const isRTL = direction === 'rtl';
        const borderSide = isRTL ? 'border-right' : 'border-left';
        const textAlign = isRTL ? 'right' : 'left';

        let htmlContent = `<!DOCTYPE html>
<html dir="${direction}">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>` + katexCSS + `</style>
    <script>` + katexJS + `</script>
    <script>` + katexAuto + `</script>
    
    <!-- Highlight.js for syntax highlighting -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
            max-width: none;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            color: #212121;
            line-height: 1.5;
            font-size: 14px;
            text-rendering: optimizeLegibility;
        }
        
        /* כותרת ראשית */
        h1 {
            text-align: center;
            color: #1967d2;
            font-size: 22px;
            font-weight: 600;
            border-bottom: 2px solid #1967d2;
            padding-bottom: 8px;
            margin-bottom: 12px;
            letter-spacing: -0.3px;
        }
        
        /* עיצוב הודעות */
        .message {
            margin-bottom: 10px;
            padding: 12px 14px;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        }
        
        @media screen {
            .message {
                page-break-inside: avoid;
            }
        }
        
        .user-message {
            background: #e3f2fd;
            ${borderSide}: 3px solid #1967d2;
            margin-${isRTL ? 'left' : 'right'}: 30px;
        }
        
        .user-message + .model-message {
            margin-top: 10px;
        }
        
        .model-message {
            background: #f5f5f5;
            ${borderSide}: 3px solid #5f6368;
            margin-${isRTL ? 'right' : 'left'}: 30px;
        }
        
        .model-message + .user-message {
            margin-top: 10px;
        }
        
        .message-header {
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            opacity: 0.8;
        }
        
        .user-message .message-header {
            color: #1967d2;
        }
        
        .model-message .message-header {
            color: #5f6368;
        }
        
        .message-content {
            font-size: 13px;
            word-wrap: break-word;
            line-height: 1.5;
        }
        
        /* תמיכה ב-Markdown - כותרות */
        .message-content h1, .message-content h2, .message-content h3, 
        .message-content h4, .message-content h5, .message-content h6 {
            margin-top: 18px;
            margin-bottom: 12px;
            font-weight: 600;
            color: #1f1f1f;
            line-height: 1.3;
        }
        .message-content h1 { font-size: 1.7em; }
        .message-content h2 { font-size: 1.5em; }
        .message-content h3 { font-size: 1.3em; color: #1967d2; }
        .message-content h4 { font-size: 1.15em; }
        
        /* תמיכה בקוד inline */
        .message-content code {
            background: #f8f9fa;
            color: #d63384;
            padding: 3px 7px;
            border-radius: 4px;
            font-family: 'Consolas', 'SF Mono', 'Monaco', 'Courier New', monospace;
            font-size: 0.88em;
            border: 1px solid #e9ecef;
            font-weight: 500;
        }
        
        /* תמיכה בבלוקי קוד */
        .message-content pre {
            background: #ffffff;
            color: #1f1f1f;
            padding: 0;
            border-radius: 12px;
            overflow: hidden;
            margin: 16px 0;
            border: 1px solid #e0e0e0;
            direction: ltr !important;
            text-align: left !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .message-content pre code {
            display: block;
            background: #ffffff;
            padding: 16px 18px;
            border: none;
            font-size: 13px;
            line-height: 1.6;
            font-weight: 400;
            overflow-x: auto;
            font-family: 'Consolas', 'Courier New', monospace;
        }
        
        /* כותרת בלוק קוד עם שם השפה */
        .message-content pre::before {
            content: attr(data-language);
            display: block;
            background: #e9ecef;
            color: #495057;
            padding: 8px 18px;
            font-size: 12px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            border-bottom: 1px solid #dee2e6;
            text-transform: capitalize;
        }
        
        /* תמיכה בטבלאות */
        .message-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            background: #fff;
            font-size: 0.88em;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .message-content table td, .message-content table th {
            border: 1px solid #e0e0e0;
            padding: 12px 14px;
            text-align: ${textAlign};
            vertical-align: top;
            word-wrap: break-word;
        }
        .message-content table th {
            background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
            font-weight: 600;
            color: #1f1f1f;
            border-bottom: 2px solid #1967d2;
        }
        .message-content table thead th {
            position: sticky;
            top: 0;
        }
        .message-content table tbody tr:nth-child(even) {
            background-color: #fafbfc;
        }
        .message-content table tbody tr:hover {
            background-color: #f0f7ff;
        }
        
        /* תמיכה ברשימות */
        .message-content ul, .message-content ol {
            margin: 12px 0;
            padding-${isRTL ? 'right' : 'left'}: 28px;
        }
        .message-content li {
            margin: 6px 0;
            line-height: 1.7;
            padding-${isRTL ? 'right' : 'left'}: 4px;
        }
        .message-content ul ul, .message-content ol ol,
        .message-content ul ol, .message-content ol ul {
            margin: 6px 0;
        }
        .message-content ul > li {
            list-style-type: disc;
        }
        .message-content ol > li {
            list-style-type: decimal;
        }
        
        /* תמיכה ב-definition lists */
        .message-content dl {
            margin: 16px 0;
        }
        .message-content dt {
            font-weight: 600;
            margin-top: 12px;
            color: #1967d2;
            font-size: 1.05em;
        }
        .message-content dd {
            margin-${isRTL ? 'right' : 'left'}: 30px;
            margin-top: 6px;
            margin-bottom: 12px;
            color: #4a4a4a;
        }
        
        /* תמיכה ב-blockquotes (ציטוטים) */
        .message-content blockquote {
            ${borderSide}: 4px solid #1967d2;
            margin: 16px 0;
            padding: 14px 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #f0f7ff 100%);
            border-radius: 6px;
            color: #4a4a4a;
            font-style: italic;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .message-content blockquote p {
            margin: 6px 0;
        }
        .message-content blockquote strong {
            color: #1967d2;
        }
        
        /* תמיכה בקווי הפרדה */
        .message-content hr {
            border: none;
            height: 2px;
            background: linear-gradient(90deg, transparent, #e0e0e0 20%, #e0e0e0 80%, transparent);
            margin: 24px 0;
        }
        
        /* תמיכה בקישורים */
        .message-content a {
            color: #1967d2;
            text-decoration: none;
            border-bottom: 1px solid #a8d1ff;
            word-break: break-all;
            font-weight: 500;
        }
        .message-content a:hover {
            border-bottom: 2px solid #1967d2;
            background-color: #e3f2fd;
        }
        
        /* תמיכה בראשי תיבות */
        .message-content abbr {
            text-decoration: underline dotted #1967d2;
            cursor: help;
            border-bottom: none;
        }
        
        /* תמיכה בציטוט */
        .message-content cite {
            font-style: italic;
            color: #666;
            font-size: 0.95em;
        }
        
        /* תמיכה בטקסט מחוק (strikethrough) */
        .message-content del, .message-content s {
            text-decoration: line-through;
            color: #888;
        }
        
        /* תמיכה בטקסט מודגש ומוטה */
        .message-content strong, .message-content b {
            font-weight: 600;
            color: #1a1a1a;
        }
        .message-content em, .message-content i {
            font-style: italic;
            color: #4a4a4a;
        }
        .message-content strong em, .message-content b i {
            font-weight: 600;
            font-style: italic;
        }
        
        /* תמיכה בטקסט מסומן */
        .message-content mark {
            background: linear-gradient(135deg, #fff59d 0%, #ffeb3b 100%);
            padding: 3px 5px;
            border-radius: 3px;
            font-weight: 500;
            box-shadow: 0 1px 2px rgba(255,235,59,0.3);
        }
        
        /* תמיכה במקשים */
        .message-content kbd {
            background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #ced4da;
            border-radius: 4px;
            box-shadow: 0 2px 0 rgba(0,0,0,0.1), inset 0 0 0 1px #fff;
            padding: 3px 8px;
            font-family: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.88em;
            font-weight: 500;
            color: #495057;
        }
        
        /* תמיכה ב-subscript ו-superscript */
        .message-content sub, .message-content sup {
            font-size: 0.75em;
            line-height: 0;
            position: relative;
        }
        .message-content sub {
            bottom: -0.25em;
        }
        .message-content sup {
            top: -0.5em;
        }
        
        /* תמיכה ב-details/summary (אקורדיון) */
        .message-content details {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 12px;
            margin: 14px 0;
            background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .message-content summary {
            font-weight: 600;
            cursor: pointer;
            padding: 8px 10px;
            user-select: none;
            color: #1967d2;
            border-radius: 4px;
        }
        .message-content summary:hover {
            background: #e3f2fd;
        }
        .message-content details[open] summary {
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e3f2fd;
        }
        .message-content details[open] {
            background: #ffffff;
            border-color: #1967d2;
        }
        
        
        /* תמיכה ב-figure ו-figcaption */
        .message-content figure {
            margin: 24px 0;
            text-align: center;
            padding: 12px;
            background: #fafbfc;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .message-content figcaption {
            font-size: 0.88em;
            color: #6c757d;
            font-style: italic;
            margin-top: 12px;
            text-align: center;
            padding-top: 8px;
            border-top: 1px solid #e9ecef;
        }
        
        /* תמיכה ב-Syntax Highlighting - VS Code Light Theme */
        
        /* הערות - ירוק */
        .hljs-comment, .hljs-quote {
            color: #008000 !important;
            font-style: italic;
        }
        
        /* מילות מפתח - כחול */
        .hljs-keyword, .hljs-selector-tag, .hljs-literal,
        .hljs-built_in, .hljs-builtin-name {
            color: #0000FF !important;
            font-weight: normal;
        }
        
        /* מחרוזות - חום אדמדם */
        .hljs-string, .hljs-template-string, .hljs-regexp {
            color: #A31515 !important;
        }
        
        /* מספרים - ירוק כהה */
        .hljs-number {
            color: #098658 !important;
        }
        
        /* פונקציות ושמות - צהוב זהב */
        .hljs-function .hljs-title, .hljs-title.function_ {
            color: #795E26 !important;
        }
        
        /* משתנים ופרמטרים - תכלת בהיר */
        .hljs-variable, .hljs-params, .hljs-property {
            color: #001080 !important;
        }
        
        /* טייפים וקלאסים - טורקיז */
        .hljs-class .hljs-title, .hljs-title.class_, .hljs-type {
            color: #267F99 !important;
        }
        
        /* אטריביוטים - אדום */
        .hljs-attr, .hljs-attribute {
            color: #FF0000 !important;
        }
        
        /* תגים - חום כהה */
        .hljs-tag, .hljs-name {
            color: #800000 !important;
        }
        
        /* מטא ודקורטורים - אפור */
        .hljs-meta, .hljs-meta .hljs-keyword {
            color: #808080 !important;
        }
        
        /* סימולים */
        .hljs-symbol, .hljs-bullet {
            color: #0000FF !important;
        }
        
        /* קבועים - תכלת */
        .hljs-variable.constant_ {
            color: #0070C1 !important;
        }
        
        /* דקורטורים בפייתון */
        .hljs-meta.hljs-string {
            color: #795E26 !important;
        }
        
        /* punctuation */
        .hljs-punctuation {
            color: #000000 !important;
        }
        
        
        /* כפיית כיוון LTR לנוסחאות LaTeX */
        .katex {
            direction: ltr !important;
            unicode-bidi: isolate !important;
        }
        .katex-display {
            direction: ltr !important;
            unicode-bidi: isolate !important;
            text-align: center !important;
        }
        .katex * {
            unicode-bidi: normal !important;
        }
        
        /* תמיכה ב-math-block */
        .math-block {
            margin: 15px 0;
            padding: 10px;
            overflow-x: auto;
        }
        
        /* הסתרת code-block-decoration הישן */
        .code-block-decoration {
            display: none !important;
        }
        
        /* תמיכה ב-horizontal-scroll-wrapper */
        .horizontal-scroll-wrapper {
            overflow-x: auto;
            margin: 15px 0;
        }
        
        /* הסתרת אלמנטים לא רצויים בPDF */
        button, .action-button, .copy-button, .mat-icon, 
        .more-menu-button, .export-sheets-button-container,
        .table-footer, .response-footer, sources-list,
        message-actions, [aria-label*="Copy"], [aria-label*="Export"],
        [jslog], mat-menu, .mat-mdc-button, .mdc-button {
            display: none !important;
        }
        
        /* תיקון עבור פסקאות */
        .message-content p {
            margin: 6px 0;
            line-height: 1.5;
            color: #2c2c2c;
        }
        .message-content p:first-child {
            margin-top: 0;
        }
        .message-content p:last-child {
            margin-bottom: 0;
        }
        .message-content p + p {
            margin-top: 8px;
        }
        
        /* תמיכה ב-nested content */
        .message-content > *:first-child {
            margin-top: 0 !important;
        }
        .message-content > *:last-child {
            margin-bottom: 0 !important;
        }
        
        /* תמיכה ב-response-element */
        response-element, link-block, table-block, code-block, 
        message-content, user-query-content, model-response {
            display: block;
        }
        
        /* תיקון RTL/LTR mixing */
        * {
            box-sizing: border-box;
        }
        bdi {
            unicode-bidi: isolate;
        }
        
        /* תיקון עבור code blocks עם כותרת */
        .formatted-code-block-internal-container {
            margin: 0;
        }
        .code-container {
            display: block;
            white-space: pre;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        
        /* תמיכה ב-table-block */
        .table-block {
            margin: 15px 0;
            overflow-x: auto;
            display: block;
        }
        .table-content {
            display: block;
            overflow-x: auto;
        }
        .table-content table {
            width: 100%;
            border-collapse: collapse;
            display: table;
        }
        .table-content thead {
            background-color: #f2f2f2;
            display: table-header-group;
        }
        .table-content tbody {
            display: table-row-group;
        }
        .table-content tr {
            display: table-row;
        }
        .table-content th,
        .table-content td {
            display: table-cell;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: ${textAlign};
        }
        .table-content th {
            font-weight: bold;
            background-color: #f2f2f2;
        }
        .table-content tbody tr:hover {
            background-color: #f5f5f5;
        }
        .table-footer {
            display: none;
        }
        
        /* תמיכה ב-link-block */
        link-block a {
            color: #1967d2;
            text-decoration: none;
            border-bottom: 1px solid #1967d2;
        }
        
        /* עיצוב footer */
        .pdf-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            font-size: 11px;
            color: #999;
        }
        
        /* הדפסה - מאפשר לבועות להתפצל בין עמודים */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* שמירה על עיצוב הבועות בהדפסה */
            .message {
                page-break-inside: auto !important;
                break-inside: auto !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .user-message {
                background: #e3f2fd !important;
                ${borderSide}: 3px solid #1967d2 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .model-message {
                background: #f5f5f5 !important;
                ${borderSide}: 3px solid #5f6368 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* שמירה על עיצוב קוד בהדפסה */
            .message-content pre {
                background: #ffffff !important;
                color: #1f1f1f !important;
                white-space: pre-wrap !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border: 1px solid #e0e0e0 !important;
            }
            
            .message-content pre::before {
                background: #e9ecef !important;
                color: #495057 !important;
                border-bottom: 1px solid #dee2e6 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .message-content pre code {
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* שמירה על צבעי syntax highlighting בהדפסה */
            .message-content pre code * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .message-content code {
                background: #f8f9fa !important;
                color: #d63384 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* שמירה על עיצוב טבלאות בהדפסה */
            .table-block {
                display: block !important;
                page-break-inside: auto !important;
            }
            
            .table-content {
                display: block !important;
                overflow-x: visible !important;
            }
            
            .table-content table {
                display: table !important;
                width: 100% !important;
                border-collapse: collapse !important;
            }
            
            .table-content thead {
                display: table-header-group !important;
                background-color: #f2f2f2 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .table-content tbody {
                display: table-row-group !important;
            }
            
            .table-content tr {
                display: table-row !important;
                page-break-inside: avoid !important;
            }
            
            .table-content th,
            .table-content td {
                display: table-cell !important;
                border: 1px solid #ddd !important;
                padding: 8px !important;
            }
            
            .table-content thead th {
                position: static !important;
                font-weight: bold !important;
            }
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
`;

        // הוספת כל ההודעות
        chatHTML.forEach(message => {
            if (message.type === 'user') {
                htmlContent += `
    <div class="message user-message">
        <div class="message-header">${userLabel}</div>
        <div class="message-content">${message.html}</div>
    </div>
`;
            } else {
                htmlContent += `
    <div class="message model-message">
        <div class="message-header">${modelLabel}</div>
        <div class="message-content">${message.html}</div>
    </div>
`;
            }
        });

        // הוספת footer
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        htmlContent += `
    <div class="pdf-footer">
        <p>Exported from <a href="https://github.com/hillelkingqt/GeminiDesk" target="_blank" style="color: #1967d2; text-decoration: none; font-weight: 600;">GeminiDesk</a> • ${currentDate}</p>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Syntax highlighting עבור בלוקי קוד
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
            
            // רנדור של נוסחאות LaTeX
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '\\\\[', right: '\\\\]', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\\\(', right: '\\\\)', display: false}
                    ],
                    throwOnError: false
                });
            }
            
            // ניקוי אלמנטים מיותרים שנשארו (למעט תמונות!)
            const unwantedSelectors = [
                'button', '.action-button', '.copy-button', 
                'mat-icon', '.export-sheets-button-container',
                '.mat-mdc-button', '.mdc-button', '.response-footer',
                '.table-footer', 'message-actions', 'sources-list',
                'mat-menu', '[aria-label*="Copy"]', '[aria-label*="Export"]',
                '[aria-label*="Listen"]', '[aria-label*="Good"]', 
                '[aria-label*="Bad"]', '[aria-label*="Share"]',
                'thumb-up-button', 'thumb-down-button', 'copy-button',
                'regenerate-button', '.loader', '.overlay-container'
            ];
            unwantedSelectors.forEach(selector => {
                try {
                    document.querySelectorAll(selector).forEach(el => {
                        // אל תמחק אם זה בתוך container של תמונה או אם זה תמונה עצמה
                        const isImageOrInImage = el.tagName === 'IMG' || 
                            el.closest('.generated-image-container') ||
                            el.closest('.generated-image') ||
                            el.closest('.attachment-container') ||
                            el.querySelector('img');
                        
                        if (!isImageOrInImage && el && el.parentNode) {
                            el.remove();
                        }
                    });
                } catch (e) {
                    console.log('Error removing selector:', selector);
                }
            });
            
            // תיקון כיוון של בלוקי קוד והוספת שם השפה
            document.querySelectorAll('pre, code, .code-container').forEach(el => {
                el.style.direction = 'ltr';
                el.style.textAlign = 'left';
            });
            
            // זיהוי והוספת שם השפה לכל בלוק קוד
            document.querySelectorAll('pre').forEach(pre => {
                // ניסיון למצוא את שם השפה מתוך class או data attribute
                let language = 'Code';
                
                // בדיקה אם יש code-block-decoration עם שם השפה
                const decorator = pre.previousElementSibling;
                if (decorator && decorator.classList.contains('code-block-decoration')) {
                    language = decorator.textContent.trim() || 'Code';
                    decorator.remove(); // מסירים את ה-decoration הישן
                }
                
                // בדיקה של class של ה-pre או ה-code בתוכו
                const codeElement = pre.querySelector('code');
                if (codeElement) {
                    const classList = Array.from(codeElement.classList);
                    const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
                    if (langClass) {
                        language = langClass.replace(/^(language-|lang-)/, '');
                    }
                }
                
                // בדיקה של class של ה-pre עצמו
                if (language === 'Code') {
                    const classList = Array.from(pre.classList);
                    const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
                    if (langClass) {
                        language = langClass.replace(/^(language-|lang-)/, '');
                    }
                }
                
                // זיהוי אוטומטי לפי תוכן אם לא נמצא
                if (language === 'Code' && codeElement) {
                    const codeText = codeElement.textContent.trim();
                    if (codeText.includes('def ') || codeText.includes('import ') || codeText.includes('print(')) {
                        language = 'Python';
                    } else if (codeText.includes('function ') || codeText.includes('const ') || codeText.includes('let ')) {
                        language = 'JavaScript';
                    } else if (codeText.includes('#include') || codeText.includes('int main')) {
                        language = 'C++';
                    } else if (codeText.includes('public class') || codeText.includes('public static void')) {
                        language = 'Java';
                    } else if (codeText.match(/^\$\s+/m)) {
                        language = 'Bash';
                    } else if (codeText.includes('<!DOCTYPE') || codeText.includes('<html')) {
                        language = 'HTML';
                    } else if (codeText.match(/\{\s*[\w-]+\s*:/)) {
                        language = 'CSS';
                    }
                }
                
                // הוספת התכונה data-language
                pre.setAttribute('data-language', language);
            });
            
            // תיקון עבור code blocks מקוננים
            document.querySelectorAll('pre code').forEach(el => {
                el.style.whiteSpace = 'pre';
                el.style.display = 'block';
            });
            
            // הסרת תכונות מיותרות
            document.querySelectorAll('*').forEach(el => {
                const attrsToRemove = ['jslog', 'data-hveid', 'data-ved', 
                    'decode-data-ved', 'aria-describedby', 'mat-ripple-loader-uninitialized',
                    'mat-ripple-loader-class-name', 'mat-ripple-loader-centered'];
                attrsToRemove.forEach(attr => {
                    if (el.hasAttribute(attr)) {
                        el.removeAttribute(attr);
                    }
                });
            });
        });
    </script>
</body>
</html>`;

        // החלפת תמונות בקישורים (למעט תמונות KaTeX SVG)
        htmlContent = htmlContent.replace(
            /<img[^>]+src="([^"]+)"[^>]*>/gi,
            (match, imgUrl) => {
                // שמירת תמונות KaTeX (SVG של נוסחאות מתמטיות כמו שורשים)
                if (match.includes('class="katex-svg"')) {
                    return match; // להשאיר את התמונה כמו שהיא - לא לגעת בה!
                }
                return `<div class="image-placeholder" style="background: linear-gradient(135deg, #fff3cd 0%, #fff9e6 100%); border: 2px dashed #856404; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #856404; font-weight: 600; font-size: 14px;">⚠️ Images are not yet supported in PDF export</p>
                    <p style="margin: 0; color: #856404; font-size: 13px;">Click the link below to view the image:</p>
                    <a href="${imgUrl}" target="_blank" style="color: #1967d2; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-block; margin-top: 8px; padding: 8px 16px; background: #e3f2fd; border-radius: 6px;">🔗 View Image</a>
                </div>`;
            }
        );

        // שמירת ה-HTML המעודכן
        fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

        // שלב 4: יצירת חלון Electron בגודל מסך נורמלי לטעינת ה-HTML והמרה ל-PDF
        const pdfWin = new BrowserWindow({
            width: 1920,
            height: 1080,
            show: false,
            skipTaskbar: true,
            webPreferences: {
                offscreen: false
            }
        });

        // סימון שזה חלון פנימי כדי שלא יוצג ב-Alt+G
        pdfWin.__internal = true;

        // טעינת ה-HTML
        await pdfWin.loadFile(tempHtmlPath);

        // חכה שהדף + הפונטים + KaTeX יסיימו להיטען
        await pdfWin.webContents.executeJavaScript(`
            Promise.all([
                document.fonts ? document.fonts.ready : Promise.resolve(),
                new Promise(r => window.requestAnimationFrame(() => setTimeout(r, 150)))
            ])
        `);

        // המתנה לרנדור של כל הנוסחאות
        await new Promise(resolve => setTimeout(resolve, 3000));

        // המרה ל-PDF עם הגדרות זהות למה שרואים בדפדפן
        const pdfData = await pdfWin.webContents.printToPDF({
            landscape: false,
            printBackground: true,
            pageSize: 'A4',
            margins: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            printSelectionOnly: false
        });

        // שמירת הקובץ
        fs.writeFileSync(filePath, pdfData);

        // סגירת החלון הזמני
        pdfWin.close();

        // מחיקת קובץ HTML הזמני
        fs.unlinkSync(tempHtmlPath);

        console.log(`PDF successfully saved to ${filePath}`);

        // Check if user wants to open file after export
        if (settings.openFileAfterExport) {
            shell.openPath(filePath).catch(err => {
                console.error('Failed to open PDF file:', err);
            });
        } else {
            shell.showItemInFolder(filePath);
        }

        dialog.showMessageBox(win, {
            type: 'info',
            title: 'Success!',
            message: 'PDF file created successfully!',
            buttons: ['OK']
        });

        pendingPdfExportData = null;
        selectedExportFormat = null;
        selectedPdfDirection = null;

    } catch (err) {
        console.error('Failed to export chat to PDF:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while exporting the chat. See console for details.');
        pendingPdfExportData = null;
        selectedExportFormat = null;
        selectedPdfDirection = null;
    }
});

ipcMain.on('cancel-pdf-export', () => {
    if (exportFormatWin) {
        exportFormatWin.close();
    }
    if (pdfDirectionWin) {
        pdfDirectionWin.close();
    }
    pendingPdfExportData = null;
    selectedPdfDirection = null;
    selectedExportFormat = null;
});

ipcMain.on('generate-pdf-from-json', async (event, jsonString, title) => {
    try {
        const jsonData = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        const win = BrowserWindow.fromWebContents(event.sender);

        if (!jsonData || !jsonData.conversation) {
            console.error('Invalid JSON data for PDF generation');
            return;
        }

        // Normalize conversation turns to expected shape: ensure each turn has
        // `human.text` and `assistant.text` strings. Support variants like
        // `human.versions` (array) or nested message structures from exporter.
        try {
            if (Array.isArray(jsonData.conversation)) {
                jsonData.conversation = jsonData.conversation.map(turn => {
                    const newTurn = Object.assign({}, turn);

                    // Normalize human
                    if (newTurn.human) {
                        if (typeof newTurn.human.text === 'undefined' || newTurn.human.text === null) {
                            if (Array.isArray(newTurn.human.versions) && newTurn.human.versions.length > 0) {
                                newTurn.human.text = newTurn.human.versions.map(v => v?.text || v?.content || '').join('\n\n').trim();
                            } else if (typeof newTurn.human === 'string') {
                                newTurn.human = { text: newTurn.human };
                            } else {
                                // try other common fields
                                newTurn.human.text = newTurn.human.text || newTurn.human.message || '';
                            }
                        }
                    }

                    // Normalize assistant
                    if (newTurn.assistant) {
                        if (typeof newTurn.assistant.text === 'undefined' || newTurn.assistant.text === null) {
                            if (Array.isArray(newTurn.assistant.versions) && newTurn.assistant.versions.length > 0) {
                                newTurn.assistant.text = newTurn.assistant.versions.map(v => v?.text || v?.content || '').join('\n\n').trim();
                            } else if (typeof newTurn.assistant === 'string') {
                                newTurn.assistant = { text: newTurn.assistant };
                            } else {
                                newTurn.assistant.text = newTurn.assistant.text || newTurn.assistant.message || '';
                            }
                        }
                    }

                    return newTurn;
                });
            }
        } catch (e) {
            console.warn('Failed to normalize conversation turns for PDF generation:', e);
        }

        const chatHTML = [];
        // Load marked dynamically (marked is an ES module) to avoid require() ESM errors
        const { marked } = await import('marked');

        // Helper to process images
        const processImages = (images) => {
            if (!images || !Array.isArray(images) || images.length === 0) return '';
            let html = '<div class="generated-images" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">';
            images.forEach(img => {
                let src = '';
                if (img.data) {
                    const format = img.format || 'image/png';
                    src = `data:${format};base64,${img.data}`;
                } else if (img.original_src && img.original_src.startsWith('http')) {
                    src = img.original_src;
                }

                if (src) {
                    html += `<div class="generated-image-container"><img src="${src}" style="max-width: 100%; border-radius: 8px;"></div>`;
                }
            });
            html += '</div>';
            return html;
        };

        // Convert Lyra conversation format to chatHTML format
        jsonData.conversation.forEach(turn => {
            // Handle human message
            if (turn.human) {
                let humanHtml = '';
                if (turn.human.images) {
                    humanHtml += processImages(turn.human.images);
                }
                if (turn.human.text) {
                    humanHtml += marked.parse(turn.human.text);
                }

                if (humanHtml) {
                    chatHTML.push({
                        type: 'user',
                        html: humanHtml,
                        text: turn.human.text || ''
                    });
                }
            }

            // Handle assistant message
            if (turn.assistant) {
                let assistantHtml = '';
                if (turn.assistant.images) {
                    assistantHtml += processImages(turn.assistant.images);
                }
                if (turn.assistant.text) {
                    assistantHtml += marked.parse(turn.assistant.text);
                }

                if (assistantHtml) {
                    chatHTML.push({
                        type: 'model',
                        html: assistantHtml,
                        text: turn.assistant.text || ''
                    });
                }
            }
        });

        if (chatHTML.length === 0) {
            // Fallback: if no chat HTML was produced, embed the raw JSON as a single assistant message
            try {
                const raw = JSON.stringify(jsonData, null, 2);
                chatHTML.push({ type: 'model', html: marked.parse(raw), text: raw });
            } catch (e) {
                dialog.showErrorBox('Export Failed', 'No conversation content found to export.');
                return;
            }
        }

        // Store pending data and trigger PDF direction selection
        pendingPdfExportData = { win, title: title || jsonData.title || 'Chat Export', chatHTML };
        openPdfDirectionWindow(win);

    } catch (err) {
        console.error('Failed to generate PDF from JSON:', err);
        dialog.showErrorBox('Export Error', 'Failed to process conversation data for PDF export.');
    }
});
ipcMain.on('onboarding-complete', (event) => {
    settings.onboardingShown = true;
    saveSettings(settings);

    const senderWindow = BrowserWindow.fromWebContents(event.sender);

    if (senderWindow && !senderWindow.isDestroyed()) {
        const existingView = detachedViews.get(senderWindow);

        if (existingView) {
            // Fix: Reload the top bar before restoring the view
            senderWindow.loadFile('html/drag.html').then(() => {
                // After the bar is loaded, restore the Gemini view
                senderWindow.setBrowserView(existingView);
                const contentBounds = senderWindow.getContentBounds();
                existingView.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
                // Force repaint after restoring view
                try {
                    existingView.webContents.invalidate();
                } catch (e) {
                    // Ignore errors
                }

                // Replace the sendCurrentTitle function in the onboarding-complete handler
                const sendCurrentTitle = async () => {
                    try {
                        const title = await existingView.webContents.executeJavaScript(`
                            (function() {
                                try {
                                    // Simple helper function
                                    const text = el => el ? (el.textContent || el.innerText || '').trim() : '';
                                    
                                    // Try multiple selector strategies
                                    const selectors = [
                                        '.conversation.selected .conversation-title',
                                        'li.active a.prompt-link',
                                        '[data-test-id="conversation-title"]',
                                        'h1.conversation-title', 
                                        '.conversation-title',
                                        '.chat-title'
                                    ];
                                    
                                    for (const selector of selectors) {
                                        const el = document.querySelector(selector);
                                        if (el) {
                                            const t = text(el);
                                            if (t && t !== 'Gemini' && t !== 'New Chat') return t;
                                        }
                                    }
                                    
                                    return document.title || 'New Chat';
                                } catch (e) {
                                    return 'New Chat';
                                }
                            })();
                        `, true);

                        if (!senderWindow.isDestroyed()) {
                            senderWindow.webContents.send('update-title', title || 'New Chat');
                        }
                    } catch (e) {
                        console.log('Safe title extraction fallback activated');
                        if (!senderWindow.isDestroyed()) {
                            senderWindow.webContents.send('update-title', 'New Chat');
                        }
                    }
                };

                // Call immediately, and also when page SPA changes
                sendCurrentTitle();
                existingView.webContents.once('did-finish-load', sendCurrentTitle);
                existingView.webContents.on('did-navigate-in-page', sendCurrentTitle);

                detachedViews.delete(senderWindow);
            }).catch(err => console.error('Failed to reload drag.html:', err));
        } else {
            // On first launch, loadGemini will handle loading drag.html internally
            loadGemini(settings.defaultMode, senderWindow);
        }
    }
});

ipcMain.on('canvas-state-changed', (event, isCanvasVisible) => {
    const senderWebContents = event.sender;

    for (const window of BrowserWindow.getAllWindows()) {
        if (window.isDestroyed()) continue;

        const view = window.getBrowserView();

        if ((view && view.webContents.id === senderWebContents.id) ||
            (window.webContents.id === senderWebContents.id)) {

            setCanvasMode(isCanvasVisible, window);
            return;
        }
    }
    console.warn(`Could not find a window associated with the 'canvas-state-changed' event.`);
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

ipcMain.on('show-confirm-reset', () => {
    if (confirmWin) return;
    confirmWin = new BrowserWindow({
        width: 340, height: 180, resizable: false, frame: false,
        parent: settingsWin, modal: true, show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });
    confirmWin.loadFile('html/confirm-reset.html');
    confirmWin.once('ready-to-show', () => {
        if (confirmWin) confirmWin.show();
    });
    confirmWin.on('closed', () => confirmWin = null);
});

// 2. Cancel the reset action
ipcMain.on('cancel-reset-action', () => {
    if (confirmWin) confirmWin.close();
});

// 3. Confirm and execute the reset
ipcMain.on('confirm-reset-action', () => {
    if (confirmWin) confirmWin.close();

    // The reset logic itself
    if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath);
    settings = JSON.parse(JSON.stringify(defaultSettings));
    registerShortcuts();
    setAutoLaunch(settings.autoStart);
    BrowserWindow.getAllWindows().forEach(w => {
        if (!w.isDestroyed()) {
            applyAlwaysOnTopSetting(w, settings.alwaysOnTop);
            w.webContents.send('settings-updated', settings);
        }
    });
    console.log('All settings have been reset to default.');
});

ipcMain.handle('get-settings', async () => {
    return getSettings(false);
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('add-google-account', async () => {
    try {
        // Pre-check current account count and inform user if limit reached
        try {
            const currentSettings = getSettings();
            const allAccounts = (currentSettings && Array.isArray(currentSettings.accounts)) ? currentSettings.accounts : [];
            // Count only real signed-in accounts (have email or an image) to avoid counting placeholders.
            // Support multiple possible field names used by different account module versions.
            const currentCount = allAccounts.filter(a => a && (
                (a.email && a.email.length > 0) ||
                (a.localImagePath && a.localImagePath.length > 0) ||
                (a.profileImageUrl && a.profileImageUrl.length > 0) ||
                (a.avatarFile && a.avatarFile.length > 0) ||
                (a.avatarUrl && a.avatarUrl.length > 0)
            )).length;
            if (currentCount >= 4) {
                try {
                    await dialog.showMessageBox({
                        type: 'info',
                        buttons: ['OK'],
                        title: 'Accounts Limit',
                        message: 'Maximum number of accounts (4) reached. Please remove an account before adding a new one.'
                    });
                } catch (e) {
                    console.warn('Could not show message box for account limit:', e && e.message ? e.message : e);
                }
                return { success: false, error: 'Maximum number of accounts (4) reached' };
            }
        } catch (e) {
            console.warn('Could not determine current account count before adding:', e && e.message ? e.message : e);
        }

        let newIndex = -1;
        // Try to reuse an existing placeholder account (no email/avatar) if present
        try {
            const placeholders = allAccounts.map((a, i) => ({ a, i })).filter(item => {
                const acc = item.a || {};
                return !((acc.email && acc.email.length > 0) || (acc.localImagePath && acc.localImagePath.length > 0) || (acc.profileImageUrl && acc.profileImageUrl.length > 0) || (acc.avatarFile && acc.avatarFile.length > 0) || (acc.avatarUrl && acc.avatarUrl.length > 0));
            });
            if (placeholders.length > 0) {
                newIndex = placeholders[0].i;
                // ensure placeholder exists and reset minimal fields
                try { accountsModule.updateAccountMetadata(newIndex, { name: `Account ${newIndex + 1}` }); } catch (e) { }
            }
        } catch (e) {
            console.warn('Error while searching for placeholder accounts:', e && e.message ? e.message : e);
        }

        // If no placeholder reused, add a new account
        if (newIndex === -1) {
            newIndex = accountsModule.addAccount();
            if (typeof newIndex === 'number' && newIndex === -1) {
                return { success: false, error: 'Maximum number of accounts (4) reached' };
            }
        }
        const part = accountsModule.getAccountPartition(newIndex);
        // Open login flow targeted to this new account partition
        await createAndManageLoginWindowForPartition(GEMINI_URL, part, newIndex);
        return { success: true, index: newIndex };
    } catch (e) {
        console.error('Failed to add google account:', e && e.message ? e.message : e);
        return { success: false, error: e && e.message ? e.message : String(e) };
    }
});

ipcMain.handle('request-current-title', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const view = win ? win.getBrowserView() : null;
    if (!view || view.webContents.isDestroyed()) {
        return 'New Chat'; // Return a default value if view is not available
    }

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
        console.error('Failed to get current title:', error);
        return 'New Chat'; // Fallback on error
    }
});

// Execute JavaScript in the main BrowserView
ipcMain.handle('execute-in-main-view', async (event, code) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const view = win ? win.getBrowserView() : null;
    if (!view || view.webContents.isDestroyed()) {
        return null;
    }

    try {
        const result = await view.webContents.executeJavaScript(code);
        return result;
    } catch (error) {
        console.error('Failed to execute code in main view:', error);
        return null;
    }
});

ipcMain.handle('get-screenshot-send-mode', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;
    return screenshotSendModeActive.get(win.id) || false;
});

// ================================================================= //
// Prompt Manager IPC Handlers
// ================================================================= //

// Get all custom prompts
ipcMain.handle('get-custom-prompts', async () => {
    return settings.customPrompts || [];
});

// Add a new custom prompt
ipcMain.handle('add-custom-prompt', async (event, prompt) => {
    if (!settings.customPrompts) {
        settings.customPrompts = [];
    }
    const newPrompt = {
        id: Date.now().toString(),
        name: prompt.name || 'Untitled Prompt',
        content: prompt.content || '',
        isDefault: prompt.isDefault || false,
        showInPieMenu: prompt.showInPieMenu || false
    };

    // If this prompt is set as default, clear default from others
    if (newPrompt.isDefault) {
        settings.customPrompts.forEach(p => p.isDefault = false);
        settings.defaultPromptId = newPrompt.id;
    }

    settings.customPrompts.push(newPrompt);
    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return newPrompt;
});

// Update an existing custom prompt
ipcMain.handle('update-custom-prompt', async (event, prompt) => {
    if (!settings.customPrompts) return null;

    const index = settings.customPrompts.findIndex(p => p.id === prompt.id);
    if (index === -1) return null;

    // If this prompt is being set as default, clear default from others
    if (prompt.isDefault) {
        settings.customPrompts.forEach(p => p.isDefault = false);
        settings.defaultPromptId = prompt.id;
    } else if (settings.defaultPromptId === prompt.id) {
        settings.defaultPromptId = null;
    }

    settings.customPrompts[index] = { ...settings.customPrompts[index], ...prompt };
    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return settings.customPrompts[index];
});

// Delete a custom prompt
ipcMain.handle('delete-custom-prompt', async (event, promptId) => {
    if (!settings.customPrompts) return false;

    const index = settings.customPrompts.findIndex(p => p.id === promptId);
    if (index === -1) return false;

    // If deleting the default prompt, clear the default
    if (settings.defaultPromptId === promptId) {
        settings.defaultPromptId = null;
    }

    settings.customPrompts.splice(index, 1);
    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return true;
});

// Set a prompt as the default
ipcMain.handle('set-default-prompt', async (event, promptId) => {
    if (!settings.customPrompts) return false;

    // Clear default from all prompts
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
    broadcastToWindows('settings-updated', settings);
    return true;
});

// Open Prompt Manager window
let promptManagerWin = null;
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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    promptManagerWin.__internal = true;
    promptManagerWin.loadFile('html/prompt-manager.html');

    promptManagerWin.on('closed', () => {
        promptManagerWin = null;
    });
});

ipcMain.on('update-setting', (event, key, value) => {
    // **Fix:** We don't call getSettings() again.
    // We directly modify the global settings object that exists in memory.

    console.log(`Updating setting: ${key} = ${value}`);

    if (key.startsWith('shortcuts.')) {
        const subKey = key.split('.')[1];
        settings.shortcuts[subKey] = value; // Update the global object
    } else {
        settings[key] = value; // Update the global object
    }

    if (key === 'disableSpellcheck') {
        const spellCheckInfo = value ? 'disabled' : 'enabled';
        console.log(`Spellcheck ${spellCheckInfo}`);
        const enabled = !value;

        session.defaultSession.setSpellCheckerEnabled(enabled);

        // Update main session
        if (constants && constants.SESSION_PARTITION) {
            try {
                const sess = session.fromPartition(constants.SESSION_PARTITION);
                if (sess) sess.setSpellCheckerEnabled(enabled);
            } catch (e) { console.error(e); }
        }

        // Update account sessions
        if (settings.accounts && Array.isArray(settings.accounts)) {
            settings.accounts.forEach((acc, i) => {
                try {
                    const part = accountsModule.getAccountPartition(i);
                    const sess = session.fromPartition(part);
                    if (sess) sess.setSpellCheckerEnabled(enabled);
                } catch (e) { console.error(e); }
            });
        }
    }
    if (key === 'deepResearchEnabled' || key === 'deepResearchSchedule') {
        scheduleDeepResearchCheck(); // Restart schedule monitoring
    }
    debouncedSaveSettings(settings); // Save the updated global object
    console.log(`Setting ${key} saved successfully`);

    // If shortcut-related settings changed, re-register shortcuts immediately
    if (key === 'shortcutsEnabled' || key === 'shortcuts' || key === 'shortcutsGlobal' || key === 'shortcutsGlobalPerKey') {
        try {
            registerShortcuts();
        } catch (e) {
            console.error('Failed to re-register shortcuts after settings change:', e);
        }
    }

    // Apply settings immediately
    if (key === 'alwaysOnTop') {
        // Handle dock visibility on macOS
        // Credit: https://github.com/astron8t-voyagerx
        if (process.platform === 'darwin') {
            if (value) {
                app.dock.hide();
            } else {
                app.dock.show();
            }
        }
        BrowserWindow.getAllWindows().forEach(w => {
            if (!w.isDestroyed()) {
                applyAlwaysOnTopSetting(w, value);
            }
        });
    }
    if (key === 'showInTaskbar') {
        BrowserWindow.getAllWindows().forEach(w => {
            // Do not change this setting for the personal message window
            if (!w.isDestroyed() && w !== personalMessageWin) {
                w.setSkipTaskbar(!value);
            }
        });
    }
    if (key === 'invisibilityMode') {
        // Apply content protection to hide window from screen sharing apps (Zoom, Teams, Discord, etc.)
        // Also hide from taskbar/Alt+Tab when invisibility mode is enabled
        BrowserWindow.getAllWindows().forEach(w => {
            if (!w.isDestroyed() && w !== personalMessageWin) {
                try {
                    // setContentProtection prevents the window from being captured by screen sharing
                    w.setContentProtection(value);
                    // When invisibility mode is ON, always hide from taskbar (regardless of showInTaskbar setting)
                    // When invisibility mode is OFF, restore the user's showInTaskbar preference
                    w.setSkipTaskbar(value ? true : !settings.showInTaskbar);
                    console.log(`Invisibility mode ${value ? 'enabled' : 'disabled'} for window ${w.id}`);
                } catch (e) {
                    console.warn('Failed to set content protection:', e && e.message ? e.message : e);
                }
            }
        });
    }
    if (key === 'autoStart') {
        setAutoLaunch(value);
    }
    if (key === 'autoCheckNotifications') {
        scheduleNotificationCheck(); // Update the timer
    }
    if (key === 'proxyEnabled' || key === 'proxyUrl') {
        // Apply proxy settings to all sessions and reload all pages
        applyProxySettings().then(() => {
            // Reload all BrowserViews to apply new proxy settings
            BrowserWindow.getAllWindows().forEach(w => {
                try {
                    const view = w.getBrowserView();
                    if (view && view.webContents && !view.webContents.isDestroyed()) {
                        console.log('Reloading view after proxy change for window', w.id);
                        view.webContents.reload();
                    }
                } catch (e) {
                    // ignore
                }
            });
        });
    }
    if (key === 'loadUnpackedExtension') {
        // User toggled whether the unpacked extension should be auto-loaded
        if (value) {
            // Load into all relevant sessions and then refresh views so content scripts apply
            loadExtensionToAllSessions().then(() => {
                BrowserWindow.getAllWindows().forEach(w => {
                    try {
                        const view = w.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            console.log('Reloading view after enabling unpacked extension for window', w.id);
                            view.webContents.reload();
                        }
                    } catch (e) {
                        // ignore
                    }
                });
                // Open helper window with setup instructions for MCP SuperAssistant
                try {
                    openMcpSetupWindow(BrowserWindow.fromWebContents(event.sender));
                } catch (e) {
                    console.warn('Failed to open MCP setup window:', e && e.message ? e.message : e);
                }
            }).catch(err => console.warn('Failed to load unpacked extension after enabling:', err));
        } else {
            // Safer unload flow: first navigate views to a neutral page (about:blank)
            // to ensure content scripts are unloaded, then remove extensions, then
            // restore original URLs. This reduces risk of crashing the renderer.
            (async () => {
                try {
                    const restores = [];
                    const allWindows = BrowserWindow.getAllWindows();
                    for (const w of allWindows) {
                        try {
                            const view = w.getBrowserView();
                            if (!view || !view.webContents || view.webContents.isDestroyed()) continue;
                            const orig = view.webContents.getURL();
                            restores.push({ view, orig, winId: w.id });
                            try {
                                // navigate to blank and wait for it to finish
                                view.webContents.loadURL('about:blank');
                                await new Promise(resolve => {
                                    if (view.webContents.isLoadingMainFrame()) {
                                        view.webContents.once('did-finish-load', () => resolve());
                                        // also guard against failure
                                        view.webContents.once('did-fail-load', () => resolve());
                                    } else {
                                        resolve();
                                    }
                                });
                                console.log('Navigated view for window', w.id, 'to about:blank before extension unload');
                            } catch (e) {
                                console.warn('Failed to navigate view to about:blank for window', w.id, e && e.message ? e.message : e);
                            }
                        } catch (e) {
                            // ignore per-window errors
                        }
                    }

                    // Do NOT call removeExtension at runtime (can crash Chromium).
                    // Instead: restore views and ask the user to restart the app to fully unload the extension.
                    for (const item of restores) {
                        try {
                            if (item.orig && item.orig !== 'about:blank') {
                                item.view.webContents.loadURL(item.orig).catch(() => { });
                                console.log('Restored view for window', item.winId, 'to', item.orig);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }

                    // Clear our in-memory map so we won't attempt removeExtension again in this session
                    loadedExtensions.clear();

                    // Prompt the user to restart the app to fully unload the extension from all sessions
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
                            // Relaunch the app; on startup we check settings and will skip loading the extension
                            app.relaunch();
                            app.exit(0);
                        }
                    } catch (e) {
                        console.warn('Failed to prompt for restart after disabling extension:', e && e.message ? e.message : e);
                    }
                } catch (err) {
                    console.warn('Failed safe-unload sequence for unpacked extension:', err && err.message ? err.message : err);
                }
            })();
        }
    }
    if (key.startsWith('shortcuts.') || key === 'shortcutsGlobal' || key === 'shortcutsGlobalPerKey') {
        console.log('🔑 Shortcuts settings updated, re-registering shortcuts and application menu...');
        registerShortcuts(); // This function will now use the updated settings
        const menu = createApplicationMenu();
        Menu.setApplicationMenu(menu);
    }

    if (key === 'language') {
        // Instead of reloading, just notify windows of the change.
        // The renderer process will handle re-applying translations.
        broadcastToAllWebContents('language-changed', value);
    }

    if (key === 'aiStudioRtlEnabled') {
        const boolVal = !!value;
        console.log('AI Studio RTL mode toggled to:', boolVal);

        // Helper to set cookie for a given session
        const setCookieForSession = async (sess) => {
            try {
                if (!sess || !sess.cookies || typeof sess.cookies.set !== 'function') return;
                await sess.cookies.set({
                    url: 'https://aistudio.google.com',
                    name: 'geminidesk_rtl',
                    value: boolVal ? '1' : '0',
                    path: '/',
                    secure: true,
                    httpOnly: false,
                    expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
                });
                console.log('Set geminidesk_rtl cookie for session');
            } catch (e) {
                console.warn('Failed to set geminidesk_rtl cookie', e && e.message ? e.message : e);
            }
        };

        (async () => {
            try {
                // Default session
                try { await setCookieForSession(session.defaultSession); } catch (e) { }

                // Main app partition
                try { if (constants && constants.SESSION_PARTITION) await setCookieForSession(session.fromPartition(constants.SESSION_PARTITION, { cache: true })); } catch (e) { }

                // Per-account partitions
                try {
                    const s = settings;
                    if (s && Array.isArray(s.accounts)) {
                        for (let i = 0; i < s.accounts.length; i++) {
                            try {
                                const partName = accountsModule.getAccountPartition(i);
                                await setCookieForSession(session.fromPartition(partName, { cache: true }));
                            } catch (e) { }
                        }
                    }
                } catch (e) { }

                // Notify any existing AI Studio views so they toggle immediately
                BrowserWindow.getAllWindows().forEach(w => {
                    try {
                        const view = w.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            const url = view.webContents.getURL() || '';
                            if (url.includes('aistudio.google.com')) {
                                view.webContents.executeJavaScript(
                                    `try{window.postMessage({type:'GeminiDesk:aiStudioRtl', state: ${boolVal ? 'true' : 'false'}}, '*'); document.dispatchEvent(new CustomEvent('GeminiDeskAiStudioRtl', {detail:{state:${boolVal ? 'true' : 'false'}}})); }catch(e){}
                                    `, true).catch(() => { });
                                console.log('Posted aiStudioRtl message to view for window', w.id);
                            }
                        }
                    } catch (e) {
                        // ignore per-window errors
                    }
                });

                console.log('AI Studio RTL state updated to:', boolVal);
            } catch (e) {
                console.warn('Failed applying AI Studio RTL change:', e && e.message ? e.message : e);
            }
        })();
    }

    if (key === 'geminimarkEnabled') {
        const boolVal = !!value;
        console.log('Geminimark renderer toggled to:', boolVal);

        const setGmCookieForSession = async (sess) => {
            try {
                if (!sess || !sess.cookies || typeof sess.cookies.set !== 'function') return;
                await sess.cookies.set({
                    url: 'https://gemini.google.com',
                    name: 'geminidesk_geminimark',
                    value: boolVal ? '1' : '0',
                    path: '/',
                    secure: true,
                    httpOnly: false,
                    expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
                });
                console.log('Set geminidesk_geminimark cookie for session');
            } catch (e) {
                console.warn('Failed to set geminidesk_geminimark cookie', e && e.message ? e.message : e);
            }
        };

        (async () => {
            try {
                // Default session
                try { await setGmCookieForSession(session.defaultSession); } catch (e) { }

                // Main app partition
                try { if (constants && constants.SESSION_PARTITION) await setGmCookieForSession(session.fromPartition(constants.SESSION_PARTITION, { cache: true })); } catch (e) { }

                // Per-account partitions
                try {
                    const s = settings;
                    if (s && Array.isArray(s.accounts)) {
                        for (let i = 0; i < s.accounts.length; i++) {
                            try {
                                const partName = accountsModule.getAccountPartition(i);
                                await setGmCookieForSession(session.fromPartition(partName, { cache: true }));
                            } catch (e) { }
                        }
                    }
                } catch (e) { }

                // Notify any existing Gemini views so they toggle immediately
                BrowserWindow.getAllWindows().forEach(w => {
                    try {
                        const view = w.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            const url = view.webContents.getURL() || '';
                            if (url.includes('gemini.google.com')) {
                                view.webContents.executeJavaScript(
                                    `try{window.postMessage({type:'GeminiDesk:geminimarkEnabled', state: ${boolVal ? 'true' : 'false'}}, '*'); document.dispatchEvent(new CustomEvent('GeminiDeskGeminimarkEnabled', {detail:{state:${boolVal ? 'true' : 'false'}}})); }catch(e){} `, true).catch(() => { });
                                console.log('Posted geminimark message to view for window', w.id);
                            }
                        }
                    } catch (e) { }
                });

                console.log('Geminimark state updated to:', boolVal);
            } catch (e) {
                console.warn('Failed applying geminimark change:', e && e.message ? e.message : e);
            }
        })();
    }

    // Broadcast the updated settings to all web contents (windows and views)
    broadcastToAllWebContents('settings-updated', settings);
});

ipcMain.on('toggle-screenshot-send-mode', (event, isActive) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    // Update state map
    screenshotSendModeActive.set(win.id, isActive);

    const view = win.getBrowserView();
    if (view && !view.webContents.isDestroyed()) {
        view.webContents.send('set-screenshot-send-mode', isActive);
        console.log(`Screenshot-on-Send mode ${isActive ? 'enabled' : 'disabled'} for window ${win.id}`);
    }
});

ipcMain.on('perform-screenshot-and-send', async (event) => {
    // This event comes from the renderer (preload) when user clicks send in this mode.
    // We need to:
    // 1. Capture full screen (hiding window first).
    // 2. Paste into the view.
    // 3. Trigger the send button click again (bypassing the interceptor).

    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return;

    // We reuse the existing screenshot logic structure but adapted for this specific flow.
    // We use 'shortcutActions.screenshot()' logic but force full screen and handle the post-paste step.

    const { desktopCapturer } = require('electron');

    try {
        console.log('Performing screenshot-and-send sequence...');

        // 1. Hide window
        // If invisibilityMode is enabled, the window is already protected
        // from capture so we don't need to hide it (prevents visible flicker).
        const wasVisible = win.isVisible();
        let hidePerformed = false;
        if (!settings.invisibilityMode && wasVisible) {
            win.hide();
            hidePerformed = true;
            // Wait for hide
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // 2. Capture
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.size;
        const scaleFactor = primaryDisplay.scaleFactor;

        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: {
                width: Math.round(width * scaleFactor),
                height: Math.round(height * scaleFactor)
            }
        });

        if (sources.length > 0) {
            const primarySource = sources[0];
            clipboard.writeImage(primarySource.thumbnail);
            console.log('Screenshot captured to clipboard');
        } else {
            console.error('No sources found for screenshot');
        }

        // 3. Show window (only if we actually hid it earlier)
        if (wasVisible && hidePerformed) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.setAlwaysOnTop(true);
            win.focus();
        }

        const view = win.getBrowserView();
        if (view && !view.webContents.isDestroyed()) {
            view.webContents.focus();

            // Helper: poll the renderer for the send button state
            const waitForSendClickable = async (maxMs) => {
                const start = Date.now();
                const checkScript = `
                    (function() {
                        try {
                            const sel = 'button.send-button, button[aria-label*="Send"], button[data-test-id="send-button"], .send-button-container button, button.submit';
                            const btn = document.querySelector(sel);
                            if (!btn) return { exists: false, clickable: false };
                            const ariaDisabled = btn.getAttribute('aria-disabled');
                            const disabled = btn.disabled === true || ariaDisabled === 'true';
                            const container = btn.closest('.send-button-container');
                            const visible = container ? container.classList.contains('visible') : true;
                            const clickable = !disabled && visible;
                            return { exists: true, clickable };
                        } catch (e) {
                            return { exists: false, clickable: false };
                        }
                    })();
                `;

                while (Date.now() - start < maxMs) {
                    try {
                        const res = await view.webContents.executeJavaScript(checkScript, true);
                        if (res && res.exists && res.clickable) return true;
                    } catch (e) {
                        // ignore transient errors while page is loading
                    }
                    // poll interval
                    await new Promise(r => setTimeout(r, 250));
                }
                return false;
            };

            // 4. Wait until send button is available/clickable before pasting (handles reloads/slow pages)
            const clickableBefore = await waitForSendClickable(8000);
            if (!clickableBefore) console.warn('Send button not clickable before paste (continuing)');

            // Paste
            await new Promise(resolve => setTimeout(resolve, 150)); // small focus settle
            view.webContents.paste();
            console.log('Issued paste to renderer');

            // 5. Wait until send button becomes clickable and attachment appears after paste
            // We poll the renderer for both: an <img> (or attachment element) inside the editor
            // AND that the send button is clickable. This avoids clicking while upload is still pending.
            const waitForAttachmentAndClickable = async (maxMs) => {
                const start = Date.now();
                let consecutiveClickable = 0;
                const needConsecutive = 3; // require a few stable polls if no attachment detected

                const checkScript = `
                    (function() {
                        try {
                            // Find editor area (prefer contenteditable/ql-editor/textarea)
                            const editor = document.querySelector('[contenteditable="true"], .ql-editor, textarea, .composer, .editor');
                            const scope = editor || document.body;

                            // Detect images or attachments inside editor
                            const hasImg = !!scope.querySelector('img[src]:not([src=""])');
                            const hasAttachment = !!scope.querySelector('.attachment, .uploaded-file, .uploader, .attachment-thumbnail');

                            // Detect send button clickable state
                            const sel = 'button.send-button, button[aria-label*="Send"], button[data-test-id="send-button"], .send-button-container button, button.submit';
                            const btn = document.querySelector(sel);
                            let clickable = false;
                            if (btn) {
                                const ariaDisabled = btn.getAttribute('aria-disabled');
                                const disabled = btn.disabled === true || ariaDisabled === 'true';
                                const container = btn.closest('.send-button-container');
                                const visible = container ? container.classList.contains('visible') : true;
                                clickable = !disabled && visible;
                            }

                            return { hasImg, hasAttachment, clickable };
                        } catch (e) {
                            return { hasImg: false, hasAttachment: false, clickable: false };
                        }
                    })();
                `;

                while (Date.now() - start < maxMs) {
                    try {
                        const res = await view.webContents.executeJavaScript(checkScript, true);
                        if (!res) {
                            await new Promise(r => setTimeout(r, 250));
                            continue;
                        }

                        const { hasImg, hasAttachment, clickable } = res;

                        // If we have an attachment/image and the send button is clickable -> done
                        if ((hasImg || hasAttachment) && clickable) return true;

                        // If we have no attachment but the send button is clickable repeatedly,
                        // assume the site enabled send (maybe it inlines the image immediately) -> allow after a few stable polls
                        if (clickable) {
                            consecutiveClickable += 1;
                            if (consecutiveClickable >= needConsecutive) return true;
                        } else {
                            consecutiveClickable = 0;
                        }
                    } catch (e) {
                        // ignore transient errors
                    }
                    await new Promise(r => setTimeout(r, 250));
                }
                return false;
            };

            const ready = await waitForAttachmentAndClickable(15000);
            if (!ready) console.warn('Attachment not detected and send button not stable/clickable within timeout; attempting click anyway');

            // Click Send via renderer script (only clicks if button exists)
            const clickScript = `
                (function() {
                    const sel = 'button.send-button, button[aria-label*="Send"], button[data-test-id="send-button"], .send-button-container button, button.submit';
                    const btn = document.querySelector(sel);
                    if (!btn) return false;
                    try {
                        ['mousedown','mouseup','click'].forEach(type => {
                            const ev = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                            btn.dispatchEvent(ev);
                        });
                        return true;
                    } catch (e) { return false; }
                })();
            `;
            view.webContents.executeJavaScript(clickScript).then(result => {
                if (result) console.log('Send button clicked programmatically');
                else console.warn('Could not find send button to click');
            }).catch(e => console.error('Failed to click send:', e));

            // Restore alwaysOnTop setting
            setTimeout(() => {
                if (win && !win.isDestroyed()) {
                    applyAlwaysOnTopSetting(win, settings.alwaysOnTop);
                }
            }, 1000);
        }

    } catch (err) {
        console.error('Screenshot-and-send failed:', err);
        // Ensure window is shown if error
        if (win && !win.isDestroyed() && !win.isVisible()) win.show();
    }
});

ipcMain.on('open-settings-window', (event) => {
    if (settingsWin) {
        settingsWin.focus();
        return;
    }

    // Identify the window from which the request was sent
    const parentWindow = BrowserWindow.fromWebContents(event.sender);

    settingsWin = new BrowserWindow({
        width: 450,
        height: 580,
        resizable: false,
        frame: false,
        parent: parentWindow, // Use the correct parent window
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    setupContextMenu(settingsWin.webContents);
    settingsWin.loadFile('html/settings.html');

    settingsWin.once('ready-to-show', () => {
        if (settingsWin) {
            applyInvisibilityMode(settingsWin);
            settingsWin.show();
        }
    });

    settingsWin.on('closed', () => {
        settingsWin = null;
    });
});

// ================================================================= //
// Share Ideas Window
// ================================================================= //
let shareIdeasWin = null;

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
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    setupContextMenu(shareIdeasWin.webContents);
    shareIdeasWin.loadFile('html/share-ideas.html');

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

// ================================================================= //
// MCP Setup Window (Instructions for running the proxy/server)
// ================================================================= //
let mcpSetupWin = null;

function openMcpSetupWindow(parent) {
    try {
        if (mcpSetupWin) {
            mcpSetupWin.focus();
            return;
        }

        mcpSetupWin = new BrowserWindow({
            width: 780,
            height: 720,
            minWidth: 640,
            minHeight: 560,
            resizable: true,
            frame: false,
            alwaysOnTop: true,
            parent: parent || undefined,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
            }
        });

        setupContextMenu(mcpSetupWin.webContents);

        // Open external links in default browser
        mcpSetupWin.webContents.setWindowOpenHandler(({ url }) => {
            try { shell.openExternal(url); } catch (e) { }
            return { action: 'deny' };
        });
        mcpSetupWin.webContents.on('will-navigate', (e, url) => {
            if (!url.startsWith('file://')) {
                e.preventDefault();
                try { shell.openExternal(url); } catch (err) { }
            }
        });

        mcpSetupWin.loadFile('html/mcp-setup.html');

        mcpSetupWin.once('ready-to-show', () => {
            if (mcpSetupWin) {
                mcpSetupWin.show();
                mcpSetupWin.setAlwaysOnTop(true, 'floating');
            }
        });

        mcpSetupWin.on('closed', () => {
            mcpSetupWin = null;
        });
    } catch (e) {
        console.warn('Error creating MCP setup window:', e && e.message ? e.message : e);
    }
}

// Open external URL from renderer on demand
ipcMain.on('open-external', (_event, url) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
        try { shell.openExternal(url); } catch (_) { }
    }
});

// Open MCP setup window explicitly (no parent to keep it independent)
ipcMain.on('open-mcp-setup-window', () => {
    try {
        openMcpSetupWindow(undefined);
    } catch (e) {
        console.warn('Failed to open MCP setup window via IPC:', e && e.message ? e.message : e);
    }
});

ipcMain.on('log-to-main', (event, message) => {
    console.log('GeminiDesk:', message);
});

// ================================================================= //
// Pie Menu Implementation
// ================================================================= //

function createPieMenuWindow() {
    if (pieMenuWin && !pieMenuWin.isDestroyed()) return;

    pieMenuWin = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    pieMenuWin.__internal = true;

    pieMenuWin.loadFile('html/pie-menu.html');

    pieMenuWin.once('ready-to-show', () => {
        sendPieMenuData();
    });

    pieMenuWin.on('blur', () => {
        if (pieMenuWin && !pieMenuWin.isDestroyed() && pieMenuWin.isVisible()) {
            pieMenuWin.hide();
        }
    });

    pieMenuWin.on('closed', () => {
        pieMenuWin = null;
    });
}

function togglePieMenu() {
    if (!pieMenuWin || pieMenuWin.isDestroyed()) {
        createPieMenuWindow();
    }

    if (pieMenuWin.isVisible()) {
        pieMenuWin.hide();
    } else {
        const point = screen.getCursorScreenPoint();
        const display = screen.getDisplayNearestPoint(point);

        // Center the 400x400 window around the cursor
        const x = point.x - 200;
        const y = point.y - 200;

        pieMenuWin.setPosition(x, y);
        sendPieMenuData(); // Refresh data on show
        pieMenuWin.show();
        pieMenuWin.focus();
    }
}

function sendPieMenuData() {
    if (pieMenuWin && !pieMenuWin.isDestroyed()) {
        const prompts = settings.customPrompts ? settings.customPrompts.filter(p => p.showInPieMenu) : [];
        const actions = settings.pieMenu && settings.pieMenu.actions ? settings.pieMenu.actions.filter(a => a.enabled) : [];
        pieMenuWin.webContents.send('pie-menu-data', { prompts, actions });
    }
}

// ================================================================= //
// Native Prompt Overlay Logic
// ================================================================= //
let promptOverlayWin = null;
let currentOverlayParent = null;

function updateOverlayPosition() {
    if (promptOverlayWin && !promptOverlayWin.isDestroyed() && currentOverlayParent && !currentOverlayParent.isDestroyed()) {
        const bounds = currentOverlayParent.getBounds();
        const overlayBounds = promptOverlayWin.getBounds();

        const overlayWidth = 500; // Fixed width
        const x = Math.round(bounds.x + (bounds.width - overlayWidth) / 2);
        const y = Math.round(bounds.y + 80);

        promptOverlayWin.setPosition(x, y);
    }
}

function showPromptOverlay(text, targetWindow) {
    if (!targetWindow || targetWindow.isDestroyed()) return;

    if (!promptOverlayWin || promptOverlayWin.isDestroyed()) {
        promptOverlayWin = new BrowserWindow({
            width: 500,
            height: 60,
            frame: false,
            transparent: true,
            resizable: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            focusable: false, // Don't steal focus from chat
            show: false,
            parent: targetWindow, // Attach to parent so it minimizes with it (on some OS)
            webPreferences: {
                nodeIntegration: true, // Needed for simple IPC in overlay
                contextIsolation: false
            }
        });
        promptOverlayWin.__internal = true;
        promptOverlayWin.loadFile('html/prompt-overlay.html');
        promptOverlayWin.setIgnoreMouseEvents(false); // Make selectable
    }

    // Update Parent Tracking for Move/Resize Sync
    if (currentOverlayParent !== targetWindow) {
        if (currentOverlayParent && !currentOverlayParent.isDestroyed()) {
            currentOverlayParent.removeListener('move', updateOverlayPosition);
            currentOverlayParent.removeListener('resize', updateOverlayPosition);
        }
        currentOverlayParent = targetWindow;
        currentOverlayParent.on('move', updateOverlayPosition);
        currentOverlayParent.on('resize', updateOverlayPosition);

        // Also clean up listener if parent closes
        currentOverlayParent.once('closed', () => {
            if (currentOverlayParent === targetWindow) {
                currentOverlayParent = null;
                hidePromptOverlay();
            }
        });
    }

    // Initial Position
    const bounds = targetWindow.getBounds();
    const overlayWidth = 500;
    const overlayHeight = 60;

    const x = Math.round(bounds.x + (bounds.width - overlayWidth) / 2);
    // Top Y (with some padding form top edge, usually titlebar is ~30-40px)
    const y = Math.round(bounds.y + 80);

    promptOverlayWin.setBounds({ x, y, width: overlayWidth, height: overlayHeight });

    // Ensure on top
    promptOverlayWin.setAlwaysOnTop(true, 'floating');

    promptOverlayWin.showInactive(); // Show without taking focus

    // Send text to overlay
    promptOverlayWin.webContents.once('did-finish-load', () => {
        promptOverlayWin.webContents.send('update-prompt-text', text);
    });
    // Or if already loaded
    promptOverlayWin.webContents.send('update-prompt-text', text);
}

function hidePromptOverlay() {
    if (promptOverlayWin && !promptOverlayWin.isDestroyed()) {
        promptOverlayWin.hide();
    }
}

// IPC to clear from Overlay 'X' button
ipcMain.on('clear-active-prompt', () => {
    hidePromptOverlay();
    // Notify all windows to clear their state
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(w => {
        if (!w.isDestroyed() && !w.__internal) {
            w.webContents.send('set-active-prompt', null);
            const view = w.getBrowserView();
            if (view && !view.webContents.isDestroyed()) {
                view.webContents.send('set-active-prompt', null);
            }
        }
    });
});

// IPC from Preload when prompt signals it was used (sent)
ipcMain.on('prompt-used', () => {
    hidePromptOverlay();
});

ipcMain.on('pie-menu-action', (event, action) => {
    if (pieMenuWin && !pieMenuWin.isDestroyed()) {
        pieMenuWin.hide();
    }

    if (action === 'minimize-maximize') {
        const win = lastFocusedWindow; // Use the globally tracked last focused window
        if (win && !win.isDestroyed()) {
            if (win.isMinimized()) {
                win.restore();
            } else {
                win.minimize();
            }
        } else {
            // Fallback: Try to find any visible window
            const allWindows = BrowserWindow.getAllWindows();
            const visibleWin = allWindows.find(w => w.isVisible() && !w.__internal && w !== pieMenuWin);
            if (visibleWin) {
                visibleWin.minimize();
            } else {
                // If no visible windows, try to restore the most recent one (if we had a history track, but for now just restore any)
                const minimizedWin = allWindows.find(w => !w.isVisible() && !w.__internal && w !== pieMenuWin);
                if (minimizedWin) minimizedWin.restore();
            }
        }
    } else if (action === 'new-window-flash') {
        createNewChatWithModel('flash');
    } else if (action === 'new-window-thinking') {
        createNewChatWithModel('thinking');
    } else if (action === 'new-window-pro') {
        createNewChatWithModel('pro');
    } else if (action === 'new-chat') {
        shortcutActions.newChat();
    } else if (action === 'new-window') {
        shortcutActions.newWindow();
    } else if (action === 'screenshot') {
        shortcutActions.screenshot();
    } else if (action === 'open-settings') {
        if (settingsWin) {
            settingsWin.focus();
        } else {
            // Emulate opening settings from a "generic" context since we don't have the triggering window readily available in this scope
            // However, open-settings-window expects an event with sender.
            // We can manually call the logic used in 'open-settings-window' handler.
            const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows().find(w => !w.__internal && w.isVisible());
            if (parentWindow) {
                settingsWin = new BrowserWindow({
                    width: 450,
                    height: 580,
                    resizable: false,
                    frame: false,
                    parent: parentWindow,
                    show: false,
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        contextIsolation: true,
                    }
                });
                setupContextMenu(settingsWin.webContents);
                settingsWin.loadFile('html/settings.html');
                settingsWin.once('ready-to-show', () => {
                    if (settingsWin) {
                        applyInvisibilityMode(settingsWin);
                        settingsWin.show();
                    }
                });
                settingsWin.on('closed', () => {
                    settingsWin = null;
                });
            }
        }
    } else if (action === 'voice-assistant') {
        shortcutActions.voiceAssistant();
    } else if (action === 'show-hide') {
        // Trigger the show/hide logic (same as global shortcut)
        const showHideShortcut = settings.shortcuts.showHide;
        // We can't invoke the global shortcut handler directly easily, but we can reuse the logic
        // Or simply call a function if we extracted it. Since we didn't extract it fully, we'll replicate the core logic or simulate.
        // Actually, we can just call the logic block inside registerShortcuts if we refactored it,
        // but since we didn't, let's copy the essential part.
        const allWindows = BrowserWindow.getAllWindows();
        const userWindows = allWindows.filter(w => !w.__internal);

        if (userWindows.length === 0) {
            createWindow();
        } else {
            const shouldShow = userWindows.some(win => !win.isVisible());
            userWindows.forEach(win => {
                if (shouldShow) {
                    if (win.isMinimized()) win.restore();
                    win.show();
                } else {
                    win.hide();
                }
            });
            if (shouldShow) {
                const focused = userWindows.find(w => w.isFocused());
                lastFocusedWindow = (focused && !focused.isDestroyed())
                    ? focused
                    : (userWindows[0] || null);
                if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
                    setTimeout(() => {
                        forceOnTop(lastFocusedWindow);
                        const view = lastFocusedWindow.getBrowserView();
                        if (view && view.webContents && !view.webContents.isDestroyed()) {
                            view.webContents.focus();
                        }
                    }, 100);
                }
            }
        }
    } else if (action === 'quit-app') {
        shortcutActions.quit();
    } else if (action === 'refresh-page') {
        shortcutActions.refresh();
    } else if (action === 'find-in-page') {
        shortcutActions.findInPage();
    } else if (action === 'search-chats') {
        shortcutActions.search();
    } else if (action === 'close-current-window') {
        shortcutActions.closeWindow();
    } else if (action === 'change-model-pro') {
        shortcutActions.changeModelPro();
    } else if (action === 'change-model-flash') {
        shortcutActions.changeModelFlash();
    } else if (action === 'change-model-thinking') {
        shortcutActions.changeModelThinking();
    } else if (action === 'new-chat-with-pro') {
        shortcutActions.newChatWithPro();
    } else if (action === 'new-chat-with-flash') {
        shortcutActions.newChatWithFlash();
    } else if (action === 'new-chat-with-thinking') {
        shortcutActions.newChatWithThinking();
    } else if (action === 'temp-chat') {
        shortcutActions.tempChat();
    } else if (typeof action === 'object' && action.type === 'custom-prompt') {
        const win = lastFocusedWindow || BrowserWindow.getFocusedWindow();
        if (win && !win.isDestroyed() && !win.__internal) {
            win.focus();

            // 1. Show Visual Overlay
            const displayName = action.name || action.content;
            showPromptOverlay(displayName, win);

            // 2. Set State in Renderer
            const view = win.getBrowserView();
            if (view && !view.webContents.isDestroyed()) {
                view.webContents.send('set-active-prompt', action.content);
            } else {
                win.webContents.send('set-active-prompt', action.content);
            }
        } else {
            // Fallback
            createNewChatWithModel('flash');
            setTimeout(() => {
                const newWin = BrowserWindow.getFocusedWindow();
                if (newWin) {
                    const displayName = action.name || action.content;
                    showPromptOverlay(displayName, newWin);
                    const view = newWin.getBrowserView();
                    if (view) view.webContents.send('set-active-prompt', action.content);
                }
            }, 1500);
        }
    }
});
