const { globalShortcut, BrowserWindow, app, clipboard, shell } = require('electron');
const { spawn } = require('child_process');

let settings = null;
let utils = null;
let constants = null;
let windowFactory = null;
let browserViewModule = null;
let togglePieMenu = null;

// Internal state
let lastFocusedWindow = null;
let isUserTogglingHide = false;

function initialize(deps) {
  settings = deps.settings;
  utils = deps.utils;
  constants = deps.constants;
  windowFactory = deps.windowFactory;
  browserViewModule = deps.browserViewModule;
  togglePieMenu = deps.togglePieMenu;
}

/**
 * Global shortcut actions
 */
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
    const allWindows = BrowserWindow.getAllWindows();
    const userWindows = allWindows.filter(w => !w.__internal);

    if (userWindows.length === 0) {
      const newWin = windowFactory.createWindow();
      const checkView = () => {
        const view = newWin.getBrowserView();
        if (view && !view.webContents.isDestroyed() && view.webContents.getURL()) {
          setTimeout(() => clickMicrophoneButton(newWin, view), 1000);
        } else {
          setTimeout(checkView, 200);
        }
      };
      checkView();
      return;
    }

    const shouldShow = userWindows.some(win => !win.isVisible());
    if (!shouldShow) {
      const focused = userWindows.find(w => w.isFocused());
      lastFocusedWindow = focused && !focused.isDestroyed() ? focused : userWindows[0];
    } else {
      userWindows.forEach(win => {
        if (win.isMinimized()) win.restore();
        win.show();
      });
      const focused = userWindows.find(w => w.isFocused());
      lastFocusedWindow = focused && !focused.isDestroyed() ? focused : userWindows[0];
      if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
        setTimeout(() => {
          utils.forceOnTop(lastFocusedWindow);
          const view = lastFocusedWindow.getBrowserView();
          if (view && !view.webContents.isDestroyed()) view.webContents.focus();
        }, 100);
      }
    }

    await new Promise(resolve => setTimeout(resolve, shouldShow ? 1200 : 300));
    const targetWin = lastFocusedWindow || userWindows[0];
    if (!targetWin || targetWin.isDestroyed()) return;

    const view = targetWin.getBrowserView();
    if (!view || view.webContents.isDestroyed()) return;

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

  newWindow: () => windowFactory.createWindow(),

  newChat: () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow || !focusedWindow.appMode) return;
    const view = focusedWindow.getBrowserView();
    if (!view) return;

    if (focusedWindow.appMode === 'aistudio') {
      view.webContents.loadURL('https://aistudio.google.com/prompts/new_chat');
    } else {
      const script = `
        (async function() {
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
            const selectors = ['button[aria-label="New chat"]', 'button[aria-label="Create new chat"]', '[data-test-id="new-chat-button"] button'];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el && !el.disabled && el.offsetParent !== null) {
                    simulateClick(el);
                    return;
                }
            }
            const menuButton = document.querySelector('button[aria-label="Main menu"]');
            if (menuButton) {
                simulateClick(menuButton);
                for (const sel of selectors) {
                    const btn = await waitForElement(sel, 1000);
                    if (btn) {
                        simulateClick(btn);
                        return;
                    }
                }
            }
            window.location.href = 'https://gemini.google.com/app';
        })();
      `;
      view.webContents.executeJavaScript(script).catch(() => {
        view.webContents.loadURL('https://gemini.google.com/app');
      });
    }
  },

  changeModelPro: () => changeModelAction('Pro'),
  changeModelFlash: () => changeModelAction('Flash'),
  changeModelThinking: () => changeModelAction('Thinking'),

  newChatWithPro: () => newChatWithModelAction('Pro'),
  newChatWithFlash: () => newChatWithModelAction('Flash'),
  newChatWithThinking: () => newChatWithModelAction('Thinking'),

  search: () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow || !focusedWindow.appMode) return;

    if (focusedWindow.appMode === 'aistudio') {
      const view = focusedWindow.getBrowserView();
      if (!view) return;
      const libraryUrl = 'https://aistudio.google.com/library';
      const focusScript = `const input = document.querySelector('input[placeholder="Search"]'); if (input) input.focus();`;
      if (view.webContents.getURL().startsWith(libraryUrl)) {
        view.webContents.executeJavaScript(focusScript).catch(() => { });
      } else {
        view.webContents.loadURL(libraryUrl);
        view.webContents.once('did-finish-load', () => {
          setTimeout(() => view.webContents.executeJavaScript(focusScript).catch(() => { }), 500);
        });
      }
    } else {
      triggerSearch();
    }
  },

  refresh: () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      const view = focusedWindow.getBrowserView();
      if (view && !view.webContents.isDestroyed()) view.webContents.reload();
    }
  },

  screenshot: () => {
    const targetWin = BrowserWindow.getFocusedWindow() || lastFocusedWindow || BrowserWindow.getAllWindows()[0];
    if (!targetWin) return;

    if (settings.autoScreenshotFullScreen) {
      proceedWithFullScreenScreenshot(targetWin);
    } else {
      proceedWithScreenshot(targetWin);
    }
  }
};

/**
 * Internal helper for clicking microphone button
 */
async function clickMicrophoneButton(targetWin, view) {
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
                setTimeout(() => { clearInterval(timer); reject(new Error('TE')); }, timeout);
            });
        };
        const simulateClick = (element) => {
            ['mousedown', 'mouseup', 'click'].forEach(type => {
                element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
            });
        };
        try {
            const micSelectors = ['button[aria-label*="microphone" i]', 'button[aria-label*="mic" i]', 'button.speech_dictation_mic_button'];
            let btn = null;
            for (const s of micSelectors) {
                try { btn = await waitForElement(s, 1000); if (btn) break; } catch(e){}
            }
            if (btn) simulateClick(btn);
            return { success: !!btn };
        } catch (e) { return { success: false }; }
    })();
  `;
  try {
    await view.webContents.executeJavaScript(script);
  } catch (e) { }
}

/**
 * Internal helper for triggering search
 */
function triggerSearch() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow) return;
  const view = focusedWindow.getBrowserView();
  if (!view) return;

  const script = `
    (async function() {
      const simulateClick = (element) => {
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });
      };
      const menuButton = document.querySelector('button[aria-label="Main menu"]');
      if (menuButton) simulateClick(menuButton);
      setTimeout(() => {
        const searchBtn = document.querySelector('search-nav-bar button.search-nav-bar');
        if (searchBtn) simulateClick(searchBtn);
      }, 300);
    })();
  `;
  view.webContents.executeJavaScript(script).catch(() => { });
}

/**
 * Internal helper for model switching
 */
function changeModelAction(modelType) {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow || !focusedWindow.appMode) return;
  const view = focusedWindow.getBrowserView();
  if (!view) return;

  if (focusedWindow.appMode === 'aistudio') {
    // AI Studio logic ... (omitted for brevity in this example, same as main.js)
  } else {
    createNewChatWithModel(modelType);
  }
}

/**
 * Internal helper for new chat with model
 */
function newChatWithModelAction(modelType) {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow || !focusedWindow.appMode) return;
  const view = focusedWindow.getBrowserView();
  if (!view) return;

  if (focusedWindow.appMode === 'aistudio') {
    const url = modelType === 'Pro' ? 'https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-pro' :
      modelType === 'Flash' ? 'https://aistudio.google.com/prompts/new_chat?model=gemini-flash-latest' :
        'https://aistudio.google.com/prompts/new_chat?model=gemini-thinking';
    view.webContents.loadURL(url);
  } else {
    view.webContents.executeJavaScript(`
      const menuButton = document.querySelector('button[aria-label="Main menu"]');
      if (menuButton) {
        menuButton.click();
        setTimeout(() => {
          const newChatButton = document.querySelector('button[aria-label="New chat"]');
          if (newChatButton) newChatButton.click();
        }, 100);
      }
    `).then(() => {
      setTimeout(() => createNewChatWithModel(modelType), 500);
    }).catch(() => { });
  }
}

/**
 * Internal helper for createNewChatWithModel (similar to main.js)
 */
function createNewChatWithModel(modelType) {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow) {
    windowFactory.createWindow();
    return;
  }
  const view = focusedWindow.getBrowserView();
  if (!view) return;

  const modelIndex = modelType.toLowerCase() === 'flash' ? 0 : modelType.toLowerCase() === 'thinking' ? 1 : 2;
  const script = `
    (async function() {
      const waitForElement = (s, t = 3000) => new Promise((resolve, reject) => {
        const i = setInterval(() => { const e = document.querySelector(s); if (e && !e.disabled) { clearInterval(i); resolve(e); } }, 100);
        setTimeout(() => { clearInterval(i); reject(new Error('TE')); }, t);
      });
      const simulateClick = (e) => { ['mousedown', 'mouseup', 'click'].forEach(type => e.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }))); };
      try {
        let switcher;
        try { switcher = await waitForElement('[data-test-id="bard-mode-menu-button"]'); }
        catch (e) {
          const newBtn = await waitForElement('[data-test-id="new-chat-button"] button', 5000);
          simulateClick(newBtn);
          await new Promise(r => setTimeout(r, 500));
          switcher = await waitForElement('[data-test-id="bard-mode-menu-button"]', 5000);
        }
        simulateClick(switcher);
        const panel = await waitForElement('mat-bottom-sheet-container, .mat-mdc-menu-panel', 5000);
        const items = panel.querySelectorAll('button.mat-mdc-menu-item.bard-mode-list-button');
        if (items.length > ${modelIndex}) simulateClick(items[${modelIndex}]);
      } catch (e) { }
    })();
  `;
  view.webContents.executeJavaScript(script).catch(() => { });
}

/**
 * Screenshot logic (simplified excerpts from main.js)
 */
async function proceedWithFullScreenScreenshot(targetWin) {
  // ... (Full screen screenshot logic)
}

async function proceedWithScreenshot(targetWin) {
  // ... (Capture area screenshot logic)
}

/**
 * Registers global shortcuts
 */
function registerShortcuts() {
  globalShortcut.unregisterAll();
  const shortcuts = settings.shortcuts;

  if (shortcuts.showHide) {
    globalShortcut.register(shortcuts.showHide, () => {
      const allWindows = BrowserWindow.getAllWindows();
      const userWindows = allWindows.filter(w => !w.__internal);

      if (userWindows.length === 0) {
        windowFactory.createWindow();
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
        lastFocusedWindow = focused && !focused.isDestroyed() ? focused : userWindows[0];
        if (lastFocusedWindow && !lastFocusedWindow.isDestroyed()) {
          utils.forceOnTop(lastFocusedWindow);
          const view = lastFocusedWindow.getBrowserView();
          if (view && !view.webContents.isDestroyed()) view.webContents.focus();
        }
      }
    });
  }

  // Register pie menu shortcut
  if (shortcuts.pieMenu && togglePieMenu) {
    try {
      globalShortcut.register(shortcuts.pieMenu, () => {
        togglePieMenu();
      });
    } catch (e) {
      console.warn('Failed to register pie menu shortcut:', e);
    }
  }

  // Register all other shortcuts
  const shortcutMap = {
    quit: shortcutActions.quit,
    closeWindow: shortcutActions.closeWindow,
    newWindow: shortcutActions.newWindow,
    newChat: shortcutActions.newChat,
    screenshot: shortcutActions.screenshot,
    voiceAssistant: shortcutActions.voiceAssistant,
    findInPage: shortcutActions.findInPage,
    search: shortcutActions.search,
    refresh: shortcutActions.refresh,
    changeModelPro: shortcutActions.changeModelPro,
    changeModelFlash: shortcutActions.changeModelFlash,
    changeModelThinking: shortcutActions.changeModelThinking,
    newChatWithPro: shortcutActions.newChatWithPro,
    newChatWithFlash: shortcutActions.newChatWithFlash,
    newChatWithThinking: shortcutActions.newChatWithThinking
  };

  // Register each shortcut if it has a non-empty value
  Object.keys(shortcutMap).forEach(key => {
    const shortcutValue = shortcuts[key];
    // Only register if the shortcut value exists and is not empty
    if (shortcutValue && shortcutValue.trim && shortcutValue.trim() !== '') {
      try {
        globalShortcut.register(shortcutValue, shortcutMap[key]);
      } catch (e) {
        console.warn(`Failed to register ${key} shortcut:`, e);
      }
    }
  });
}

module.exports = {
  initialize,
  registerShortcuts,
  shortcutActions,
  createNewChatWithModel
};
