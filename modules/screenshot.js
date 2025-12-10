// Screenshot Manager Module

const { BrowserWindow, clipboard, screen } = require('electron');
const { spawn } = require('child_process');
const { applyAlwaysOnTopSetting } = require('./utils'); // We might need to move applyAlwaysOnTopSetting to utils or keep it here?
// Actually applyAlwaysOnTopSetting is in main.js. I should move it to utils or re-implement.
// It relies on `settings`.

let settings = null;
let forceOnTop = null; // From utils

function initialize(deps) {
    settings = deps.settings;
    forceOnTop = deps.forceOnTop;
}

// Re-implement applyAlwaysOnTopSetting locally or import it.
// It's platform specific.
function applyAlwaysOnTop(win, shouldBeOnTop) {
    if (!win || win.isDestroyed()) return;
    try {
        if (process.platform === 'darwin') {
            if (shouldBeOnTop) {
                win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
                win.setAlwaysOnTop(true, 'screen-saver');
            } else {
                win.setVisibleOnAllWorkspaces(false);
                win.setAlwaysOnTop(false);
            }
        } else {
            win.setAlwaysOnTop(shouldBeOnTop);
        }
    } catch (e) {
        console.warn('Failed to apply alwaysOnTop setting:', e && e.message ? e.message : e);
    }
}

async function proceedWithFullScreenScreenshot(targetWin) {
    const screenshotTargetWindow = targetWin;
    try {
        const { desktopCapturer } = require('electron');

        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.size;
        const scaleFactor = primaryDisplay.scaleFactor;

        const wasVisible = screenshotTargetWindow.isVisible();
        if (wasVisible) {
            screenshotTargetWindow.hide();
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: {
                width: Math.round(width * scaleFactor),
                height: Math.round(height * scaleFactor)
            }
        });

        if (sources.length > 0) {
            const primarySource = sources[0];
            const thumbnail = primarySource.thumbnail;

            clipboard.writeImage(thumbnail);
            console.log('Full screen screenshot captured and copied to clipboard!');

            const verifyImage = clipboard.readImage();
            if (verifyImage.isEmpty()) {
                console.error('Failed to copy image to clipboard!');
            }

            if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
                screenshotTargetWindow.show();
                screenshotTargetWindow.setAlwaysOnTop(true);
                screenshotTargetWindow.focus();

                const viewInstance = screenshotTargetWindow.getBrowserView();
                if (viewInstance && viewInstance.webContents) {
                    let pasteAttempts = 0;
                    const maxPasteAttempts = 3;

                    const attemptPaste = () => {
                        pasteAttempts++;
                        console.log(`Full screen paste attempt ${pasteAttempts}/${maxPasteAttempts}`);

                        try {
                            viewInstance.webContents.focus();

                            setTimeout(() => {
                                viewInstance.webContents.paste();
                                console.log('Full screen screenshot paste() called');

                                setTimeout(() => {
                                    const imgCheck = clipboard.readImage();
                                    if (!imgCheck.isEmpty()) {
                                        viewInstance.webContents.paste();
                                        console.log('Full screen second paste() attempt');
                                    }
                                }, 100);
                            }, 150);

                            if (pasteAttempts < maxPasteAttempts) {
                                setTimeout(attemptPaste, 400);
                            } else {
                                setTimeout(() => {
                                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                                        applyAlwaysOnTop(screenshotTargetWindow, settings.alwaysOnTop);
                                    }
                                }, 800);
                            }
                        } catch (err) {
                            console.error('Full screen paste attempt failed:', err);
                        }
                    };

                    attemptPaste();
                }
            }
        } else {
            console.error('No screen sources found for full screen capture');
            if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
                screenshotTargetWindow.show();
            }
        }
    } catch (err) {
        console.error('Full screen screenshot failed:', err);
        if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
            if (screenshotTargetWindow.isMinimized()) screenshotTargetWindow.restore();
            screenshotTargetWindow.show();
        }
    }
}

function proceedWithScreenshot(targetWin) {
    const screenshotTargetWindow = targetWin;
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
    let imageFoundOnce = false;

    snippingTool.on('exit', () => {
        processExited = true;
        console.log('Screenshot tool exited');
    });

    snippingTool.on('error', (err) => {
        console.error('Failed to start snipping tool:', err);
    });

    let checkAttempts = 0;
    const maxAttempts = 100;
    const fastCheckDuration = 20;

    const intervalId = setInterval(() => {
        checkAttempts++;

        try {
            const image = clipboard.readImage();
            const hasImage = !image.isEmpty();

            if (checkAttempts % 10 === 0) {
                console.log(`Screenshot check attempt ${checkAttempts}/${maxAttempts}, processExited: ${processExited}, hasImage: ${hasImage}`);
            }

            if (hasImage) {
                if (!imageFoundOnce) {
                    console.log('Image found in clipboard!');
                    imageFoundOnce = true;
                }

                if (checkAttempts > 4 || processExited) {
                    clearInterval(intervalId);

                    if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                        console.log('Preparing to paste screenshot...');

                        if (screenshotTargetWindow.isMinimized()) {
                            screenshotTargetWindow.restore();
                        }
                        if (!screenshotTargetWindow.isVisible()) {
                            screenshotTargetWindow.show();
                        }

                        screenshotTargetWindow.setAlwaysOnTop(true);
                        screenshotTargetWindow.focus();

                        const viewInstance = screenshotTargetWindow.getBrowserView();
                        if (viewInstance && viewInstance.webContents) {
                            const performPaste = () => {
                                console.log('Performing screenshot paste...');
                                try {
                                    if (!screenshotTargetWindow || screenshotTargetWindow.isDestroyed()) {
                                        return;
                                    }

                                    if (screenshotTargetWindow.isMinimized()) {
                                        screenshotTargetWindow.restore();
                                    }
                                    if (!screenshotTargetWindow.isVisible()) {
                                        screenshotTargetWindow.show();
                                    }

                                    screenshotTargetWindow.setAlwaysOnTop(true);
                                    screenshotTargetWindow.focus();
                                    screenshotTargetWindow.moveTop();
                                    viewInstance.webContents.focus();

                                    viewInstance.webContents.executeJavaScript(`
                                        (function() {
                                            try {
                                                const textArea = document.querySelector('rich-textarea[aria-label*="prompt"], rich-textarea, textarea[aria-label*="prompt"], textarea[placeholder*="Gemini"], .ql-editor, [contenteditable="true"]');
                                                if (textArea) {
                                                    textArea.focus();
                                                    console.log('Text input focused for screenshot paste');
                                                    return true;
                                                }
                                            } catch(e) {
                                                console.error('Failed to focus text input:', e);
                                            }
                                            return false;
                                        })();
                                    `).catch(err => console.error('Failed to execute focus script:', err));

                                    setTimeout(() => {
                                        if (!viewInstance.webContents.isDestroyed()) {
                                            viewInstance.webContents.paste();
                                            console.log('Screenshot paste() executed');
                                        }

                                        setTimeout(() => {
                                            if (screenshotTargetWindow && !screenshotTargetWindow.isDestroyed()) {
                                                applyAlwaysOnTop(screenshotTargetWindow, settings.alwaysOnTop);
                                            }
                                        }, 1000);
                                    }, 400);
                                } catch (err) {
                                    console.error('Paste failed:', err);
                                }
                            };

                            setTimeout(performPaste, 500);
                        }
                    }
                }
            } else if (checkAttempts > maxAttempts) {
                clearInterval(intervalId);
                console.log('Screenshot timeout - no image found after max attempts');
            }
        } catch (err) {
            console.error('Error checking clipboard:', err);
        }
    }, checkAttempts < fastCheckDuration ? 250 : 500);
}

module.exports = {
    initialize,
    proceedWithFullScreenScreenshot,
    proceedWithScreenshot
};
