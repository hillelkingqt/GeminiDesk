// Shortcuts Management Module

const { app, BrowserWindow, globalShortcut } = require('electron');
const { forceOnTop } = require('./utils');

let settings = null;
let clickMicrophoneButton = null;
let createWindow = null;
let createNewChatWithModel = null;
let triggerSearch = null;
let setCanvasMode = null;
let reloadFocusedView = null;
let proceedWithScreenshot = null; // This will be passed from main or a separate screenshot module
let lastFocusedWindow = null;

function initialize(deps) {
    settings = deps.settings;
    // clickMicrophoneButton is now expected to be passed from deps,
    // likely imported from modules/voice-assistant.js in main.js and passed here.
    clickMicrophoneButton = deps.clickMicrophoneButton;
    createWindow = deps.createWindow;
    createNewChatWithModel = deps.createNewChatWithModel;
    triggerSearch = deps.triggerSearch;
    setCanvasMode = deps.setCanvasMode;
    reloadFocusedView = deps.reloadFocusedView;
    proceedWithScreenshot = deps.proceedWithScreenshot;
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
            // Open new chat menu for Gemini - click the button in the HTML
            const script = `
                (function() {
                    // First click the main menu button
                    const menuButton = document.querySelector('button[aria-label="Main menu"]');
                    if (menuButton) {
                        menuButton.click();
                        // Wait a bit for the menu to open, then click New chat
                        setTimeout(() => {
                            const newChatButton = document.querySelector('button[aria-label="New chat"]');
                            if (newChatButton) {
                                newChatButton.click();
                            }
                        }, 100);
                    }
                })();
            `;
            view.webContents.executeJavaScript(script).catch(err => {
                console.error('Failed to execute new chat script:', err);
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
                        const proModel = await waitForElement('ms-model-carousel-row button[id*="gemini-2.5-pro"], ms-model-carousel-row button[id*="gemini-pro"]');
                        simulateClick(proModel);
                        console.log('AI Studio: Selected Pro model');

                        // Wait a bit and close the model selection panel
                        await new Promise(resolve => setTimeout(resolve, 400));
                        const closeModelPanel = await waitForElement('button[aria-label="Close panel"][mat-dialog-close], button[data-test-close-button][iconname="close"]', 3000);
                        simulateClick(closeModelPanel);
                        console.log('AI Studio: Closed model selection panel');

                        // Wait and close the settings panel
                        await new Promise(resolve => setTimeout(resolve, 300));
                        const closeSettingsPanel = await waitForElement('button[aria-label="Close run settings panel"][iconname="close"]', 3000);
                        simulateClick(closeSettingsPanel);
                        console.log('AI Studio: Closed settings panel');

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
                        const closeSettingsPanel = await waitForElement('button[aria-label="Close run settings panel"][iconname="close"]', 3000);
                        simulateClick(closeSettingsPanel);
                        console.log('AI Studio: Closed settings panel');

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

            // If already on onboarding, restore view
            if (currentUrl.includes('onboarding.html')) {
                // ... logic handled by onboarding-complete IPC which reloads drag.html
                // but if we trigger it manually here we might need access to detachedViews
                // which is in main.js.
                // Maybe better to just reload drag.html directly if possible?
                // For now, let's just reload the window which usually restores state
                focusedWindow.reload();
            } else {
                // If not on onboarding, load it
                if (typeof deps.showInstructions === 'function') {
                    deps.showInstructions(focusedWindow);
                }
            }
        }
    },
    refresh: () => reloadFocusedView(),
    screenshot: () => {
        if (proceedWithScreenshot) {
            proceedWithScreenshot();
        }
    }
};

function registerShortcuts(broadcastToAllWebContents) {
    globalShortcut.unregisterAll();
    const shortcuts = settings.shortcuts;
    let isUserTogglingHide = false;

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

    const globalShortcuts = {};
    const localOnlyShortcuts = {};

    // Separate shortcuts based on global/local setting
    for (const action in localShortcuts) {
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
    if (broadcastToAllWebContents) {
        if (Object.keys(localOnlyShortcuts).length > 0) {
            console.log('Registering LOCAL shortcuts:', Object.keys(localOnlyShortcuts));
            broadcastToAllWebContents('set-local-shortcuts', localOnlyShortcuts);
        } else {
            broadcastToAllWebContents('set-local-shortcuts', {});
        }
    }
}

module.exports = {
    initialize,
    registerShortcuts,
    shortcutActions
};
