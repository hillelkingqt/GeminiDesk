// Utility Functions Module

const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let settings = null;

function initialize(deps) {
    settings = deps.settings;
}

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
    console.error('Reporting error to server (Disabled for security):', error);
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
        const soundPath = path.join(__dirname, '..', 'sounds', settings.aiCompletionSoundFile);
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

function setupContextMenu(webContents) {
    if (!webContents || webContents.isDestroyed()) return;
    const { Menu, clipboard, shell } = require('electron');

    webContents.on('context-menu', (event, params) => {
        const { selectionText, isEditable, linkURL, srcURL, mediaType, misspelledWord, dictionarySuggestions } = params;

        const menuTemplate = [];

        const inspectParams = { x: params.x, y: params.y };

        if (misspelledWord && dictionarySuggestions.length > 0) {
            dictionarySuggestions.slice(0, 5).forEach(suggestion => {
                menuTemplate.push({
                    label: suggestion,
                    click: () => webContents.replaceMisspelling(suggestion)
                });
            });

            menuTemplate.push({ type: 'separator' });

            menuTemplate.push({
                label: 'Add to Dictionary',
                click: () => webContents.session.addWordToSpellCheckerDictionary(misspelledWord)
            });

            menuTemplate.push({ type: 'separator' });
        }

        if (isEditable) {
            menuTemplate.push(
                {
                    label: 'Undo',
                    role: 'undo',
                    accelerator: 'CmdOrCtrl+Z',
                    enabled: params.editFlags.canUndo
                },
                {
                    label: 'Redo',
                    role: 'redo',
                    accelerator: 'CmdOrCtrl+Y',
                    enabled: params.editFlags.canRedo
                },
                { type: 'separator' },
                {
                    label: 'Cut',
                    role: 'cut',
                    accelerator: 'CmdOrCtrl+X',
                    enabled: params.editFlags.canCut
                },
                {
                    label: 'Copy',
                    role: 'copy',
                    accelerator: 'CmdOrCtrl+C',
                    enabled: params.editFlags.canCopy
                },
                {
                    label: 'Paste',
                    role: 'paste',
                    accelerator: 'CmdOrCtrl+V',
                    enabled: params.editFlags.canPaste
                },
                {
                    label: 'Delete',
                    role: 'delete',
                    enabled: params.editFlags.canDelete
                },
                { type: 'separator' },
                {
                    label: 'Select All',
                    role: 'selectAll',
                    accelerator: 'CmdOrCtrl+A',
                    enabled: params.editFlags.canSelectAll
                }
            );
        }
        else if (selectionText) {
            const currentLang = settings.language || 'en';
            const translations = require('../translations.js');
            const copyLabel = (translations[currentLang] && translations[currentLang]['context-copy']) || 'Copy';

            menuTemplate.push(
                {
                    label: copyLabel,
                    role: 'copy',
                    accelerator: 'CmdOrCtrl+C'
                }
            );
        }
        else if (linkURL) {
            menuTemplate.push(
                {
                    label: 'Open Link in Browser',
                    click: () => shell.openExternal(linkURL)
                },
                {
                    label: 'Copy Link Address',
                    click: () => clipboard.writeText(linkURL)
                }
            );
        }
        else if (mediaType === 'image' && srcURL) {
            menuTemplate.push(
                {
                    label: 'Copy Image',
                    click: () => {
                        webContents.copyImageAt(params.x, params.y);
                    }
                },
                {
                    label: 'Copy Image Address',
                    click: () => clipboard.writeText(srcURL)
                },
                {
                    label: 'Open Image in Browser',
                    click: () => shell.openExternal(srcURL)
                }
            );
        }
        else {
            menuTemplate.push(
                {
                    label: 'Back',
                    accelerator: 'Alt+Left',
                    enabled: webContents.canGoBack(),
                    click: () => webContents.goBack()
                },
                {
                    label: 'Forward',
                    accelerator: 'Alt+Right',
                    enabled: webContents.canGoForward(),
                    click: () => webContents.goForward()
                },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => webContents.reload()
                },
                { type: 'separator' },
                {
                    label: 'Select All',
                    role: 'selectAll',
                    accelerator: 'CmdOrCtrl+A'
                }
            );
        }

        const { app } = require('electron');
        if (!app.isPackaged) {
            menuTemplate.push(
                { type: 'separator' },
                {
                    label: 'Inspect Element',
                    click: () => {
                        webContents.inspectElement(inspectParams.x, inspectParams.y);

                        if (webContents.isDevToolsOpened()) {
                            webContents.closeDevTools();
                        }

                        webContents.openDevTools({ mode: 'detach', activate: true });

                        setTimeout(() => {
                            if (webContents.devToolsWebContents) {
                                webContents.devToolsWebContents.executeJavaScript(`
                                    DevToolsAPI.enterInspectElementMode();
                                `).catch(() => { });
                            }
                        }, 500);
                    }
                }
            );
        }

        if (menuTemplate.length > 0) {
            const contextMenu = Menu.buildFromTemplate(menuTemplate);

            contextMenu.popup({
                window: BrowserWindow.fromWebContents(webContents),
                x: params.x,
                y: params.y,
                callback: () => { }
            });
        }
    });
}

module.exports = {
    initialize,
    forceOnTop,
    broadcastToAllWebContents,
    broadcastToWindows,
    reportErrorToServer,
    playAiCompletionSound,
    setupContextMenu
};
