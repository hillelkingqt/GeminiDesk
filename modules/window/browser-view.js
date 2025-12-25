const { BrowserView, BrowserWindow, shell, session, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

let settings = null;
let utils = null;
let constants = null;
let accountsModule = null;
let windowFactory = null;

// Internal state
const profileCaptureTimestamps = new Map();
const detachedViews = new Map();
const PROFILE_CAPTURE_COOLDOWN_MS = 60 * 1000;
const PROFILE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
let avatarDirectoryPath = null;
let isLoginWindowOpen = false; // Prevent multiple login windows

function initialize(deps) {
  settings = deps.settings;
  utils = deps.utils;
  constants = deps.constants;
  accountsModule = deps.accountsModule;
  windowFactory = deps.windowFactory;
}

/**
 * Get the directory for storing account avatars
 */
function getAvatarStorageDir() {
  const { app } = require('electron');
  if (avatarDirectoryPath) return avatarDirectoryPath;
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

/**
 * Download account avatar from URL
 */
async function downloadAccountAvatar(sourceUrl, accountIndex) {
  if (!sourceUrl) return '';
  try {
    const response = await fetch(sourceUrl);
    if (!response || !response.ok) {
      throw new Error(`HTTP ${response ? response.status : 'unknown'}`);
    }
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dir = getAvatarStorageDir();
    const avatarPath = path.join(dir, `account-${accountIndex}.png`);
    await fsp.writeFile(avatarPath, buffer);
    return avatarPath;
  } catch (error) {
    console.warn('Failed to download account avatar:', error && error.message ? error.message : error);
    return '';
  }
}

/**
 * Capture account profile information from the view
 */
async function captureAccountProfile(view, accountIndex, forceAttempt = false) {
  if (!view || !view.webContents || view.webContents.isDestroyed()) return;

  if (typeof accountIndex !== 'number' || accountIndex < 0) return;

  if (!forceAttempt) {
    const now = Date.now();
    const last = profileCaptureTimestamps.get(accountIndex) || 0;
    if (now - last < PROFILE_CAPTURE_COOLDOWN_MS) return;
    profileCaptureTimestamps.set(accountIndex, now);
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

    if (!profile) return;

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
      if (downloaded) avatarFile = downloaded;
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

    if (profile.displayName && (!existingAccount || !existingAccount.name || existingAccount.name.startsWith('Account '))) {
      updates.name = profile.displayName;
    }

    if (Object.keys(updates).length > 0) {
      const updatedAccount = accountsModule.updateAccountMetadata(accountIndex, updates);
      if (updatedAccount) {
        utils.broadcastToAllWebContents('settings-updated', settings);
      }
    }
  } catch (error) {
    console.warn('Failed to capture account profile:', error && error.message ? error.message : error);
  }
}

/**
 * Execute default prompt in a new chat
 */
async function executeDefaultPrompt(view, promptContent, mode) {
  if (!view || view.webContents.isDestroyed()) return;

  const script = `
    (async function() {
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
                return true;
            } catch (e) { }

            try {
                element.focus();
                element.textContent = text;
                element.dispatchEvent(new InputEvent('input', {
                    data: text, inputType: 'insertText', bubbles: true, cancelable: true
                }));
                return true;
            } catch (e) {
                return false;
            }
        };

        try {
            const inputArea = await waitForElement('.ql-editor[contenteditable="true"], rich-textarea .ql-editor, [data-placeholder*="Ask"]');
            const promptText = \`${promptContent.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\${/g, '\\${')}\`;
            const insertSuccess = insertTextSafely(inputArea, promptText);
            
            if (!insertSuccess) throw new Error('Failed to insert prompt text');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            const sendButton = await waitForElement('button.send-button[jslog*="173899"], button[aria-label="Send message"], button.send-button.submit, button[data-test-id="send-button"]');
            simulateClick(sendButton);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    })();
    `;

  try {
    const result = await view.webContents.executeJavaScript(script);
    if (result.success) {
      console.log('Prompt Manager: Default prompt sent successfully');
    }
  } catch (error) {
    console.error('Prompt Manager: Script execution failed:', error);
  }
}

/**
 * Check if current page is a new chat and send default prompt
 */
function checkAndSendDefaultPrompt(view, url, mode) {
  if (!view || view.webContents.isDestroyed()) return;

  let isNewChat = false;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'gemini.google.com') {
      if (urlObj.pathname === '/app' || urlObj.pathname === '/app/') isNewChat = true;
    } else if (urlObj.hostname === 'aistudio.google.com') {
      if (url.includes('/prompts/new_chat')) isNewChat = true;
    }
  } catch (e) { }

  if (isNewChat) {
    if (!view.__defaultPromptSent && settings.defaultPromptId && settings.customPrompts) {
      const defaultPrompt = settings.customPrompts.find(p => p.id === settings.defaultPromptId);
      if (defaultPrompt && defaultPrompt.content) {
        view.__defaultPromptSent = true;
        setTimeout(() => {
          if (!view || view.webContents.isDestroyed()) return;
          const currentUrl = view.webContents.getURL();
          let stillNewChat = false;
          try {
            const currentUrlObj = new URL(currentUrl);
            if (currentUrlObj.hostname === 'gemini.google.com') {
              if (currentUrlObj.pathname === '/app' || currentUrlObj.pathname === '/app/') stillNewChat = true;
            } else if (currentUrlObj.hostname === 'aistudio.google.com') {
              if (currentUrl.includes('/prompts/new_chat')) stillNewChat = true;
            }
          } catch (e) { }

          if (stillNewChat) {
            executeDefaultPrompt(view, defaultPrompt.content, mode);
          }
        }, 2000);
      }
    }
  } else if (view.__defaultPromptSent) {
    view.__defaultPromptSent = false;
  }
}

/**
 * Creates an isolated login window and transfers cookies into a specific account partition.
 * Uses DEFAULT session (not partition) which Google accepts, then transfers cookies.
 */
async function createAndManageLoginWindow(loginUrl, targetAccountIndex, options = {}) {
  // Prevent multiple login windows
  if (isLoginWindowOpen) {
    console.log('Login window already open, skipping...');
    return null;
  }
  isLoginWindowOpen = true;

  const targetPartition = accountsModule.getAccountPartition(targetAccountIndex);

  console.log(`Opening login window for account ${targetAccountIndex}, will transfer to: ${targetPartition}`);

  // Use ephemeral partition (without persist:) - clears on each app start
  // This avoids cookie conflicts that cause Google's cookie error
  const loginPartition = 'login-session-temp';

  // Clear any existing cookies from this partition
  const loginSession = session.fromPartition(loginPartition);
  await loginSession.clearStorageData();
  console.log('Cleared login session storage');

  // Create login window with clean ephemeral session
  const tempWin = new BrowserWindow({
    width: 500,
    height: 700,
    show: true,
    frame: true,
    resizable: true,
    webPreferences: {
      partition: loginPartition,
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      javascript: true,
      webSecurity: true,
      userAgent: constants.STABLE_USER_AGENT
    }
  });

  tempWin.center();
  console.log('Login window created with persist:login-session partition');

  tempWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  utils.setupContextMenu(tempWin.webContents);
  tempWin.loadURL(loginUrl);

  tempWin.on('closed', () => {
    console.log('Login window closed');
    isLoginWindowOpen = false;
  });

  tempWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
    console.log('Login window navigated to:', navigatedUrl);

    // Check if login was successful - user reached Gemini or AI Studio
    const isGemini = navigatedUrl.startsWith(constants.GEMINI_URL) || /\/u\/\d+\/app(\/.*)?$/.test(navigatedUrl);
    const isAiStudio = navigatedUrl.startsWith(constants.AISTUDIO_URL);

    if (!isGemini && !isAiStudio) return;

    console.log('Login successful! Transferring cookies...');

    const isolatedSession = tempWin.webContents.session;

    // Wait for cookies to be set
    let sessionCookieFound = false;
    for (let i = 0; i < 20; i++) {
      const cookies = await isolatedSession.cookies.get({ domain: '.google.com' });
      if (cookies && cookies.length > 0) {
        sessionCookieFound = true;
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    if (!sessionCookieFound) {
      console.log('No cookies found after login - keeping window open');
      return;
    }

    try {
      // Transfer cookies to target partition
      const mainSession = session.fromPartition(targetPartition);

      // Get cookies from all Google-related domains
      const allCookies = await isolatedSession.cookies.get({});
      const googleCookies = allCookies.filter(c =>
        c.domain.includes('google') ||
        c.domain.includes('youtube') ||
        c.domain.includes('gstatic')
      );
      console.log(`Transferring ${googleCookies.length} cookies to ${targetPartition}`);

      let transferred = 0;
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
          transferred++;
        } catch (e) {
          // Don't log every error, just count failures
        }
      }
      console.log(`Successfully transferred ${transferred}/${googleCookies.length} cookies`);

      await mainSession.cookies.flushStore().catch(() => { });

      // Wait a bit for cookies to be fully written
      await new Promise(r => setTimeout(r, 500));
      console.log('Cookie transfer complete!');

      // Close login window
      if (tempWin && !tempWin.isDestroyed()) {
        tempWin.close();
      }

      // Set as current account (use local settings reference)
      settings.currentAccountIndex = targetAccountIndex;
      // Note: settings is saved by the caller

      // After first login, show choice window to let user pick Gemini or AI Studio
      const choiceWin = windowFactory.createWindow();
      if (choiceWin && !choiceWin.isDestroyed()) {
        choiceWin.loadFile('html/choice.html');
        choiceWin.setResizable(false);
        choiceWin.setSize(500, 450);
        choiceWin.center();
        choiceWin.setAlwaysOnTop(true, 'screen-saver');
        choiceWin.focus();
        choiceWin.show();
      }

    } catch (err) {
      console.error('Error during cookie transfer:', err);
    }
  });

  return tempWin;
}


/**
 * Loads Gemini or AI Studio into a target window
 */
async function loadGemini(mode, targetWin, initialUrl, options = {}) {
  if (!targetWin || targetWin.isDestroyed()) return;

  targetWin.appMode = mode;
  utils.updateWindowAppUserModelId(targetWin, mode);

  if (targetWin.webContents && !targetWin.webContents.isDestroyed()) {
    targetWin.webContents.send('app-mode-changed', mode);
  }

  const targetAccountIndex = typeof options.accountIndex === 'number'
    ? options.accountIndex
    : (typeof targetWin.accountIndex === 'number' ? targetWin.accountIndex : (settings.currentAccountIndex || 0));
  targetWin.accountIndex = targetAccountIndex;
  const partitionName = accountsModule.getAccountPartition(targetAccountIndex);

  const url = initialUrl || (mode === 'aistudio' ? constants.AISTUDIO_URL : constants.GEMINI_URL);

  const existingView = targetWin.getBrowserView();
  if (existingView && existingView.__accountPartition === partitionName) {
    existingView.webContents.loadURL(url);
    existingView.webContents.removeAllListeners('did-finish-load');
    existingView.webContents.removeAllListeners('did-navigate');
    existingView.webContents.removeAllListeners('did-navigate-in-page');

    // Track if login was handled for this view
    let loginHandledForExisting = false;

    const onNav = (event, navUrl) => {
      const viewUrl = navUrl || existingView.webContents.getURL() || '';

      // Auto-detect Google login page
      if (!loginHandledForExisting && !isLoginWindowOpen && (
        viewUrl.includes('accounts.google.com/v3/signin') ||
        viewUrl.includes('accounts.google.com/signin') ||
        viewUrl.includes('accounts.google.com/ServiceLogin'))) {

        loginHandledForExisting = true;
        console.log('Detected login page redirect (existing view), opening login window...');

        const continueUrl = mode === 'aistudio' ? constants.AISTUDIO_URL : constants.GEMINI_URL;
        createAndManageLoginWindow(continueUrl, targetAccountIndex).then(() => {
          if (existingView && existingView.webContents && !existingView.webContents.isDestroyed()) {
            existingView.webContents.loadURL(continueUrl);
          }
          loginHandledForExisting = false;
        }).catch(() => {
          loginHandledForExisting = false;
        });
        return;
      }

      if (viewUrl.startsWith('https://gemini.google.com') || viewUrl.startsWith('https://aistudio.google.com')) {
        captureAccountProfile(existingView, targetAccountIndex, options.forceProfileCapture);
        checkAndSendDefaultPrompt(existingView, viewUrl, mode);
      }
    };

    existingView.webContents.on('did-finish-load', onNav);
    existingView.webContents.on('did-navigate', onNav);
    existingView.webContents.on('did-navigate-in-page', onNav);
    return;
  } else if (existingView) {
    targetWin.removeBrowserView(existingView);
    existingView.webContents.destroy();
  }

  targetWin.loadFile('html/drag.html');

  const newView = new BrowserView({
    webPreferences: {
      partition: partitionName,
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      contextIsolation: true,
      nativeWindowOpen: true,
      backgroundThrottling: false
    }
  });

  newView.webContents.setBackgroundThrottling(false);
  utils.setupContextMenu(newView.webContents);

  newView.webContents.setWindowOpenHandler(({ url: popupUrl }) => {
    try {
      const parsed = new URL(popupUrl);
      const isGoogleLogin = /^https:\/\/accounts\.google\.com\//.test(popupUrl);
      const isGemini = parsed.hostname === 'gemini.google.com' || parsed.hostname.endsWith('.gemini.google.com');
      const isAistudio = parsed.hostname === 'aistudio.google.com' || parsed.hostname.endsWith('.aistudio.google.com');

      if (isGoogleLogin) {
        createAndManageLoginWindow(popupUrl, targetAccountIndex);
        return { action: 'deny' };
      }

      if (isGemini || isAistudio) {
        let authuser = parsed.searchParams.get('authuser');
        let accountIdx = parseInt(authuser, 10);
        if (!isNaN(accountIdx)) accountsModule.switchAccount(accountIdx);

        loadGemini(isAistudio ? 'aistudio' : 'gemini', targetWin, popupUrl, !isNaN(accountIdx) ? { accountIndex: accountIdx } : {});
        return { action: 'deny' };
      }
    } catch (e) { }

    shell.openExternal(popupUrl);
    return { action: 'deny' };
  });

  // Track if we already handled login for this view to prevent loops
  let loginHandledForView = false;

  const onNavNew = (event, navUrl) => {
    const viewUrl = navUrl || newView.webContents.getURL() || '';

    // Auto-detect Google login page - open login window (with guard against loops)
    if (!loginHandledForView && !isLoginWindowOpen && (
      viewUrl.includes('accounts.google.com/v3/signin') ||
      viewUrl.includes('accounts.google.com/signin') ||
      viewUrl.includes('accounts.google.com/ServiceLogin'))) {

      loginHandledForView = true;
      console.log('Detected login page redirect, opening login window...');

      const continueUrl = mode === 'aistudio' ? constants.AISTUDIO_URL : constants.GEMINI_URL;
      createAndManageLoginWindow(continueUrl, targetAccountIndex).then(() => {
        // After login completes, reload Gemini
        if (newView && newView.webContents && !newView.webContents.isDestroyed()) {
          newView.webContents.loadURL(continueUrl);
        }
        loginHandledForView = false;
      }).catch(() => {
        loginHandledForView = false;
      });
      return;
    }

    if (viewUrl.startsWith('https://gemini.google.com') || viewUrl.startsWith('https://aistudio.google.com')) {
      captureAccountProfile(newView, targetAccountIndex, options.forceProfileCapture);
      checkAndSendDefaultPrompt(newView, viewUrl, mode);
    }
  };

  newView.webContents.on('did-finish-load', onNavNew);
  newView.webContents.on('did-navigate', onNavNew);
  newView.webContents.on('did-navigate-in-page', onNavNew);

  newView.webContents.loadURL(url);
  newView.__accountPartition = partitionName;
  targetWin.__accountPartition = partitionName;
  targetWin.setBrowserView(newView);

  const contentBounds = targetWin.getContentBounds();
  newView.setBounds({ x: 0, y: 30, width: contentBounds.width, height: contentBounds.height - 30 });
  newView.setAutoResize({ width: true, height: true });
}

/**
 * Set canvas mode for a target window
 */
async function setCanvasMode(isCanvas, targetWin) {
  if (!settings.enableCanvasResizing || !targetWin || targetWin.isDestroyed() || isCanvas === targetWin.isCanvasActive) return;

  const activeView = targetWin.getBrowserView();
  targetWin.isCanvasActive = isCanvas;
  const currentBounds = targetWin.getBounds();
  if (targetWin.isMinimized()) targetWin.restore();

  let scrollY = targetWin.savedScrollPosition || 0;
  if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
    try {
      scrollY = await activeView.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`);
      targetWin.savedScrollPosition = scrollY;
    } catch (e) { }
  }

  if (isCanvas) {
    if (!activeView) {
      targetWin.isCanvasActive = false;
      return;
    }
    targetWin.prevBounds = { ...currentBounds };
    const display = screen.getDisplayMatching(currentBounds);
    const workArea = display.workArea;
    const targetWidth = Math.min(constants.canvasSize.width, workArea.width - constants.margin * 2);
    const targetHeight = Math.min(constants.canvasSize.height, workArea.height - constants.margin * 2);
    const newX = Math.max(workArea.x + constants.margin, Math.min(currentBounds.x, workArea.x + workArea.width - targetWidth - constants.margin));
    const newY = Math.max(workArea.y + constants.margin, Math.min(currentBounds.y, workArea.y + workArea.height - targetHeight - constants.margin));

    animateResize({ x: newX, y: newY, width: targetWidth, height: targetHeight }, targetWin, activeView);
  } else {
    if (targetWin.prevBounds) {
      animateResize(targetWin.prevBounds, targetWin, activeView);
      targetWin.prevBounds = null;
    } else {
      const newBounds = { ...constants.originalSize, x: currentBounds.x, y: currentBounds.y };
      animateResize(newBounds, targetWin, activeView);
      setTimeout(() => { if (targetWin && !targetWin.isDestroyed()) targetWin.center(); }, 210);
    }
  }

  if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
    const restoreScroll = () => {
      if (activeView && !activeView.webContents.isDestroyed()) {
        activeView.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop = ${scrollY};`).catch(() => { });
      }
    };
    setTimeout(restoreScroll, 100);
    setTimeout(restoreScroll, 300);
    setTimeout(restoreScroll, 500);
  }
}

/**
 * Animate resizing of a window and its view
 */
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
      if (activeView && !activeView.webContents.isDestroyed()) {
        activeView.setBounds({ x: 0, y: 30, width: b.width, height: b.height - 30 });
        if (i >= steps) {
          try { activeView.webContents.invalidate(); } catch (e) { }
        }
      }
      if (i < steps) setTimeout(step, interval);
    }
  }
  step();
}

module.exports = {
  initialize,
  loadGemini,
  setCanvasMode,
  animateResize,
  checkAndSendDefaultPrompt,
  captureAccountProfile,
  createAndManageLoginWindow,
  getAvatarStorageDir,
  downloadAccountAvatar,
  getDetachedView: (win) => detachedViews.get(win),
  setDetachedView: (win, view) => detachedViews.set(win, view),
  deleteDetachedView: (win) => detachedViews.delete(win)
};
