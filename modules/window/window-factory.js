const { BrowserWindow } = require('electron');
const path = require('path');

let settings = null;
let utils = null;
let constants = null;
let accountsModule = null;
let loadGemini = null;
let nativeTheme = null;
let globalShortcut = null;

let notificationWin = null;

function initialize(deps) {
  settings = deps.settings;
  utils = deps.utils;
  constants = deps.constants;
  accountsModule = deps.accountsModule;
  loadGemini = deps.loadGemini;
  nativeTheme = deps.nativeTheme;
  globalShortcut = deps.globalShortcut;
}

/**
 * Creates the main application window
 */
function createWindow(state = null) {
  const { originalSize, SESSION_PARTITION } = constants;
  const { getIconPath, applyAlwaysOnTopSetting, applyInvisibilityMode, setupContextMenu, debouncedSaveSettings } = utils;

  const windowOptions = {
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
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      contextIsolation: true,
      partition: SESSION_PARTITION
    }
  };

  if (settings.preserveWindowSize && settings.windowBounds) {
    windowOptions.width = settings.windowBounds.width || originalSize.width;
    windowOptions.height = settings.windowBounds.height || originalSize.height;
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

  applyAlwaysOnTopSetting(newWin, settings.alwaysOnTop);
  applyInvisibilityMode(newWin);

  newWin.isCanvasActive = false;
  newWin.prevBounds = null;
  newWin.appMode = null;
  newWin.savedScrollPosition = 0;

  setupContextMenu(newWin.webContents);

  // Zoom handling
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

  // Focus/Lifecycle
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
  });

  newWin.on('closed', () => {
    // We need to notify main that a window was closed if it tracks them
  });

  // Helper function to update BrowserView bounds
  const updateViewBounds = async (saveScroll = true, restoreScroll = true, updateBounds = true) => {
    const view = newWin.getBrowserView();
    if (view && view.webContents && !view.webContents.isDestroyed()) {
      if (updateBounds) {
        const contentBounds = newWin.getContentBounds();
        view.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
      }

      try {
        view.webContents.invalidate();
      } catch (e) { }

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
    if (settings.preserveWindowSize && newWin && !newWin.isDestroyed()) {
      settings.windowBounds = newWin.getBounds();
      debouncedSaveSettings(settings);
    }
  });

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
        try {
          view.webContents.invalidate();
        } catch (e) { }
      }
    }
  });

  newWin.on('will-resize', (event, newBounds) => {
    if (newWin && !newWin.isDestroyed()) {
      const view = newWin.getBrowserView();
      if (view && newBounds.width > 0 && newBounds.height > 30) {
        view.setBounds({ x: 0, y: 30, width: newBounds.width, height: newBounds.height - 30 });
        if (view.webContents && !view.webContents.isDestroyed()) {
          try {
            view.webContents.invalidate();
          } catch (e) { }
        }
      }
      if (view && !view.webContents.isDestroyed()) {
        view.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`)
          .then(y => { newWin.savedScrollPosition = y; })
          .catch(() => { });
      }
    }
  });

  // Handle Loading
  if (state) {
    if (state.bounds) newWin.setBounds(state.bounds);
    const stateAccountIndex = typeof state.accountIndex === 'number' ? state.accountIndex : newWin.accountIndex;
    loadGemini(state.mode || settings.defaultMode, newWin, state.url, { accountIndex: stateAccountIndex });
  } else if (!settings.onboardingShown) {
    newWin.loadFile('html/onboarding.html');
  } else if (settings.defaultMode === 'ask') {
    newWin.loadFile('html/choice.html');
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

/**
 * Creates the notification window
 */
function createNotificationWindow() {
  if (notificationWin) {
    notificationWin.focus();
    return notificationWin;
  }

  notificationWin = new BrowserWindow({
    width: 550,
    height: 450,
    frame: false,
    show: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload.js'),
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

  return notificationWin;
}

module.exports = {
  initialize,
  createWindow,
  createNotificationWindow,
  getNotificationWindow: () => notificationWin
};
