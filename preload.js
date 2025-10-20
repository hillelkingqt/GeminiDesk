// ================================================================
// preload.js - GeminiDesk Preload Script
// ================================================================
// This script runs in the renderer process before web content loads.
// It exposes safe APIs to the renderer via contextBridge and handles
// local shortcuts, UI automation, and IPC communication.
// ================================================================

const { contextBridge, ipcRenderer } = require('electron');

// ================================================================
// Local Shortcut Handling
// ================================================================
let localShortcuts = {};

/**
 * Converts a keyboard event to an Electron Accelerator string.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {string} The accelerator string (e.g., "Control+Alt+S").
 */
function eventToShortcutString(e) {
    const parts = [];

    // Add modifiers in order
    if (e.ctrlKey) parts.push('Control');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    // MetaKey is Command on macOS and Super/Windows key on other platforms
    if (e.metaKey) {
        parts.push(process.platform === 'darwin' ? 'Command' : 'Super');
    }

    // Add the base key, avoiding double-counting modifiers
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        let keyCode = e.code.replace('Key', '').replace('Digit', '');
        if (keyCode.length === 1) keyCode = keyCode.toUpperCase();
        parts.push(keyCode);
    }

    return parts.join('+');
}

// Listen for keydown events at the window level to capture local shortcuts
window.addEventListener('keydown', (e) => {
    // If there are no local shortcuts registered, do nothing
    if (Object.keys(localShortcuts).length === 0) return;

    const shortcutString = eventToShortcutString(e);

    // Check if the pressed combination matches a known local shortcut
    for (const action in localShortcuts) {
        if (localShortcuts[action] === shortcutString) {
            e.preventDefault(); // Prevent the browser from handling the event
            ipcRenderer.send('execute-shortcut', action);
            return;
        }
    }
}, true); // Use capture phase to intercept before other handlers

// Listen for the main process to send the list of local shortcuts
ipcRenderer.on('set-local-shortcuts', (event, shortcuts) => {
    console.log('Received local shortcuts:', shortcuts);
    localShortcuts = shortcuts || {}; // Ensure it's always an object
});

// ================================================================
// Expose APIs to Renderer via Context Bridge
// ================================================================
contextBridge.exposeInMainWorld('electronAPI', {
    // Theme management
    theme: {
        getResolved: () => ipcRenderer.invoke('theme:get-resolved'),
        getSetting: () => ipcRenderer.invoke('theme:get-setting'),
        set: (theme) => ipcRenderer.send('theme:set', theme),
        onUpdate: (callback) => ipcRenderer.on('theme-updated', (_event, theme) => callback(theme)),
    },

    // Find in page functionality
    findInPage: (text, forward) => ipcRenderer.send('find-in-page', text, forward),
    stopFindInPage: (action) => ipcRenderer.send('stop-find-in-page', action),

    // Window controls
    toggleFullScreen: () => ipcRenderer.send('toggle-full-screen'),

    // Onboarding and settings
    completeOnboarding: () => ipcRenderer.send('onboarding-complete'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSetting: (key, value) => ipcRenderer.send('update-setting', key, value),
    openSettingsWindow: () => ipcRenderer.send('open-settings-window'),
    resetSettings: () => ipcRenderer.send('reset-settings'),
    showConfirmReset: () => ipcRenderer.send('show-confirm-reset'),
    confirmReset: () => ipcRenderer.send('confirm-reset-action'),
    cancelReset: () => ipcRenderer.send('cancel-reset-action'),

    // Window management
    openNewWindow: () => ipcRenderer.send('open-new-window'),

    // Export and updates
    exportChat: () => ipcRenderer.send('export-chat'),
    checkForUpdates: () => ipcRenderer.send('check-for-updates'),

    // Notifications
    manualCheckForNotifications: () => ipcRenderer.send('manual-check-for-notifications'),
    onNotificationCheckStatus: (callback) =>
        ipcRenderer.on('notification-check-status', (_event, result) => callback(result)),

    // Login handling
    sendLoginAttempt: (data) => ipcRenderer.send('login-attempt', data),

    // Event listeners
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, ...args) => callback(...args)),
    onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', (event, ...args) => callback(...args)),
    onLanguageChanged: (callback) => ipcRenderer.on('language-changed', (event, ...args) => callback(...args)),

    // Title and state management
    requestCurrentTitle: () => ipcRenderer.invoke('request-current-title'),
    notifyCanvasState: (isCanvasVisible) => ipcRenderer.send('canvas-state-changed', isCanvasVisible),

    // App mode selection
    selectAppMode: (mode) => ipcRenderer.send('select-app-mode', mode),

    // Update window controls
    openDownloadPage: () => ipcRenderer.send('open-download-page'),
    startDownloadUpdate: () => ipcRenderer.send('start-download-update'),
    installUpdateNow: () => ipcRenderer.send('install-update-now'),
    closeDownloadWindow: () => ipcRenderer.send('close-download-window'),
    closeUpdateWindow: () => ipcRenderer.send('close-update-window')
});

// ================================================================
// Chat Title API
// ================================================================
contextBridge.exposeInMainWorld('chatAPI', {
    onTitleUpdate: (callback) => ipcRenderer.on('update-title', (event, ...args) => callback(...args)),
});

// ================================================================
// Update Info API
// ================================================================
contextBridge.exposeInMainWorld('updateAPI', {
    onUpdateInfo: (callback) => ipcRenderer.on('update-info', (_event, value) => callback(value)),
});

// ================================================================
// Notification Window API
// ================================================================
contextBridge.exposeInMainWorld('notificationAPI', {
    closeWindow: () => ipcRenderer.send('close-notification-window'),
    requestLastNotification: () => ipcRenderer.send('request-last-notification'),
    onReceiveNotification: (callback) => ipcRenderer.on('notification-data', (event, ...args) => callback(...args)),
});

// ================================================================
// Personal Message Window API
// ================================================================
contextBridge.exposeInMainWorld('personalMessageAPI', {
    closeWindow: () => ipcRenderer.send('close-personal-message-window'),
    onReceiveMessage: (callback) => ipcRenderer.on('personal-message-data', (_event, data) => callback(data)),
});

// ================================================================
// Chat Title Auto-Update
// ================================================================
// Periodically checks the page for the current chat title and sends it to the main process.
let lastTitle = '';
setInterval(() => {
    let titleElement = null;
    let currentTitle = '';
    const hostname = window.location.hostname;

    if (hostname.includes('aistudio.google.com')) {
        // AI Studio uses a different selector
        titleElement = document.querySelector('li.active a.prompt-link');
        if (titleElement) {
            currentTitle = titleElement.textContent.trim();
        } else {
            // Fallback to document.title, removing the " | Google AI Studio" suffix
            currentTitle = (document.title || 'AI Studio').replace(/\s*\|\s*Google AI Studio$/i, '').trim();
        }
    } else {
        // Standard Gemini selector
        titleElement = document.querySelector('.conversation.selected .conversation-title');
        currentTitle = titleElement ? titleElement.textContent.trim() : 'New Chat';
    }

    // Only send the title if it has changed
    if (currentTitle && currentTitle !== lastTitle) {
        lastTitle = currentTitle;
        ipcRenderer.send('update-title', currentTitle);
    }
}, 1000); // Check every second

// ================================================================
// Canvas Panel Detection and Notification
// ================================================================
// Detects when the immersive-panel (Canvas) appears or disappears and notifies the main process.
let isImmersivePanelCurrentlyVisible = false;

function checkForPanelAndNotify() {
    const panelExists = document.querySelector('immersive-panel') !== null;
    if (panelExists !== isImmersivePanelCurrentlyVisible) {
        console.log(`Canvas panel state changed. Now visible: ${panelExists}`);
        isImmersivePanelCurrentlyVisible = panelExists;
        ipcRenderer.send('canvas-state-changed', isImmersivePanelCurrentlyVisible);
    }
}

// Set up MutationObserver to watch for DOM changes
const observer = new MutationObserver(() => {
    checkForPanelAndNotify();
});

// Start observing after the page loads
window.addEventListener('load', () => {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    // Perform an initial check immediately after page load
    checkForPanelAndNotify();
});

// ================================================================
// Find in Page Functionality
// ================================================================
let findBar = null;
let findInput = null;

// Listen for search results from the main process
ipcRenderer.on('find-in-page-result', (event, result) => {
    if (!findBar || !findInput) return;

    const countSpan = findBar.querySelector('.find-count');

    // If no matches, shake the bar and display "Not Found"
    if (result.matches === 0 && findInput.value !== "") {
        countSpan.textContent = 'Not Found';
        findBar.classList.add('shake');
        setTimeout(() => findBar.classList.remove('shake'), 400);
    }
    // If matches exist, display the counter
    else if (result.matches > 0) {
        countSpan.textContent = `${result.activeMatchOrdinal} / ${result.matches}`;
    }
    // If the search box is empty, clear the counter
    else {
        countSpan.textContent = '';
    }

    // Return focus to the search input after each search for a smooth UX
    setTimeout(() => findInput.focus(), 0);
});

/**
 * Gets the resolved theme (light or dark) based on the body class.
 * @returns {string} 'dark' or 'light'
 */
function getResolvedTheme() {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Creates and displays the find bar UI.
 */
function createFindBar() {
    if (findBar) {
        findInput.focus();
        return;
    }
    const isDark = getResolvedTheme() === 'dark';

    // Helper function to create SVG icons
    const svgIcon = (path) => {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "20");
        svg.setAttribute("height", "20");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "currentColor");
        svg.style.pointerEvents = "none";
        const pathElement = document.createElementNS(svgNS, "path");
        pathElement.setAttribute("d", path);
        svg.appendChild(pathElement);
        return svg;
    };

    // Icon paths for previous, next, and close buttons
    const prevIconPath = "M15.7 16.3l-4.6-4.6 4.6-4.6L14.3 5.7 8.3 11.7l6 6 1.4-1.4z";
    const nextIconPath = "M9.7 16.3l4.6-4.6-4.6-4.6L11.1 5.7l6 6-6 6-1.4-1.4z";
    const closeIconPath = "M18.3 5.71L12 12.01 5.7 5.71 4.29 7.12 10.59 13.42 4.29 19.72 5.7 21.13 12 14.83l6.3 6.3 1.41-1.41L13.41 13.42l6.3-6.3-1.41-1.41z";

    // Add animations and styles via CSS
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes findBarFadeIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 50%, 90% { transform: translateX(-3px); }
            30%, 70% { transform: translateX(3px); }
        }
        .find-bar-wrapper {
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .find-bar-wrapper:focus-within {
            box-shadow: 0 0 0 2px ${isDark ? 'rgba(138, 180, 248, 0.5)' : 'rgba(26, 115, 232, 0.4)'}, 0 8px 32px rgba(0,0,0,0.3);
            border-color: ${isDark ? 'rgba(138, 180, 248, 0.7)' : '#1a73e8'};
        }
        .find-bar-wrapper.shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
    `;
    document.head.appendChild(styleSheet);

    // Build the find bar UI
    findBar = document.createElement('div');
    findBar.className = 'find-bar-wrapper';
    findBar.style.cssText = `
        position: fixed; top: 12px; right: 16px; z-index: 10001;
        background: ${isDark ? 'radial-gradient(circle, rgba(45,48,53,0.9) 0%, rgba(33,36,41,0.85) 100%)' : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.85) 100%)'};
        backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'};
        border-radius: 50px; padding: 5px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 4px;
        font-family: 'Google Sans', 'Roboto', sans-serif;
        color: ${isDark ? '#e8eaed' : '#3c4043'};
        animation: findBarFadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    `;

    findInput = document.createElement('input');
    findInput.placeholder = 'Search...';
    findInput.title = 'Press Enter to find (Shift+Enter for previous)';
    findInput.style.cssText = `
        border: none; background: transparent; color: inherit; 
        padding: 4px 12px; outline: none; width: 140px; font-size: 14px;
    `;

    const countSpan = document.createElement('span');
    countSpan.className = 'find-count';
    countSpan.style.cssText = `
        min-width: 70px; text-align: center; font-size: 13px;
        padding: 0 6px; color: ${isDark ? '#9aa0a6' : '#5f6368'};
        border-left: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    `;

    // Helper function to create styled buttons
    const createButton = (iconPath, title) => {
        const button = document.createElement('button');
        button.title = title;
        button.appendChild(svgIcon(iconPath));
        button.style.cssText = `
            background-color: transparent; border: none; color: ${isDark ? '#bdc1c6' : '#5f6368'};
            cursor: pointer; width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            transition: background-color 0.2s, color 0.2s;
        `;
        button.onmouseenter = () => {
            button.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
        };
        button.onmouseleave = () => {
            button.style.backgroundColor = 'transparent';
        };
        return button;
    };

    const prevButton = createButton(prevIconPath, 'Previous (Shift+Enter)');
    const nextButton = createButton(nextIconPath, 'Next (Enter)');
    const closeButton = createButton(closeIconPath, 'Close (Esc)');

    findBar.append(findInput, countSpan, prevButton, nextButton, closeButton);
    document.body.appendChild(findBar);

    // Event handlers for the find bar
    findInput.addEventListener('input', (e) => {
        if (e.target.value === '') {
            ipcRenderer.send('stop-find-in-page', 'clearSelection');
            countSpan.textContent = '';
        }
    });

    findInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (findInput.value) {
                ipcRenderer.send('start-find-in-page', findInput.value, !e.shiftKey);
            }
        } else if (e.key === 'Escape') {
            closeButton.click();
        }
    });

    nextButton.addEventListener('click', () => {
        if (findInput.value) ipcRenderer.send('start-find-in-page', findInput.value, true);
    });

    prevButton.addEventListener('click', () => {
        if (findInput.value) ipcRenderer.send('start-find-in-page', findInput.value, false);
    });

    closeButton.addEventListener('click', () => {
        if (findBar) {
            findBar.remove();
            styleSheet.remove();
            findBar = null;
            findInput = null;
            ipcRenderer.send('stop-find-in-page', 'clearSelection');
        }
    });

    findInput.focus();
}

// Listen for the show-find-bar event from the main process
ipcRenderer.on('show-find-bar', () => {
    createFindBar();
});

// ================================================================
// UI Automation: Hide Disclaimer & Fix Layout
// ================================================================
/**
 * Hides the hallucination disclaimer and adjusts the input area margin.
 */
const applyLayoutFix = () => {
    try {
        const disclaimerContainer = document.querySelector('hallucination-disclaimer');
        const inputAreaContainer = document.querySelector('.input-area-container');

        // Completely remove the disclaimer from the layout
        if (disclaimerContainer && disclaimerContainer.style.display !== 'none') {
            console.log('GeminiDesk: Disclaimer found. Removing it completely.');
            disclaimerContainer.style.display = 'none';
        }

        // Add a small bottom margin to the input area for better aesthetics
        if (inputAreaContainer && inputAreaContainer.style.marginBottom !== '14px') {
            console.log('GeminiDesk: Lifting the input area for better aesthetics.');
            inputAreaContainer.style.marginBottom = '14px';
        }

    } catch (error) {
        console.error('GeminiDesk: Error applying layout fix:', error);
    }
};

// Set up a MutationObserver to watch for dynamic content changes
const observerConfig = {
    childList: true,
    subtree: true
};

const domObserver = new MutationObserver(() => {
    applyLayoutFix();
});

// Start observing after the page loads
window.addEventListener('load', () => {
    applyLayoutFix(); // Run once on load
    domObserver.observe(document.body, observerConfig); // Then watch for changes
});