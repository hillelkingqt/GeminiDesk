// Canvas Resize Module

const { screen, BrowserWindow } = require('electron');

const margin = 20;
const originalSize = { width: 500, height: 650 };
const canvasSize = { width: 1400, height: 800 };

let settings = null;

function initialize(deps) {
    settings = deps.settings;
}

async function setCanvasMode(isCanvas, targetWin) {
    if (!settings.enableCanvasResizing) {
        return;
    }
    if (!targetWin || targetWin.isDestroyed() || isCanvas === targetWin.isCanvasActive) {
        return;
    }

    const activeView = targetWin.getBrowserView();
    targetWin.isCanvasActive = isCanvas;
    const currentBounds = targetWin.getBounds();
    if (targetWin.isMinimized()) targetWin.restore();

    // Save current scroll position
    let scrollY = targetWin.savedScrollPosition || 0;
    if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
        try {
            scrollY = await activeView.webContents.executeJavaScript(`(document.scrollingElement || document.documentElement).scrollTop`);
            targetWin.savedScrollPosition = scrollY;
        } catch (e) {
            console.error('Could not read scroll position:', e);
        }
    }

    if (isCanvas) {
        if (!activeView) {
            console.warn("Canvas mode requested, but no active view found. Aborting.");
            targetWin.isCanvasActive = false;
            return;
        }

        targetWin.prevBounds = { ...currentBounds };
        const display = screen.getDisplayMatching(currentBounds);
        const workArea = display.workArea;
        const targetWidth = Math.min(canvasSize.width, workArea.width - margin * 2);
        const targetHeight = Math.min(canvasSize.height, workArea.height - margin * 2);
        const newX = Math.max(workArea.x + margin, Math.min(currentBounds.x, workArea.x + workArea.width - targetWidth - margin));
        const newY = Math.max(workArea.y + margin, Math.min(currentBounds.y, workArea.y + workArea.height - targetHeight - margin));

        animateResize({ x: newX, y: newY, width: targetWidth, height: targetHeight }, targetWin, activeView);
    } else {
        if (targetWin.prevBounds) {
            animateResize(targetWin.prevBounds, targetWin, activeView);
            targetWin.prevBounds = null;
        } else {
            const newBounds = { ...originalSize, x: currentBounds.x, y: currentBounds.y };
            animateResize(newBounds, targetWin, activeView);
            setTimeout(() => { if (targetWin && !targetWin.isDestroyed()) targetWin.center(); }, 210);
        }
    }

    // Restore scroll position after animation completes
    if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
        // Try multiple times to ensure scroll position is restored
        const restoreScroll = () => {
            if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
                activeView.webContents.executeJavaScript(
                    `(document.scrollingElement || document.documentElement).scrollTop = ${scrollY};`
                ).catch(console.error);
            }
        };

        setTimeout(restoreScroll, 100);
        setTimeout(restoreScroll, 300);
        setTimeout(restoreScroll, 500);
    }
}

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
            if (activeView && activeView.webContents && !activeView.webContents.isDestroyed()) {
                activeView.setBounds({ x: 0, y: 30, width: b.width, height: b.height - 30 });
                // Force repaint on final step to ensure proper rendering
                if (i >= steps) {
                    try {
                        activeView.webContents.invalidate();
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }
            if (i < steps) setTimeout(step, interval);
        }
    }
    step();
}

module.exports = {
    initialize,
    setCanvasMode
};
