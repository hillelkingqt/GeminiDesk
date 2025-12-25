const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain, dialog, screen, shell, session, nativeTheme, clipboard, nativeImage, Menu, Tray } = require('electron');

// Enable remote debugging port early so Chromium extensions and devtools work reliably
try {
  app.commandLine.appendSwitch('remote-debugging-port', '9222');
  // Reduce noisy Chromium/extension logs to avoid console spam
  app.commandLine.appendSwitch('disable-logging');
  app.commandLine.appendSwitch('v', '0');
  app.commandLine.appendSwitch('log-level', '3'); // Fatal only
  // Flags to help with Google authentication in embedded browsers
  app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process');
  app.commandLine.appendSwitch('disable-site-isolation-trials');
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
const windowFactory = require('./modules/window/window-factory');
const browserViewModule = require('./modules/window/browser-view');
const shortcutsRegistry = require('./modules/features/shortcuts/shortcuts-registry');
const exportManager = require('./modules/features/export/export-manager');
// createAndManageLoginWindowForPartition moved to modules/window/browser-view.js as createAndManageLoginWindow
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

// detachedViews map moved to modules/window/browser-view.js
// PROFILE_CAPTURE_COOLDOWN_MS and PROFILE_REFRESH_INTERVAL_MS moved to modules/window/browser-view.js
const UPDATE_REMINDER_DELAY_MS = 60 * 60 * 1000; // 1 hour
const UPDATER_INITIALIZATION_DELAY_MS = 5 * 1000; // 5 seconds
const UPDATE_FOUND_DISPLAY_DURATION_MS = 1500; // 1.5 seconds - how long to show "update available" message before starting download
const MAX_UPDATE_CHECK_RETRIES = 3; // Maximum retries for update check when reminder is pending
const profileCaptureTimestamps = new Map();
let avatarDirectoryPath = null;

// Profile and Avatar management moved to modules/window/browser-view.js
const getAvatarStorageDir = (...args) => browserViewModule.getAvatarStorageDir ? browserViewModule.getAvatarStorageDir(...args) : null;
const downloadAccountAvatar = (...args) => browserViewModule.downloadAccountAvatar ? browserViewModule.downloadAccountAvatar(...args) : null;
const createAndManageLoginWindow = (...args) => browserViewModule.createAndManageLoginWindow(...args);
const captureAccountProfile = (...args) => browserViewModule.captureAccountProfile(...args);
const executeDefaultPrompt = (...args) => browserViewModule.executeDefaultPrompt ? browserViewModule.executeDefaultPrompt(...args) : null;
const checkAndSendDefaultPrompt = (...args) => browserViewModule.checkAndSendDefaultPrompt(...args);
const setCanvasMode = (...args) => browserViewModule.setCanvasMode(...args);
const animateResize = (...args) => browserViewModule.animateResize(...args);
const loadGemini = (...args) => browserViewModule.loadGemini(...args);
const getDetachedView = (...args) => browserViewModule.getDetachedView(...args);
const setDetachedView = (...args) => browserViewModule.setDetachedView(...args);
const deleteDetachedView = (...args) => browserViewModule.deleteDetachedView(...args);

/**
 * Check if user has valid Google session cookies in their account partition
 */
async function hasValidSession(accountIndex = 0) {
  try {
    const partition = accountsModule.getAccountPartition(accountIndex);
    const sess = session.fromPartition(partition);
    const cookies = await sess.cookies.get({ domain: '.google.com' });
    const hasSession = cookies.some(c =>
      c.name === 'SID' ||
      c.name === 'SSID' ||
      c.name === '__Secure-1PSID' ||
      c.name === '__Secure-3PSID'
    );
    console.log(`Session check for account ${accountIndex}: ${hasSession ? 'valid' : 'no session'} (${cookies.length} cookies)`);
    return hasSession;
  } catch (e) {
    console.warn('Error checking session:', e);
    return false;
  }
}



// ================================================================= //
// Settings Management (Using Module)
// ================================================================= //

const { getSettings, saveSettings, defaultSettings, settingsPath } = settingsModule;
let settings = getSettings();

// Helper functions moved to modules/utils.js

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

const {
  forceOnTop,
  broadcastToAllWebContents,
  broadcastToWindows,
  reportErrorToServer,
  playAiCompletionSound,
  setupContextMenu,
  debounce,
  applyAlwaysOnTopSetting,
  applyInvisibilityMode,
  getIconPath,
  updateWindowAppUserModelId
} = utils;

// Debounced version of saveSettings to prevent race conditions with rapid updates
const debouncedSaveSettings = debounce((settingsToSave) => {
  saveSettings(settingsToSave);
  console.log('Settings saved via debounce');
}, 300);

// ================================================================= //
// Icon Path Helper
// ================================================================= //

// Icon and Taskbar helpers moved to modules/utils.js

// ================================================================= //
// Session Filters for AI Studio Support
// ================================================================= //

function setupSessionFilters(sess) {
  if (!sess) return;

  // 1. Network Whitelist Filter
  sess.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;

    // 1a. Explicit Blocklist (Even for Google domains)
    // Skip blocking for devtools:// URLs
    if (!url.startsWith('devtools://')) {
      const blockedKeywords = [
        'firebase',
        'telemetry',
        'analytics',
        'logging',
        'metrics',
        'crashlytics',
        'play.googleapis.com/log' // Specific play store logging
      ];

      const isBlockedKeyword = blockedKeywords.some(keyword => url.toLowerCase().includes(keyword));

      if (isBlockedKeyword) {
        console.warn(`Blocked prohibited Google/Firebase telemetry: ${url}`);
        return callback({ cancel: true });
      }
    }

    // 1b. Allowed domains/patterns
    const allowedPatterns = [
      /^https?:\/\/(www\.)?google\.[a-z.]+\//i, // All Google regional domains (google.com, google.hu, google.ru, etc.)
      /^https?:\/\/([a-z0-9-]+\.)*google\.[a-z.]+\//i, // Subdomains of all Google regional domains
      /^https?:\/\/([a-z0-9-]+\.)*gstatic\.com\//i,
      /^https?:\/\/([a-z0-9-]+\.)*googleapis\.com\//i,
      /^https?:\/\/([a-z0-9-]+\.)*googleusercontent\.com\//i,
      /^https?:\/\/([a-z0-9-]+\.)*google-analytics\.com\//i, // Sometimes needed for Google Auth flow
      /^https?:\/\/([a-z0-9-]+\.)*youtube\.com\//i, // Required for Google authentication CheckConnection
      /^https?:\/\/([a-z0-9-]+\.)*ytimg\.com\//i, // YouTube images
      /^file:\/\//i, // Local files
      /^devtools:\/\//i, // DevTools
      /^chrome-extension:\/\//i // Chrome extensions (for MCP SuperAssistant sidebar CSS and resources)
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(url));

    if (isAllowed) {
      callback({ cancel: false });
    } else {
      console.warn(`Blocked third-party request: ${url}`);
      callback({ cancel: true });
    }
  });

  // 2. Remove restrictive CSP headers for AI Studio
  sess.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders || {};

    // Remove or modify CSP headers that block resources
    if (details.url.includes('aistudio.google.com') || details.url.includes('gemini.google.com')) {
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['Content-Security-Policy'];
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['X-Frame-Options'];
    }

    callback({ responseHeaders });
  });
}

// Shortcut actions and registration moved to modules/features/shortcuts/shortcuts-registry.js
const shortcutActions = shortcutsRegistry.shortcutActions;
const registerShortcuts = () => shortcutsRegistry.registerShortcuts();
const createNewChatWithModel = shortcutsRegistry.createNewChatWithModel;

// ================================================================= //
// Gemini-Specific Functions
// ================================================================= //

// checkAndSendDefaultPrompt moved to modules/window/browser-view.js

// createNewChatWithModel and triggerSearch moved to modules/features/shortcuts/shortcuts-registry.js

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

// createWindow implementation moved to modules/window/window-factory.js

// loadGemini implementation moved to modules/window/browser-view.js

// ================================================================= //
// Canvas Mode and Resizing
// ================================================================= //

// setCanvasMode implementation moved to modules/window/browser-view.js

// animateResize implementation moved to modules/window/browser-view.js

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

// Notifications and updates removed for privacy


// ================================================================= //
// Update Management
// ================================================================= //

function scheduleDailyUpdateCheck() {
  console.log('Automatic update checks disabled for privacy.');
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

// Update reminder logic removed


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
// Redundant export-related windows removed (moved to export-manager.js)

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
      const proxyCmd = `npx --no-install @srbhptl39/mcp-superassistant-proxy --config "${cfgPath}" --outputTransport sse`;
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
  windowFactory.initialize({
    settings,
    utils,
    constants,
    accountsModule,
    loadGemini: (mode, win, url, opts) => browserViewModule.loadGemini(mode, win, url, opts),
    nativeTheme,
    globalShortcut,
    debouncedSaveSettings,
    setupContextMenu
  });

  browserViewModule.initialize({
    settings,
    utils,
    constants,
    accountsModule,
    windowFactory
  });

  shortcutsRegistry.initialize({
    settings,
    utils,
    constants,
    windowFactory,
    browserViewModule,
    togglePieMenu
  });

  exportManager.initialize({
    settings,
    translations
  });

  deepResearchModule.initialize({
    settings,
    createWindow: (state) => windowFactory.createWindow(state),
    shortcutActions: shortcutsRegistry.shortcutActions,
    playAiCompletionSound
  });

  accountsModule.initialize({
    settings,
    saveSettings,
    tray: null, // Will be set after creation
    createWindow: (state) => windowFactory.createWindow(state),
    Menu
  });

  trayModule.initialize({
    createWindow: (state) => windowFactory.createWindow(state),
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
  })();

  // Create system tray icon
  tray = trayModule.createTray();
  accountsModule.setTray(tray);
  trayModule.setUpdateTrayCallback(updateTrayContextMenu);

  // Enable spell checking with multiple languages
  session.defaultSession.setSpellCheckerEnabled(true);
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
  gemSession.setSpellCheckerEnabled(true);
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
    if (settings.restoreWindows && Array.isArray(settings.savedWindows) && settings.savedWindows.length) {
      settings.savedWindows.forEach(state => windowFactory.createWindow(state));
    } else {
      // Check if user has valid session before creating window
      (async () => {
        const accountIndex = settings.currentAccountIndex || 0;
        const sessionValid = await hasValidSession(accountIndex);

        if (!sessionValid) {
          // No valid session - show login window first
          console.log('No valid session found, showing login window...');
          await createAndManageLoginWindow(GEMINI_URL, accountIndex, { showChoiceWindow: false });
        } else {
          // Valid session - create window normally
          windowFactory.createWindow();
        }
      })();
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



  // --- 4b. Restore windows from previous session if app was relaunched after update ---
  let restoredFromUpdate = false;
  if (settings.preUpdateWindowStates && Array.isArray(settings.preUpdateWindowStates) && settings.preUpdateWindowStates.length > 0) {
    console.log('Restoring windows after update:', settings.preUpdateWindowStates.length, 'windows');
    restoredFromUpdate = true;

    // Small delay to ensure app is fully ready
    setTimeout(() => {
      settings.preUpdateWindowStates.forEach((state, index) => {
        try {
          windowFactory.createWindow(state);
        } catch (e) {
          console.warn('Failed to restore window', index, ':', e);
        }
      });

      // Clear the saved states
      settings.preUpdateWindowStates = null;
      saveSettings(settings);
    }, 1000);
  }





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

// IPC handlers for updates and notifications removed


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

ipcMain.on('open-voice-assistant', () => {
  // Open the Voice Assistant GitHub repository in the default browser
  shell.openExternal('https://github.com/hillelkingqt/Gemini-voice-assistant');
});

// Handler for the assistant window to request its key upon loading
ipcMain.on('request-api-key', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed() && settings.geminiApiKey) {
    win.webContents.send('set-api-key', settings.geminiApiKey);
  }
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

// autoUpdater listeners removed for security


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

// request-last-notification handler removed


// install-update-now handler removed


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
  windowFactory.createWindow();
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
  if (win && view) {
    await exportManager.handleExportChat(win, view);
  }
});

// Export logic moved to modules/features/export/export-manager.js
ipcMain.on('onboarding-complete', (event) => {
  settings.onboardingShown = true;
  saveSettings(settings);

  const senderWindow = BrowserWindow.fromWebContents(event.sender);

  if (senderWindow && !senderWindow.isDestroyed()) {
    const existingView = getDetachedView(senderWindow);

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

        deleteDetachedView(senderWindow);
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
  return getSettings();
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

    const currentSettings = getSettings();
    const allAccounts = (currentSettings && Array.isArray(currentSettings.accounts)) ? currentSettings.accounts : [];

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
    await createAndManageLoginWindow(GEMINI_URL, newIndex, { showChoiceWindow: true });
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
  if (key === 'deepResearchEnabled' || key === 'deepResearchSchedule') {
    scheduleDeepResearchCheck(); // Restart schedule monitoring
  }
  debouncedSaveSettings(settings); // Save the updated global object
  console.log(`Setting ${key} saved successfully`);

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
    console.log('🔑 Shortcuts settings updated, re-registering shortcuts...');
    registerShortcuts(); // This function will now use the updated settings
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

  // Broadcast the updated settings to all web contents (windows and views)
  broadcastToAllWebContents('settings-updated', settings);
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
        mcpSetupWin.setAlwaysOnTop(true, 'screen-saver');
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
      windowFactory.createWindow();
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
  } else if (typeof action === 'object' && action.type === 'custom-prompt') {
    // Handle Custom Prompt Action
    // 1. Create/Focus Window (Standard Gemini for now, effectively "Flash" or last used)
    createNewChatWithModel('flash');

    // 2. Wait for window and inject text
    setTimeout(() => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow && focusedWindow !== pieMenuWin) {
        const view = focusedWindow.getBrowserView();
        if (view && !view.webContents.isDestroyed()) {
          // We use the same prompt injection logic but WITHOUT clicking send
          // Re-using executeDefaultPrompt but modifying it to NOT click send would be ideal.
          // But executeDefaultPrompt is hardcoded to click send.
          // Let's copy the injection part.
          const promptContent = action.content;
          const script = `
                        (async function() {
                            const waitForElement = (selector, timeout = 15000) => {
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
                                        reject(new Error('Element not found'));
                                    }, timeout);
                                });
                            };

                            const insertTextSafely = (element, text) => {
                                try {
                                    element.focus();
                                    document.execCommand('selectAll', false, null);
                                    document.execCommand('delete', false, null);
                                    document.execCommand('insertText', false, text);
                                    return true;
                                } catch (e) {
                                    try {
                                        element.textContent = text;
                                        element.dispatchEvent(new InputEvent('input', { data: text, inputType: 'insertText', bubbles: true }));
                                        return true;
                                    } catch(e2) { return false; }
                                }
                            };

                            try {
                                const inputArea = await waitForElement('.ql-editor[contenteditable="true"], rich-textarea .ql-editor, [data-placeholder*="Ask"]');
                                const promptText = \`${promptContent.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\${/g, '\\${')}\`;
                                insertTextSafely(inputArea, promptText);
                            } catch(e) { console.error('Prompt injection failed', e); }
                        })();
                     `;
          view.webContents.executeJavaScript(script).catch(() => { });
        }
      }
    }, 1500); // Wait for window creation/focus
  }
});
