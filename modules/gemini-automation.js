// Gemini Automation Module

const { BrowserWindow } = require('electron');

let settings = null;
let playAiCompletionSound = null;

function initialize(deps) {
    settings = deps.settings;
    playAiCompletionSound = deps.playAiCompletionSound;
}

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
                    } catch(e) {}

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

module.exports = {
    initialize,
    createNewChatWithModel,
    triggerSearch,
    executeDefaultPrompt,
    checkAndSendDefaultPrompt
};
