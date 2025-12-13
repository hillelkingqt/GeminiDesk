// System Tray Icon Module

const { Tray, Menu, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let trayIcon = null; // Keep icon reference to prevent garbage collection
let createWindow = null;
let updateTrayContextMenu = null;
let forceOnTop = null;

function initialize(deps) {
    createWindow = deps.createWindow;
    forceOnTop = deps.forceOnTop;
    if (deps.updateTrayContextMenu) {
        updateTrayContextMenu = deps.updateTrayContextMenu;
    }
}

function createTrayIcon() {
    if (tray) {
        return tray;
    }

    const iconPath = path.join(__dirname, '..', 'icons', 'icon.ico');
    // Create and cache the icon to prevent garbage collection
    trayIcon = nativeImage.createFromPath(iconPath);
    tray = new Tray(trayIcon);

    tray.setToolTip('GeminiDesk');

    // Handle click event (left-click on Linux, click on Windows/macOS)
    tray.on('click', () => {
        const allWindows = BrowserWindow.getAllWindows();
        const userWindows = allWindows.filter(w => !w.__internal);

        if (userWindows.length === 0) {
            createWindow();
            return;
        }

        const shouldShow = userWindows.some(win => !win.isVisible());

        userWindows.forEach(win => {
            if (shouldShow) {
                if (win.isMinimized()) win.restore();
                win.show();
                win.focus();
            } else {
                win.hide();
            }
        });

        if (shouldShow && userWindows[0] && forceOnTop) {
            forceOnTop(userWindows[0]);
        }
    });

    // Handle right-click (context menu) on all platforms
    // This is especially important for Linux where right-click is the primary way to access menus
    tray.on('right-click', () => {
        if (updateTrayContextMenu) {
            updateTrayContextMenu();
        }
        // The context menu will be shown by updateTrayContextMenu via setContextMenu
    });

    // Set initial context menu
    if (updateTrayContextMenu) {
        updateTrayContextMenu();
    }
    
    return tray;
}

function getTray() {
    return tray;
}

function setUpdateTrayCallback(callback) {
    updateTrayContextMenu = callback;
}

module.exports = {
    initialize,
    createTray: createTrayIcon,
    getTray,
    setUpdateTrayCallback
};
