const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const isMac = process.platform === 'darwin';

const settingsPath = path.join(app.getPath('userData'), 'config.json');

const defaultSettings = {
    onboardingShown: false,
    deepResearchEnabled: false,
    deepResearchSchedule: {
        enabled: false,
        globalFormat: '',
        weeklySchedule: {}
    },
    defaultMode: 'ask',
    autoStart: true,
    startMinimized: false,
    startInBackground: false,
    alwaysOnTop: true,
    lastShownNotificationId: null,
    lastMessageData: null,
    autoCheckNotifications: true,
    enableCanvasResizing: true,
    shortcutsGlobal: true,
    showAdvancedShortcutOptions: false,
    shortcutsGlobalPerKey: {},
    showChatTitle: true,
    language: 'en',
    showCloseButton: false,
    showExportButton: true,
    // Whether to show the mode toggle (Gemini / AI Studio) in the drag bar
    showModeToggleButton: true,
    showScreenshotSendButton: false, // Default to false as requested
    showFullscreenButton: true,
    showNewWindowButton: true,
    showMinimizeButton: true,
    draggableButtonsEnabled: true,
    buttonOrder: ['minimize-button', 'new-window-button', 'fullscreen-button', 'export-chat-button', 'settings-button'],
    restoreWindows: false,
    preserveWindowSize: false,
    windowBounds: { width: 550, height: 770, x: null, y: null },
    savedWindows: [],
    accounts: [],
    currentAccountIndex: 0,
    shortcuts: {
        showHide: isMac ? 'Command+G' : 'Alt+G',
        quit: isMac ? 'Command+Q' : 'Control+W',
        showInstructions: isMac ? 'Command+I' : 'Alt+I',
        screenshot: isMac ? 'Command+Alt+S' : 'Control+Alt+S',
        newChat: isMac ? 'Command+Shift+N' : 'Alt+Shift+N',
        changeModelPro: isMac ? 'Command+P' : 'Alt+P',
        changeModelFlash: isMac ? 'Command+F' : 'Alt+F',
        changeModelThinking: isMac ? 'Command+T' : 'Alt+T',
        newChatWithPro: isMac ? 'Command+Shift+P' : 'Alt+Shift+P',
        newChatWithFlash: isMac ? 'Command+Shift+F' : 'Alt+Shift+F',
        newChatWithThinking: isMac ? 'Command+Shift+T' : 'Alt+Shift+T',
        tempChat: isMac ? 'Command+Shift+E' : 'Alt+Shift+E',
        newWindow: isMac ? 'Command+N' : 'Alt+N',
        search: isMac ? 'Command+S' : 'Alt+S',
        refresh: isMac ? 'Command+R' : 'Alt+R',
        findInPage: isMac ? 'Command+F' : 'Control+F',
        closeWindow: isMac ? 'Command+W' : 'Alt+Q',

        pieMenu: 'Alt+M'
    },
    // Per-shortcut enabled/disabled state (true = enabled)
    shortcutsEnabled: {},
    pieMenu: {
        actions: [
            { id: 'flash', action: 'new-window-flash', label: 'New Window (Flash)', enabled: true, icon: 'bolt', color: '#81c995' },
            { id: 'thinking', action: 'new-window-thinking', label: 'New Window (Thinking)', enabled: true, icon: 'psychology', color: '#fdd663' },
            { id: 'pro', action: 'new-window-pro', label: 'New Window (Pro)', enabled: true, icon: 'diamond', color: '#f28b82' },
            { id: 'newChat', action: 'new-chat', label: 'New Chat', enabled: false, icon: 'add_comment', color: '#8ab4f8' },
            { id: 'tempChat', action: 'temp-chat', label: 'Temporary Chat', enabled: false, icon: 'visibility_off', color: '#5f6368' },
            { id: 'newWindow', action: 'new-window', label: 'New Window', enabled: false, icon: 'open_in_new', color: '#c58af9' },
            { id: 'screenshot', action: 'screenshot', label: 'Screenshot', enabled: true, icon: 'screenshot_region', color: '#e8eaed' },
            { id: 'settings', action: 'open-settings', label: 'Settings', enabled: true, icon: 'settings', color: '#5f6368' },
            { id: 'showHide', action: 'show-hide', label: 'Show/Hide', enabled: false, icon: 'visibility', color: '#ffffff' },
            { id: 'quit', action: 'quit-app', label: 'Quit App', enabled: false, icon: 'power_settings_new', color: '#d93025' },
            { id: 'refresh', action: 'refresh-page', label: 'Refresh', enabled: false, icon: 'refresh', color: '#80868b' },
            { id: 'findInPage', action: 'find-in-page', label: 'Find in Page', enabled: false, icon: 'search', color: '#80868b' },
            { id: 'searchChats', action: 'search-chats', label: 'Search Chats', enabled: false, icon: 'manage_search', color: '#80868b' },
            { id: 'closeWindow', action: 'close-current-window', label: 'Close Window', enabled: false, icon: 'close', color: '#e8eaed' },
            { id: 'switchPro', action: 'change-model-pro', label: 'Switch to Pro', enabled: false, icon: 'diamond', color: '#f28b82' },
            { id: 'switchFlash', action: 'change-model-flash', label: 'Switch to Flash', enabled: false, icon: 'bolt', color: '#81c995' },
            { id: 'switchThinking', action: 'change-model-thinking', label: 'Switch to Thinking', enabled: false, icon: 'psychology', color: '#fdd663' }
        ]
    },
    lastUpdateCheck: 0,
    microphoneGranted: null,
    theme: 'system',
    showInTaskbar: false,
    aiCompletionSound: true,

    aiCompletionSoundFile: 'new-notification-09-352705.mp3',
    exportFormat: 'ask', // 'pdf', 'md', or 'ask'
    disableSpellcheck: false // When true, disables spellcheck in the BrowserView
};

// Whether to automatically load the unpacked MCP SuperAssistant extension
// Default: off (user must opt-in via Settings)
defaultSettings.loadUnpackedExtension = false;
defaultSettings.disableAutoUpdateCheck = false;
defaultSettings.autoInstallUpdates = true; // Automatically download and install updates
defaultSettings.updateInstallReminderTime = null; // Timestamp for "remind me in 1 hour"
defaultSettings.aiStudioRtlEnabled = false; // Enable RTL mode for AI Studio (Hebrew, Arabic, etc.)
// Whether the Gemini Markdown & LaTeX renderer (geminimark) is enabled by default
defaultSettings.geminimarkEnabled = true;

// In-memory cache for settings to avoid frequent disk reads
let cachedSettings = null;

// Initialize shortcutsEnabled defaults to true for each defined shortcut
if (defaultSettings.shortcuts && typeof defaultSettings.shortcuts === 'object') {
    for (const k of Object.keys(defaultSettings.shortcuts)) {
        defaultSettings.shortcutsEnabled[k] = true;
    }
}

function getSettings(shouldClone = true) {
    if (cachedSettings) {
        // Return a deep copy to prevent mutation of the cache by consumers
        if (shouldClone) {
            return JSON.parse(JSON.stringify(cachedSettings));
        }
        return cachedSettings;
    }
    try {
        if (fs.existsSync(settingsPath)) {
            const rawData = fs.readFileSync(settingsPath, 'utf8');
            const savedSettings = JSON.parse(rawData);

            if (savedSettings && Object.keys(savedSettings).length > 0) {
                const combinedSettings = {
                    ...defaultSettings,
                    ...savedSettings,
                    shortcuts: { ...defaultSettings.shortcuts, ...savedSettings.shortcuts },
                    pieMenu: { ...defaultSettings.pieMenu, ...(savedSettings.pieMenu || {}) },
                    // Merge per-shortcut enabled flags
                    shortcutsEnabled: { ...defaultSettings.shortcutsEnabled, ...(savedSettings.shortcutsEnabled || {}) },
                    showInTaskbar: savedSettings.showInTaskbar === undefined ? false : savedSettings.showInTaskbar,
                    // CRITICAL: Force loadUnpackedExtension to false unless explicitly set to true by user
                    loadUnpackedExtension: savedSettings.loadUnpackedExtension === true ? true : false,
                    disableAutoUpdateCheck: savedSettings.disableAutoUpdateCheck === true ? true : false,
                    autoInstallUpdates: savedSettings.autoInstallUpdates === undefined ? true : savedSettings.autoInstallUpdates,
                    updateInstallReminderTime: savedSettings.updateInstallReminderTime || null,
                    aiStudioRtlEnabled: savedSettings.aiStudioRtlEnabled === true ? true : false,
                    // If user explicitly set geminimarkEnabled to false, respect it. Otherwise default to enabled.
                    geminimarkEnabled: savedSettings.geminimarkEnabled === false ? false : true,
                    // Respect saved preference for showing the mode toggle; default true
                    showModeToggleButton: savedSettings.hasOwnProperty('showModeToggleButton') ? savedSettings.showModeToggleButton : true,
                    showScreenshotSendButton: savedSettings.showScreenshotSendButton === true ? true : false
                };
                cachedSettings = combinedSettings;
                // Return a deep copy
                if (shouldClone) {
                    return JSON.parse(JSON.stringify(combinedSettings));
                }
                return cachedSettings;
            }
        }
    } catch (e) {
        console.error("Couldn't read settings from file, falling back to default.", e);
    }
    cachedSettings = { ...defaultSettings };
    // Return a deep copy
    if (shouldClone) {
        return JSON.parse(JSON.stringify(cachedSettings));
    }
    return cachedSettings;
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        // Update cache with a deep copy to ensure isolation, ONLY after successful write
        cachedSettings = JSON.parse(JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings to file.", e);
    }
}

async function saveSettingsAsync(settings) {
    // Update cache with a deep copy immediately (optimistic update)
    // This ensures subsequent getSettings() calls return the new data
    // even while the file write is pending.
    cachedSettings = JSON.parse(JSON.stringify(settings));

    try {
        await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to save settings to file asynchronously.", e);
    }
}

module.exports = {
    defaultSettings,
    getSettings,
    saveSettings,
    saveSettingsAsync,
    settingsPath
};
