// Deep Research Schedule Functions Module

let deepResearchScheduleInterval = null;
let lastScheduleCheck = 0;
let settings = null;
let createWindow = null;
let shortcutActions = null;
let playAiCompletionSound = null;
let sendNotification = null;
let translations = null;

// Initialize with dependencies
function initialize(deps) {
    settings = deps.settings;
    createWindow = deps.createWindow;
    shortcutActions = deps.shortcutActions;
    playAiCompletionSound = deps.playAiCompletionSound;
    sendNotification = deps.sendNotification;
    translations = deps.translations;
}

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

        if (sendNotification) {
            sendNotification('Deep Research Started', 'Executing scheduled research task...');
        }

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
        if (currentUrl.includes('html/choice.html')) {
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

        // Switch to Pro model (Alt+Shift+P)
        console.log('Deep Research Schedule: Switching to Pro model');
        if (shortcutActions.changeModelPro) {
            shortcutActions.changeModelPro();
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
                            }, 30000);
                        });
                    };

                    const exportToGoogleDocs = async () => {
                        try {
                            console.log('Deep Research Schedule: Starting export to Google Docs');

                            const shareExportButton = await waitForElement(
                                'button[data-test-id="export-menu-button"], button:has(.mat-mdc-button-persistent-ripple):has([class*="Export"])',
                                10000
                            );
                            simulateClick(shareExportButton);
                            console.log('Deep Research Schedule: Share & Export button clicked');

                            await new Promise(resolve => setTimeout(resolve, 1000));

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
                        console.log('Deep Research Schedule: Looking for Tools button');
                        const toolsButton = await waitForElement('button.toolbox-drawer-button, toolbox-drawer button, [aria-label*="Tools"]');
                        simulateClick(toolsButton);
                        console.log('Deep Research Schedule: Tools button clicked');

                        await new Promise(resolve => setTimeout(resolve, 2000));

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

                        console.log('Deep Research Schedule: Looking for Send button');
                        const sendButton = await waitForElement('button.send-button[jslog*="173899"], button[aria-label="Send message"], button.send-button.submit');
                        simulateClick(sendButton);
                        console.log('Deep Research Schedule: Send button clicked');

                        await new Promise(resolve => setTimeout(resolve, 3000));

                        console.log('Deep Research Schedule: Looking for Start Research button');

                        const startResearchButton = await waitForElement(
                            'button[data-test-id="confirm-button"], button.confirm-button[mat-flat-button], button.mdc-button--unelevated[color="primary"]'
                        );

                        simulateClick(startResearchButton);
                        console.log('Deep Research Schedule: Start Research button clicked');

                        console.log('Deep Research Schedule: Waiting for research completion...');
                        await waitForResearchCompletion();

                        await new Promise(resolve => setTimeout(resolve, 5000));

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

            if (playAiCompletionSound) {
                playAiCompletionSound();
                console.log('Deep Research Schedule: Completion sound played');
            }

            if (sendNotification) {
                sendNotification('Deep Research Completed', 'Research task finished successfully.');
            }

        } else {
            throw new Error('No browser view available');
        }

        console.log('Deep Research Schedule: Research executed successfully');

    } catch (error) {
        console.error('Deep Research Schedule: Failed to execute scheduled research:', error);

        if (sendNotification) {
            sendNotification('Deep Research Failed', 'An error occurred during the scheduled task.');
        }

        if (targetWin && !targetWin.isDestroyed()) {
            console.log('Deep Research Schedule: Closing Gemini window due to failure');
            targetWin.close();
        }
    }
}

function stopScheduleCheck() {
    // Clear the interval if it exists
    if (deepResearchScheduleInterval) {
        clearInterval(deepResearchScheduleInterval);
        deepResearchScheduleInterval = null;
        console.log('Deep Research Schedule: Monitoring stopped');
    }
}

module.exports = {
    initialize,
    scheduleDeepResearchCheck,
    checkAndExecuteScheduledResearch,
    executeScheduledDeepResearch,
    stopScheduleCheck
};
