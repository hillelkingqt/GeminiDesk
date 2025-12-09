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
    showFullscreenButton: true,
    showNewWindowButton: true,
    showMinimizeButton: true,
    draggableButtonsEnabled: true,
    buttonOrder: ['minimize-button', 'new-window-button', 'fullscreen-button', 'export-chat-button', 'settings-button'],
    restoreWindows: false,
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
        newChatWithPro: isMac ? 'Command+Shift+P' : 'Alt+Shift+P',
        newChatWithFlash: isMac ? 'Command+Shift+F' : 'Alt+Shift+F',
        newWindow: isMac ? 'Command+N' : 'Alt+N',
        search: isMac ? 'Command+S' : 'Alt+S',
        refresh: isMac ? 'Command+R' : 'Alt+R',
        findInPage: isMac ? 'Command+F' : 'Control+F',
        closeWindow: isMac ? 'Command+W' : 'Alt+Q',
        voiceAssistant: isMac ? 'Command+Shift+A' : 'Alt+Shift+A'
    },
    lastUpdateCheck: 0,
    microphoneGranted: null,
    theme: 'system',
    showInTaskbar: false,
    aiCompletionSound: true,
    geminiApiKey: '',
    aiCompletionSoundFile: 'new-notification-09-352705.mp3',
    exportFormat: 'ask' // 'pdf', 'md', or 'ask'
};

// Whether to automatically load the unpacked MCP SuperAssistant extension
// Default: off (user must opt-in via Settings)
defaultSettings.loadUnpackedExtension = false;
defaultSettings.disableAutoUpdateCheck = false;
defaultSettings.autoInstallUpdates = true; // Automatically download and install updates
defaultSettings.updateInstallReminderTime = null; // Timestamp for "remind me in 1 hour"

function getSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const rawData = fs.readFileSync(settingsPath, 'utf8');
            const savedSettings = JSON.parse(rawData);

            if (savedSettings && Object.keys(savedSettings).length > 0) {
                const combinedSettings = {
                    ...defaultSettings,
                    ...savedSettings,
                    shortcuts: { ...defaultSettings.shortcuts, ...savedSettings.shortcuts },
                    showInTaskbar: savedSettings.showInTaskbar === undefined ? false : savedSettings.showInTaskbar,
                    // CRITICAL: Force loadUnpackedExtension to false unless explicitly set to true by user
                    loadUnpackedExtension: savedSettings.loadUnpackedExtension === true ? true : false,
                    disableAutoUpdateCheck: savedSettings.disableAutoUpdateCheck === true ? true : false,
                    autoInstallUpdates: savedSettings.autoInstallUpdates === undefined ? true : savedSettings.autoInstallUpdates
                };
                return combinedSettings;
            }
        }
    } catch (e) {
        console.error("Couldn't read settings from file, falling back to default.", e);
    }
    return { ...defaultSettings };
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to save settings to file.", e);
    }
}

module.exports = {
    defaultSettings,
    getSettings,
    saveSettings,
    settingsPath
};
