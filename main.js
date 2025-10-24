const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain, dialog, screen, shell, session, nativeTheme, clipboard, nativeImage } = require('electron');
const https = require('https');

const path = require('path');
const fs = require('fs');
const { spawn, fork } = require('child_process');
const Store = require('electron-store');
const os = require('os');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { autoUpdater } = require('electron-updater');
const AutoLaunch = require('auto-launch');
const translations = require('./translations.js');

// ================================================================= //
// Global Constants and Configuration
// ================================================================= //

app.disableHardwareAcceleration();

const REAL_CHROME_UA = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`;
const STABLE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const SESSION_PARTITION = 'persist:gemini-session';
const GEMINI_URL = 'https://gemini.google.com/app';
const AISTUDIO_URL = 'https://aistudio.google.com/';

const isMac = process.platform === 'darwin';
const execPath = process.execPath;
const launcherPath = isMac ? path.resolve(execPath, '..', '..', '..') : execPath;

const margin = 20;
const originalSize = { width: 500, height: 650 };
const canvasSize = { width: 1400, height: 800 };

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
let updateWin = null;
let downloadWin = null;
let notificationWin = null;
let personalMessageWin = null;
let lastFetchedMessageId = null;
let filePathToProcess = null;
let notificationIntervalId = null;
let agentProcess = null;

const detachedViews = new Map();

// ================================================================= //
// Settings Management
// ================================================================= //

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

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
    showChatTitle: true,
    language: 'en',
    showCloseButton: false,
    showExportButton: false,
    draggableButtonsEnabled: true,
    buttonOrder: [],
    restoreWindows: false,
    savedWindows: [],
    shortcuts: {
        showHide: isMac ? 'Command+G' : 'Alt+G',
        quit: isMac ? 'Command+Q' : 'Control+W',
        showInstructions: isMac ? 'Command+I' : 'Alt+I',
        screenshot: isMac ? 'Command+Alt+S' : 'Control+Alt+S',
        newChatPro: isMac ? 'Command+P' : 'Alt+P',
        newChatFlash: isMac ? 'Command+F' : 'Alt+F',
        newWindow: isMac ? 'Command+N' : 'Alt+N',
        search: isMac ? 'Command+S' : 'Alt+S',
        refresh: isMac ? 'Command+R' : 'Alt+R',
        findInPage: isMac ? 'Command+F' : 'Control+F',
        closeWindow: isMac ? 'Command+W' : 'Alt+Q'
    },
    lastUpdateCheck: 0,
    microphoneGranted: null,
    theme: 'system',
    showInTaskbar: false,
    aiCompletionSound: true,
    aiCompletionSoundFile: 'new-notification-09-352705.mp3'
};

function getSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            const combinedSettings = {
                ...defaultSettings,
                ...savedSettings,
                shortcuts: { ...defaultSettings.shortcuts, ...savedSettings.shortcuts },
                showInTaskbar: savedSettings.showInTaskbar === undefined ? false : savedSettings.showInTaskbar
            };
            return combinedSettings;
        }
    } catch (e) {
        console.error("Couldn't read settings, falling back to default.", e);
    }
    return { ...defaultSettings };
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (e) {
        console.error("Failed to save settings.", e);
    }
}

let settings = getSettings();

// ================================================================= //
// Auto Launch Configuration
// ================================================================= //

const autoLauncher = new AutoLaunch({
    name: 'GeminiApp',
    path: launcherPath,
    isHidden: true,
});
// Deep Research Schedule Functions
function scheduleDeepResearchCheck() {
    // Clear any existing interval first
    if (deepResearchScheduleInterval) {
        clearInterval(deepResearchScheduleInterval);
        deepResearchScheduleInterval = null;
        console.log('Deep Research Schedule: Cleared existing monitoring');
    }

    if (settings.deepResearchEnabled && settings.deepResearchSchedule && settings.deepResearchSchedule.enabled) {
        // Check every minute for scheduled research
        deepResearchScheduleInterval = setInterval(checkAndExecuteScheduledResearch, 60000);
        console.log('Deep Research Schedule: Monitoring started');
    } else {
        console.log('Deep Research Schedule: Monitoring disabled - no valid schedule configuration');
    }
}
function checkAndExecuteScheduledResearch() {
    if (!settings.deepResearchEnabled || !settings.deepResearchSchedule) {
        return;
    }

    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // To prevent multiple executions in the same minute
    const currentMinute = Math.floor(now.getTime() / 60000);
    if (currentMinute === lastScheduleCheck) {
        return;
    }
    lastScheduleCheck = currentMinute;

    const daySchedule = settings.deepResearchSchedule.weeklySchedule[currentDay];
    if (!daySchedule || !daySchedule.enabled) {
        return;
    }

    // Check if any time slot matches current time
    const matchingSlot = daySchedule.timeSlots.find(slot => slot.time === currentTime);
    if (matchingSlot) {
        const format = matchingSlot.format.trim() || settings.deepResearchSchedule.globalFormat.trim();
        if (format) {
            executeScheduledDeepResearch(format);
        }
    }
}

async function executeScheduledDeepResearch(format) {
    try {
        console.log('Deep Research Schedule: Executing scheduled research with format:', format.substring(0, 50) + '...');

        // Create a new window (Alt+N equivalent)
        const targetWin = createWindow();

        // Wait for window to be ready
        await new Promise(resolve => {
            if (targetWin.webContents.isLoading()) {
                targetWin.webContents.once('did-finish-load', resolve);
            } else {
                setTimeout(resolve, 1000);
            }
        });

        // If it's a choice window, select Gemini mode
        const currentUrl = targetWin.webContents.getURL();
        if (currentUrl.includes('choice.html')) {
            console.log('Deep Research Schedule: Selecting Gemini mode from choice window');
            targetWin.webContents.executeJavaScript(`
                const geminiButton = document.querySelector('button[onclick*="gemini"]') || 
                                   document.querySelector('[data-mode="gemini"]') || 
                                   document.querySelector('.mode-card[data-mode="gemini"]');
                if (geminiButton) {
                    geminiButton.click();
                } else {
                    window.electronAPI.selectAppMode('gemini');
                }
            `);

            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Ensure window is visible and focused
        if (!targetWin.isVisible()) targetWin.show();
        if (targetWin.isMinimized()) targetWin.restore();
        targetWin.focus();

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Switch to Pro model (Alt+P)
        console.log('Deep Research Schedule: Switching to Pro model');
        if (settings.shortcuts.newChatPro) {
            shortcutActions.newChatPro();
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Execute the automation script
        const view = targetWin.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            console.log('Deep Research Schedule: Starting automation sequence');

            await view.webContents.executeJavaScript(`
                (async function() {
                    console.log('Deep Research Schedule: Starting complete automation sequence');
                    
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

                    const findDeepResearchButton = () => {
                        const selectors = [
                            'button[jslog*="251250"]',
                            'button .gds-label-l',
                            'button .feature-content',
                            '.toolbox-drawer-item-list-button',
                            'mat-list-item button',
                            '[mat-list-item]'
                        ];

                        for (const selector of selectors) {
                            try {
                                const buttons = document.querySelectorAll(selector);
                                for (const btn of buttons) {
                                    const text = (btn.textContent || btn.innerText || '').toLowerCase();
                                    if (text.includes('deep research') || text.includes('research')) {
                                        console.log('Deep Research Schedule: Found button with text:', text);
                                        return btn;
                                    }
                                }
                            } catch (e) {
                                console.log('Deep Research Schedule: Selector failed:', selector);
                            }
                        }
                        return null;
                    };

                    const insertTextSafely = (element, text) => {
                        try {
                            element.focus();
                            document.execCommand('selectAll', false, null);
                            document.execCommand('delete', false, null);
                            document.execCommand('insertText', false, text);
                            console.log('Deep Research Schedule: Text inserted using execCommand');
                            return true;
                        } catch (e) {
                            console.log('Deep Research Schedule: execCommand failed, trying alternative methods');
                        }

                        try {
                            element.focus();
                            element.textContent = '';
                            
                            for (let i = 0; i < text.length; i++) {
                                const char = text[i];
                                const keydownEvent = new KeyboardEvent('keydown', {
                                    key: char, char: char, keyCode: char.charCodeAt(0),
                                    which: char.charCodeAt(0), bubbles: true, cancelable: true
                                });
                                const inputEvent = new InputEvent('input', {
                                    data: char, inputType: 'insertText', bubbles: true, cancelable: true
                                });
                                element.dispatchEvent(keydownEvent);
                                element.textContent += char;
                                element.dispatchEvent(inputEvent);
                            }
                            console.log('Deep Research Schedule: Text inserted using simulation');
                            return true;
                        } catch (e) {
                            console.log('Deep Research Schedule: All text insertion methods failed');
                            return false;
                        }
                    };

                    const checkIfResearchCompleted = () => {
                        const spinner = document.querySelector('.avatar_spinner_animation');
                        if (spinner) {
                            const style = window.getComputedStyle(spinner);
                            return style.opacity === '0' || style.visibility === 'hidden';
                        }
                        
                        const immersivePanel = document.querySelector('deep-research-immersive-panel');
                        return !!immersivePanel;
                    };

                    const waitForResearchCompletion = () => {
                        return new Promise((resolve) => {
                            const checkInterval = setInterval(() => {
                                if (checkIfResearchCompleted()) {
                                    console.log('Deep Research Schedule: Research completed, immersive panel detected');
                                    clearInterval(checkInterval);
                                    resolve();
                                } else {
                                    console.log('Deep Research Schedule: Research still in progress, waiting...');
                                }
                            }, 30000); // Check every 30 seconds
                        });
                    };

                    const exportToGoogleDocs = async () => {
                        try {
                            console.log('Deep Research Schedule: Starting export to Google Docs');
                            
                            // Step 1: Find and click "Share & Export" button
                            const shareExportButton = await waitForElement(
                                'button[data-test-id="export-menu-button"], button:has(.mat-mdc-button-persistent-ripple):has([class*="Export"])', 
                                10000
                            );
                            simulateClick(shareExportButton);
                            console.log('Deep Research Schedule: Share & Export button clicked');
                            
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // Step 2: Find and click "Export to Docs" in the dropdown menu
                            const exportToDocsButton = await waitForElement(
                                'button[data-test-id="export-to-docs-button"], button:has([data-test-id="docs-icon"]), button:has([fonticon="docs"])', 
                                5000
                            );
                            simulateClick(exportToDocsButton);
                            console.log('Deep Research Schedule: Export to Docs button clicked');
                            
                            return true;
                        } catch (error) {
                            console.error('Deep Research Schedule: Failed to export to Google Docs:', error);
                            return false;
                        }
                    };

                    try {
                        // Step 1: Click Tools button
                        console.log('Deep Research Schedule: Looking for Tools button');
                        const toolsButton = await waitForElement('button.toolbox-drawer-button, toolbox-drawer button, [aria-label*="Tools"]');
                        simulateClick(toolsButton);
                        console.log('Deep Research Schedule: Tools button clicked');
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Step 2: Find and click Deep Research option
                        console.log('Deep Research Schedule: Looking for Deep Research option');
                        let deepResearchButton = null;
                        let attempts = 0;
                        const maxAttempts = 10;

                        while (!deepResearchButton && attempts < maxAttempts) {
                            deepResearchButton = findDeepResearchButton();
                            if (!deepResearchButton) {
                                console.log('Deep Research Schedule: Attempt', attempts + 1, '- Deep Research button not found, retrying...');
                                await new Promise(resolve => setTimeout(resolve, 500));
                                attempts++;
                            }
                        }

                        if (!deepResearchButton) {
                            throw new Error('Could not find Deep Research button after ' + maxAttempts + ' attempts');
                        }

                        simulateClick(deepResearchButton);
                        console.log('Deep Research Schedule: Deep Research option clicked');
                        
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // Step 3: Find input area and paste format
                        console.log('Deep Research Schedule: Looking for input area');
                        const inputArea = await waitForElement('.ql-editor[contenteditable="true"], rich-textarea .ql-editor, [data-placeholder*="Ask"]');
                        
                        const formatText = \`${format.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\${/g, '\\${')}\`;
                        
                        console.log('Deep Research Schedule: Attempting to insert text:', formatText.substring(0, 50) + '...');
                        
                        const insertSuccess = insertTextSafely(inputArea, formatText);
                        
                        if (!insertSuccess) {
                            throw new Error('Failed to insert text into input area');
                        }
                        
                        console.log('Deep Research Schedule: Format inserted successfully');
                        
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        // Step 4: Click Send button
                        console.log('Deep Research Schedule: Looking for Send button');
                        const sendButton = await waitForElement('button.send-button[jslog*="173899"], button[aria-label="Send message"], button.send-button.submit');
                        simulateClick(sendButton);
                        console.log('Deep Research Schedule: Send button clicked');
                        
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // Step 5: Look for and click "Start research" button
                        console.log('Deep Research Schedule: Looking for Start Research button');
                        
                        // Use stable selectors that don't depend on language
                        const startResearchButton = await waitForElement(
                            'button[data-test-id="confirm-button"], button.confirm-button[mat-flat-button], button.mdc-button--unelevated[color="primary"]'
                        );
                        
                        simulateClick(startResearchButton);
                        console.log('Deep Research Schedule: Start Research button clicked');

                        // Step 6: Wait for research completion (30 seconds intervals)
                        console.log('Deep Research Schedule: Waiting for research completion...');
                        await waitForResearchCompletion();
                        
                        // Step 7: Wait additional time for UI to stabilize
                        await new Promise(resolve => setTimeout(resolve, 5000));

                        // Step 8: Export to Google Docs
                        const exportSuccess = await exportToGoogleDocs();
                        
                        if (exportSuccess) {
                            console.log('Deep Research Schedule: Complete automation sequence finished successfully');
                        } else {
                            console.log('Deep Research Schedule: Research completed but export failed');
                        }
                        
                    } catch (error) {
                        console.error('Deep Research Schedule: Complete automation failed:', error);
                        throw error;
                    }
                })();
            `);
            
            // Play completion sound after research is done
            setTimeout(() => {
                playAiCompletionSound();
                console.log('Deep Research Schedule: Completion sound played');
            }, 60000); // Wait at least 1 minute before checking for completion sound
            
        } else {
            throw new Error('No browser view available');
        }

        console.log('Deep Research Schedule: Research executed successfully');

    } catch (error) {
        console.error('Deep Research Schedule: Failed to execute scheduled research:', error);

        // Close the Gemini window that was opened
        if (targetWin && !targetWin.isDestroyed()) {
            console.log('Deep Research Schedule: Closing Gemini window due to failure');
            targetWin.close();
        }
    }
}
function setAutoLaunch(shouldEnable) {
    if (shouldEnable) {
        autoLauncher.enable();
    } else {
        autoLauncher.disable();
    }
}

// ================================================================= //
// Utility Functions
// ================================================================= //

function forceOnTop(win) {
    if (!win || win.isDestroyed()) return;

    const shouldBeOnTop = !!settings.alwaysOnTop;

    if (process.platform === 'darwin') {
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }

    win.setAlwaysOnTop(shouldBeOnTop);
    win.show();
    if (typeof win.moveTop === 'function') win.moveTop();
    win.focus();

    const view = win.getBrowserView();
    if (view && !view.webContents.isDestroyed()) {
        view.webContents.focus();
    }
}

function broadcastToAllWebContents(channel, data) {
    BrowserWindow.getAllWindows().forEach(win => {
        if (!win || win.isDestroyed()) return;

        if (win.webContents && !win.webContents.isDestroyed()) {
            win.webContents.send(channel, data);
        }
        const view = win.getBrowserView();
        if (view && view.webContents && !view.webContents.isDestroyed()) {
            view.webContents.send(channel, data);
        }
    });
}

function broadcastToWindows(channel, data) {
    BrowserWindow.getAllWindows().forEach(win => {
        if (win && !win.isDestroyed()) {
            win.webContents.send(channel, data);
        }
    });
}

async function reportErrorToServer(error) {
    if (!error) return;
    console.error('Reporting error to server:', error);
    try {
        await fetch('https://latex-v25b.onrender.com/error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                version: app.getVersion(),
                error: error.message,
                stack: error.stack,
                platform: process.platform
            })
        });
    } catch (fetchError) {
        console.error('Could not send error report:', fetchError.message);
    }
}

function playAiCompletionSound() {
    console.log('🔊 playAiCompletionSound called');
    console.log('🔊 aiCompletionSound setting:', settings.aiCompletionSound);
    console.log('🔊 aiCompletionSoundFile setting:', settings.aiCompletionSoundFile);
    
    if (!settings.aiCompletionSound) {
        console.log('🔊 AI completion sound is disabled in settings');
        return;
    }
    
    try {
        const soundPath = path.join(__dirname, 'sounds', settings.aiCompletionSoundFile);
        console.log('🔊 Sound file path:', soundPath);
        
        if (!fs.existsSync(soundPath)) {
            console.error('🔊 Sound file not found:', soundPath);
            return;
        }

        console.log('🔊 Playing sound with sound-play library');
        
        const sound = require("sound-play");
        sound.play(soundPath)
            .then(() => console.log('🔊 Sound finished playing'))
            .catch(err => console.error('🔊 Error playing sound:', err));
        
    } catch (error) {
        console.error('🔊 Error playing completion sound:', error);
    }
}



// ================================================================= //
// Shortcuts Management
// ================================================================= //

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
    newChatPro: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-pro');
        } else {
            createNewChatWithModel('Pro');
        }
    },
    newChatFlash: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (!focusedWindow || !focusedWindow.appMode) return;
        const view = focusedWindow.getBrowserView();
        if (!view) return;

        if (focusedWindow.appMode === 'aistudio') {
            view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat?model=gemini-flash-latest');
        } else {
            createNewChatWithModel('Flash');
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
            const view = focusedWindow.getBrowserView();
            if (view) {
                focusedWindow.removeBrowserView(view);
                detachedViews.set(focusedWindow, view);
            }
            focusedWindow.loadFile('onboarding.html');
            setCanvasMode(false, focusedWindow);
        }
    },
    refresh: () => reloadFocusedView(),
    screenshot: () => {
        let isScreenshotProcessActive = false;
        let screenshotTargetWindow = null;

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

        screenshotTargetWindow = targetWin;
        proceedWithScreenshot();

        function proceedWithScreenshot() {
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
            snippingTool.on('exit', () => { processExited = true; });
            snippingTool.on('error', (err) => {
                console.error('Failed to start snipping tool:', err);
                isScreenshotProcessActive = false;
            });

            let checkAttempts = 0;
            const maxAttempts = 60;
            const intervalId = setInterval(() => {
                const image = clipboard.readImage();
                if (!image.isEmpty() && processExited) {
                    clearInterval(intervalId);
                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                        if (!screenshotTargetWindow.isVisible()) screenshotTargetWindow.show();
                        if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
                        screenshotTargetWindow.setAlwaysOnTop(true);
                        screenshotTargetWindow.focus();
                        const viewInstance = screenshotTargetWindow.getBrowserView();
                        if (viewInstance && viewInstance.webContents) {
                            setTimeout(() => {
                                viewInstance.webContents.focus();
                                viewInstance.webContents.paste();
                                console.log('Screenshot pasted!');
                                setTimeout(() => {
                                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                                        screenshotTargetWindow.setAlwaysOnTop(settings.alwaysOnTop);
                                    }
                                }, 500);
                            }, 200);
                        }
                    }
                    isScreenshotProcessActive = false;
                    screenshotTargetWindow = null;
                } else if (checkAttempts++ > maxAttempts) {
                    clearInterval(intervalId);
                    isScreenshotProcessActive = false;
                    screenshotTargetWindow = null;
                }
            }, 500);
        }
    }
};

function registerShortcuts() {
    globalShortcut.unregisterAll();
    const shortcuts = settings.shortcuts;

    if (shortcuts.showHide) {
        globalShortcut.register(shortcuts.showHide, () => {
            const allWindows = BrowserWindow.getAllWindows();
            const userWindows = allWindows.filter(w => !w.__internal);

            if (userWindows.length === 0) return;

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

    const localShortcuts = { ...settings.shortcuts };
    delete localShortcuts.showHide;

    if (settings.shortcutsGlobal) {
        console.log('Registering GLOBAL shortcuts.');
        for (const action in localShortcuts) {
            if (action === 'findInPage') continue;
            if (localShortcuts[action] && shortcutActions[action]) {
                globalShortcut.register(localShortcuts[action], shortcutActions[action]);
            }
        }
        broadcastToAllWebContents('set-local-shortcuts', {});
    } else {
        console.log('Registering LOCAL shortcuts.');
        broadcastToAllWebContents('set-local-shortcuts', localShortcuts);
    }
}

// ================================================================= //
// Gemini-Specific Functions
// ================================================================= //

function createNewChatWithModel(modelType) {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;
    const targetView = focusedWindow.getBrowserView();
    if (!targetView) return;

    if (!focusedWindow.isVisible()) focusedWindow.show();
    if (focusedWindow.isMinimized()) focusedWindow.restore();
    focusedWindow.focus();

    const modelIndex = modelType.toLowerCase() === 'flash' ? 0 : 1;

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

function createWindow(state = null) {
    const newWin = new BrowserWindow({
        width: originalSize.width,
        height: originalSize.height,
        skipTaskbar: !settings.showInTaskbar,
        frame: false,
        backgroundColor: '#1E1E1E',
        alwaysOnTop: settings.alwaysOnTop,
        fullscreenable: false,
        focusable: true,
        icon: path.join(__dirname, 'icon.ico'),
        show: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            partition: SESSION_PARTITION
        }
    });

    if (settings.alwaysOnTop) {
        newWin.setAlwaysOnTop(true, 'screen-saver');
        if (process.platform === 'darwin') {
            newWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        }
    }

    newWin.isCanvasActive = false;
    newWin.prevBounds = null;
    newWin.appMode = null;

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
        if (settings.alwaysOnTop) newWin.setAlwaysOnTop(true);
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
        loadGemini(state.mode || settings.defaultMode, newWin, state.url);

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
    } else {
        loadGemini(settings.defaultMode, newWin);
    }

    return newWin;
}

function loadGemini(mode, targetWin, initialUrl) {
    if (!targetWin || targetWin.isDestroyed()) return;

    targetWin.appMode = mode;
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
            console.log('Login window session cleared for a fresh login attempt.');
        } catch (error) {
            console.error('Failed to clear login window session storage:', error);
        }

        loginWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        loginWin.loadURL(loginUrl);

        loginWin.on('closed', () => {
            loginWin = null;
        });

        loginWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
            const isLoginSuccess = navigatedUrl.startsWith(GEMINI_URL) || navigatedUrl.startsWith(AISTUDIO_URL);

            if (isLoginSuccess) {
                let sessionCookieFound = false;
                const maxAttempts = 20;
                const isolatedSession = loginWin.webContents.session;

                for (let i = 0; i < maxAttempts; i++) {
                    const criticalCookies = await isolatedSession.cookies.get({ name: '__Secure-1PSID' });
                    if (criticalCookies && criticalCookies.length > 0) {
                        sessionCookieFound = true;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (!sessionCookieFound) {
                    console.warn('Timed out waiting for critical session cookie. Transfer may be incomplete.');
                }

                try {
                    const mainSession = session.fromPartition(SESSION_PARTITION);
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

                    if (loginWin && !loginWin.isDestroyed()) {
                        loginWin.close();
                    }

                    BrowserWindow.getAllWindows().forEach(win => {
                        if (win && !win.isDestroyed() && (!loginWin || win.id !== loginWin.id)) {
                            const view = win.getBrowserView();
                            if (view && view.webContents && !view.webContents.isDestroyed()) {
                                console.log(`Reloading view for window ID: ${win.id}`);
                                view.webContents.reload();
                            }
                        }
                    });

                } catch (error) {
                    console.error('Error during login success handling:', error);
                }
            }
        });
    };

    const existingView = targetWin.getBrowserView();
    if (existingView) {
        existingView.webContents.loadURL(url);
        return;
    }

    targetWin.loadFile('drag.html');

    const newView = new BrowserView({
        webPreferences: {
            partition: SESSION_PARTITION,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nativeWindowOpen: true,
            backgroundThrottling: false
        }
    });

    // Prevent webContents from being throttled when window is hidden
    newView.webContents.setBackgroundThrottling(false);

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
                console.log('Sign-out detected. Clearing main application session...');
                try {
                    const mainSession = session.fromPartition(SESSION_PARTITION);
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

    newView.webContents.loadURL(url);

    targetWin.setBrowserView(newView);

    const bounds = targetWin.getBounds();
    newView.setBounds({ x: 0, y: 30, width: bounds.width, height: bounds.height - 30 });
    newView.setAutoResize({ width: true, height: true });

    if (initialUrl && initialUrl !== GEMINI_URL && initialUrl !== AISTUDIO_URL) {
        const waitForTitleAndUpdate = async () => {
            let attempts = 0;
            const maxAttempts = 20;

            while (attempts < maxAttempts) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const title = await newView.webContents.executeJavaScript(`
            (function() {
              try {
                const text = el => el ? (el.textContent || el.innerText || '').trim() : '';
                
                const selectors = [
                  '.conversation.selected .conversation-title',
                  'li.active a.prompt-link',
                  '[data-test-id="conversation-title"]',
                  'h1.conversation-title',
                  '.conversation-title',
                  '.chat-title',
                  'article h1'
                ];
                
                for (const selector of selectors) {
                  const el = document.querySelector(selector);
                  if (el) {
                    const t = text(el);
                    if (t && t !== 'Gemini' && t !== 'New Chat') return t;
                  }
                }
                
                const urlMatch = location.href.match(/\\/chat\\/([^\\/\\?]+)/);
                if (urlMatch) {
                  return decodeURIComponent(urlMatch[1]).replace(/[-_]/g, ' ');
                }
                
                const firstUserMsg = document.querySelector('user-query .query-text');
                if (firstUserMsg) {
                  const t = text(firstUserMsg);
                  return t.length > 50 ? t.substring(0, 50) + '...' : t;
                }
                
                return document.title || 'Restored Chat';
              } catch (e) {
                return 'Restored Chat';
              }
            })();
          `, true);

                    if (title && title.trim() !== '') {
                        console.log('Found chat title after restore:', title);
                        if (!targetWin.isDestroyed()) {
                            targetWin.webContents.send('update-title', title);
                        }
                        break;
                    }

                    attempts++;
                } catch (e) {
                    console.warn('Failed to read title on attempt', attempts + 1, ':', e.message);
                    attempts++;
                }
            }

            if (attempts >= maxAttempts) {
                console.log('Could not find chat title after restore, using fallback');
                if (!targetWin.isDestroyed()) {
                    targetWin.webContents.send('update-title', 'Restored Chat');
                }
            }
        };

        newView.webContents.once('did-finish-load', () => {
            setTimeout(waitForTitleAndUpdate, 1000);
        });

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

    let scrollY = 0;
    if (activeView) {
        try {
            scrollY = await activeView.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`);
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

    if (activeView) {
        setTimeout(() => {
            if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
                activeView.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop = ${scrollY};`).catch(console.error);
            }
        }, 300);
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
        alwaysOnTop: true,
        show: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    notificationWin.loadFile('notification.html');

    notificationWin.once('ready-to-show', () => {
        if (notificationWin) notificationWin.show();
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
    const checkForUpdates = async () => {
        console.log('Checking for updates...');
        try {
            await autoUpdater.checkForUpdates();
        } catch (error) {
            console.error('Background update check failed. This is not critical and will be ignored:', error.message);
        }
    };

    checkForUpdates();
    setInterval(checkForUpdates, 30 * 60 * 1000);
}

function openUpdateWindowAndCheck() {
    if (updateWin) {
        updateWin.focus();
        return;
    }

    const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    updateWin = new BrowserWindow({
        width: 420, height: 500, frame: false, resizable: false, alwaysOnTop: true,
        show: false, parent: parentWindow, modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    updateWin.loadFile('update-available.html');

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

const sendUpdateStatus = (status, data = {}) => {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('update-status', { status, ...data });
        }
    });
};

autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('checking');
});

autoUpdater.on('update-available', async (info) => {
    if (!updateWin) {
        openUpdateWindowAndCheck();
        return;
    }

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

                if (updateWin) {
                    updateWin.webContents.send('update-info', {
                        status: 'update-available',
                        version: info.version,
                        releaseNotesHTML: releaseNotesHTML
                    });
                }
            });
        });
        req.on('error', (e) => { if (updateWin) { updateWin.webContents.send('update-info', { status: 'error', message: e.message }); } });
        req.end();
    } catch (importError) { if (updateWin) { updateWin.webContents.send('update-info', { status: 'error', message: 'Failed to load modules.' }); } }
});

autoUpdater.on('update-not-available', (info) => {
    if (updateWin) {
        updateWin.webContents.send('update-info', { status: 'up-to-date' });
    }
    sendUpdateStatus('up-to-date');
});

autoUpdater.on('error', (err) => {
    if (updateWin) {
        updateWin.webContents.send('update-info', { status: 'error', message: err.message });
    }
    sendUpdateStatus('error', { message: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
    sendUpdateStatus('downloading', { percent: Math.round(progressObj.percent) });
});

autoUpdater.on('update-downloaded', () => {
    sendUpdateStatus('downloaded');
});

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
                        targetWin.setAlwaysOnTop(settings.alwaysOnTop);
                    }
                }, 200);
            }
            filePathToProcess = null;
        }, 300);

    } catch (error) {
        console.error('Failed to process file for pasting:', error);
        dialog.showErrorBox('File Error', 'Could not copy the selected file to the clipboard.');
        if (targetWin) {
            targetWin.setAlwaysOnTop(settings.alwaysOnTop);
        }
    }
}

// ================================================================= //
// IPC Handlers
// ================================================================= //
// Deep Research Schedule Window
let deepResearchScheduleWin = null;
let pdfDirectionWin = null;
let selectedPdfDirection = null;
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

        loadGemini(mode, senderWindow);
    }
});

ipcMain.on('toggle-full-screen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        if (win.isMaximized()) {
            win.unmaximize();
            // Restore original "always on top" state from settings
            win.setAlwaysOnTop(settings.alwaysOnTop, 'screen-saver');
            win.focus(); // Ensure window stays in focus
        } else {
            // Temporarily disable "always on top" before maximizing
            win.setAlwaysOnTop(false);
            win.maximize();
            win.focus(); // Ensure window stays in focus
        }
    }
});

/**
 * Sends an error report to the server.
 * @param {Error} error The error object to report.
 */
async function reportErrorToServer(error) {
    if (!error) return;
    console.error('Reporting error to server:', error);
    try {
        await fetch('https://latex-v25b.onrender.com/error', { // Ensure this is your worker address
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                version: app.getVersion(),
                error: error.message,
                stack: error.stack,
                platform: process.platform
            })
        });
    } catch (fetchError) {
        console.error('Could not send error report:', fetchError.message);
    }
}

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

// ================================================================= //
// App Lifecycle
// ================================================================= //

app.whenReady().then(() => {
    syncThemeWithWebsite(settings.theme);
    
    // Disable background throttling globally to keep AI responses working when hidden
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
    app.commandLine.appendSwitch('disable-renderer-backgrounding');
    
    // Start Deep Research Schedule monitoring
    scheduleDeepResearchCheck();

    if (settings.restoreWindows && Array.isArray(settings.savedWindows) && settings.savedWindows.length) {
        settings.savedWindows.forEach(state => createWindow(state));
    } else {
        createWindow();
    }

    const gemSession = session.fromPartition(SESSION_PARTITION);
    gemSession.setUserAgent(REAL_CHROME_UA);

    const sendPing = async () => {
        try {
            await fetch('https://latex-v25b.onrender.com/ping-stats', { // Ensure this is your worker address
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: app.getVersion() })
            });
            console.log('Analytics ping sent successfully.');
        } catch (error) {
            console.error('Failed to send analytics ping:', error.message);
        }
    };
    sendPing();

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
                        win.setAlwaysOnTop(settings.alwaysOnTop, 'screen-saver');
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
    // The save.js module will handle background worker creation
});

app.on('will-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('before-quit', async () => {
    try {
        const s = session.fromPartition(SESSION_PARTITION); // persist:gemini-session
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



function openUpdateWindowAndCheck() {
    if (updateWin) {
        updateWin.focus();
        return;
    }

    const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    updateWin = new BrowserWindow({
        width: 420, height: 500, frame: false, resizable: false, alwaysOnTop: true,
        show: false, parent: parentWindow, modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
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

autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('checking');
});

autoUpdater.on('update-available', async (info) => {
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
    sendUpdateStatus('error', { message: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
    sendUpdateStatus('downloading', { percent: Math.round(progressObj.percent) });
});

autoUpdater.on('update-downloaded', () => {
    sendUpdateStatus('downloaded');
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
    const parentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (updateWin) {
        updateWin.close();
    }
    if (downloadWin) {
        downloadWin.focus();
    } else {
        downloadWin = new BrowserWindow({
            width: 360,
            height: 180,
            frame: false,
            resizable: false,
            parent: parentWindow,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
            }
        });
        downloadWin.loadFile('download-progress.html');
        downloadWin.on('closed', () => {
            downloadWin = null;
        });
    }
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
    autoUpdater.quitAndInstall();
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
        // שלב 1: חילוץ הכותרת של הצ'אט לקביעת שם הקובץ
        const title = await view.webContents.executeJavaScript(`
            (() => {
                const el = document.querySelector('.conversation.selected .conversation-title') ||
                           document.querySelector('li.active a.prompt-link');
                return el ? el.textContent.trim() : (document.title || 'chat');
            })();
        `);

        // שלב 2: חילוץ כל התוכן של הצ'אט כולל HTML מלא
        const chatHTML = await view.webContents.executeJavaScript(`
            (() => {
                const conversation = [];
                
                // מציאת כל בלוקי השיחה
                const conversationContainers = document.querySelectorAll('.conversation-container');
                
                conversationContainers.forEach(container => {
                    // שאילתת משתמש
                    const userQuery = container.querySelector('user-query .query-text');
                    if (userQuery) {
                        conversation.push({
                            type: 'user',
                            html: userQuery.innerHTML,
                            text: userQuery.innerText.trim()
                        });
                    }
                    
                    // תשובת המודל
                    const modelResponse = container.querySelector('model-response .markdown');
                    if (modelResponse) {
                        conversation.push({
                            type: 'model',
                            html: modelResponse.innerHTML,
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

        // פתיחת חלון בחירת כיוון
        if (pdfDirectionWin) {
            pdfDirectionWin.focus();
            return;
        }

        pdfDirectionWin = new BrowserWindow({
            width: 550,
            height: 450,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false,
            parent: win,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
            }
        });

        pdfDirectionWin.loadFile('pdf-direction-choice.html');

        pdfDirectionWin.once('ready-to-show', () => {
            if (pdfDirectionWin) pdfDirectionWin.show();
        });

        pdfDirectionWin.on('closed', () => {
            pdfDirectionWin = null;
            selectedPdfDirection = null;
            pendingPdfExportData = null;
        });

    } catch (err) {
        console.error('Failed to prepare chat export:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while preparing the export.');
    }
});

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
        
        const isRTL = direction === 'rtl';
        const borderSide = isRTL ? 'border-right' : 'border-left';
        const textAlign = isRTL ? 'right' : 'left';
        const userLabel = isRTL ? 'אתה:' : 'You:';
        
        let htmlContent = `<!DOCTYPE html>
<html dir="${direction}">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/contrib/auto-render.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #fff;
            color: #1f1f1f;
            line-height: 1.6;
        }
        h1 {
            text-align: center;
            color: #1967d2;
            border-bottom: 2px solid #1967d2;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .message {
            margin-bottom: 25px;
            padding: 15px;
            border-radius: 8px;
        }
        .user-message {
            background: #e3f2fd;
            ${borderSide}: 4px solid #1967d2;
        }
        .model-message {
            background: #f5f5f5;
            ${borderSide}: 4px solid #666;
        }
        .message-header {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .user-message .message-header {
            color: #1967d2;
        }
        .model-message .message-header {
            color: #666;
        }
        .message-content {
            font-size: 13px;
        }
        /* תמיכה ב-Markdown */
        .message-content h1, .message-content h2, .message-content h3 {
            margin-top: 15px;
            margin-bottom: 10px;
        }
        .message-content code {
            background: #272822;
            color: #f8f8f2;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', monospace;
        }
        .message-content pre {
            background: #272822;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .message-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        .message-content table td, .message-content table th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: ${textAlign};
        }
        .message-content table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .message-content img {
            max-width: 100%;
            height: auto;
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
        <div class="message-header">Gemini:</div>
        <div class="message-content">${message.html}</div>
    </div>
`;
            }
        });

        htmlContent += `
    <script>
        // רנדור של נוסחאות LaTeX אחרי טעינת הדף
        document.addEventListener('DOMContentLoaded', function() {
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '\\\\[', right: '\\\\]', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\\\(', right: '\\\\)', display: false}
                ]
            });
        });
    </script>
</body>
</html>`;

        fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

        // שלב 3: יצירת חלון Electron נסתר לטעינת ה-HTML והמרה ל-PDF
        const pdfWin = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                offscreen: false
            }
        });

        await pdfWin.loadFile(tempHtmlPath);

        // המתנה לרנדור של כל הנוסחאות
        await new Promise(resolve => setTimeout(resolve, 3000));

        // המרה ל-PDF
        const pdfData = await pdfWin.webContents.printToPDF({
            landscape: false,
            printBackground: true,
            pageSize: 'A4',
            margins: {
                top: 1,
                bottom: 1,
                left: 1,
                right: 1
            }
        });

        // שמירת הקובץ
        fs.writeFileSync(filePath, pdfData);

        // סגירת החלון הזמני
        pdfWin.close();

        // מחיקת קובץ HTML הזמני
        fs.unlinkSync(tempHtmlPath);

        console.log(`PDF successfully saved to ${filePath}`);
        shell.showItemInFolder(filePath);

        dialog.showMessageBox(win, {
            type: 'info',
            title: 'Success!',
            message: 'PDF file created successfully!',
            buttons: ['OK']
        });

        pendingPdfExportData = null;

    } catch (err) {
        console.error('Failed to export chat to PDF:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while exporting the chat. See console for details.');
        pendingPdfExportData = null;
    }
});

ipcMain.on('cancel-pdf-export', () => {
    if (pdfDirectionWin) {
        pdfDirectionWin.close();
    }
    pendingPdfExportData = null;
    selectedPdfDirection = null;
});
ipcMain.on('onboarding-complete', (event) => {
    settings.onboardingShown = true;
    saveSettings(settings);

    const senderWindow = BrowserWindow.fromWebContents(event.sender);

    if (senderWindow && !senderWindow.isDestroyed()) {
        const existingView = detachedViews.get(senderWindow);

        if (existingView) {
            // Fix: Reload the top bar before restoring the view
            senderWindow.loadFile('drag.html').then(() => {
                // After the bar is loaded, restore the Gemini view
                senderWindow.setBrowserView(existingView);
                const bounds = senderWindow.getBounds();
                existingView.setBounds({ x: 0, y: 30, width: bounds.width, height: bounds.height - 30 });

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
            // On first launch, load normally
            loadGemini(senderWindow);
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
    confirmWin.loadFile('confirm-reset.html');
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
            w.setAlwaysOnTop(settings.alwaysOnTop);
            w.webContents.send('settings-updated', settings);
        }
    });
    console.log('All settings have been reset to default.');
});

ipcMain.handle('get-settings', async () => {
    return getSettings();
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

ipcMain.on('update-setting', (event, key, value) => {
    // **Fix:** We don't call getSettings() again.
    // We directly modify the global settings object that exists in memory.

    if (key.startsWith('shortcuts.')) {
        const subKey = key.split('.')[1];
        settings.shortcuts[subKey] = value; // Update the global object
    } else {
        settings[key] = value; // Update the global object
    }
    if (key === 'deepResearchEnabled' || key === 'deepResearchSchedule') {
        scheduleDeepResearchCheck(); // Restart schedule monitoring
    }
    saveSettings(settings); // Save the updated global object

    // Apply settings immediately
    if (key === 'alwaysOnTop') {
        BrowserWindow.getAllWindows().forEach(w => {
            if (!w.isDestroyed()) {
                w.setAlwaysOnTop(value);
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
    if (key === 'autoStart') {
        setAutoLaunch(value);
    }
    if (key === 'autoCheckNotifications') {
        scheduleNotificationCheck(); // Update the timer
    }
    if (key.startsWith('shortcuts.') || key === 'shortcutsGlobal') {
        registerShortcuts(); // This function will now use the updated settings
    }

    if (key === 'language') {
        // Instead of reloading, just notify windows of the change.
        // The renderer process will handle re-applying translations.
        broadcastToAllWebContents('language-changed', value);
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

    settingsWin.loadFile('settings.html');

    settingsWin.once('ready-to-show', () => {
        if (settingsWin) settingsWin.show();
    });

    settingsWin.on('closed', () => {
        settingsWin = null;
    });
});