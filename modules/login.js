// Account Login Management Module

const { BrowserWindow, session } = require('electron');
const path = require('path');

let accountsModule = null;
let settings = null;
let saveSettings = null;
let createWindow = null;
let setupContextMenu = null;
let STABLE_USER_AGENT = null;
let GEMINI_URL = null;
let AISTUDIO_URL = null;

function initialize(deps) {
    accountsModule = deps.accountsModule;
    settings = deps.settings;
    saveSettings = deps.saveSettings;
    createWindow = deps.createWindow;
    setupContextMenu = deps.setupContextMenu;
    STABLE_USER_AGENT = deps.STABLE_USER_AGENT;
    GEMINI_URL = deps.GEMINI_URL;
    AISTUDIO_URL = deps.AISTUDIO_URL;
}

// Helper: open an isolated login window and transfer cookies into a specific account partition
async function createAndManageLoginWindowForPartition(loginUrl, targetPartition, accountIndex = 0) {
    let tempWin = new BrowserWindow({
        width: 700,
        height: 780,
        frame: true,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(path.dirname(__dirname), 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            javascript: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            userAgent: STABLE_USER_AGENT
        }
    });

    try {
        await tempWin.webContents.session.clearStorageData({ storages: ['cookies', 'localstorage'], origins: ['https://accounts.google.com', 'https://google.com'] });
    } catch (e) {}

    tempWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    setupContextMenu(tempWin.webContents);
    tempWin.loadURL(loginUrl);

    tempWin.on('closed', () => { tempWin = null; });

    tempWin.webContents.on('did-navigate', async (event, navigatedUrl) => {
        const isLoginSuccess = navigatedUrl.startsWith(GEMINI_URL) || navigatedUrl.startsWith(AISTUDIO_URL);
        if (!isLoginSuccess) return;

        const isolatedSession = tempWin.webContents.session;
        let sessionCookieFound = false;
        for (let i = 0; i < 20; i++) {
            const criticalCookies = await isolatedSession.cookies.get({ name: '__Secure-1PSID' });
            if (criticalCookies && criticalCookies.length > 0) { sessionCookieFound = true; break; }
            await new Promise(r => setTimeout(r, 500));
        }

        // If we didn't observe a critical session cookie, it likely means the
        // user hasn't completed the sign-in flow yet (for example they only
        // provided the email and haven't entered the password). In that case
        // don't proceed to transfer cookies and close the temporary login
        // window — leave it open so the user can finish authentication.
        if (!sessionCookieFound) {
            console.log('Partitioned login: no critical session cookie found; keeping login window open to allow user to finish sign-in');
            return;
        }

        try {
            const mainSession = session.fromPartition(targetPartition);
            const googleCookies = await isolatedSession.cookies.get({ domain: '.google.com' });
            if (googleCookies && googleCookies.length > 0) {
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
                        if (!cookie.name.startsWith('__Host-')) newCookie.domain = cookie.domain;
                        await mainSession.cookies.set(newCookie);
                    } catch (e) {
                        console.warn('Could not transfer cookie:', e && e.message ? e.message : e);
                    }
                }
            }

            try { await mainSession.cookies.flushStore(); } catch (e) {}

            // Extract profile image and account label from the loaded page
            try {
                const profileInfo = await tempWin.webContents.executeJavaScript(`(function(){
                    try {
                        const a = document.querySelector('a.gb_B') || document.querySelector('a[aria-label^="Google Account:"]') || document.querySelector('.gb_z a');
                        const img = a && a.querySelector('img') ? (a.querySelector('img').src || null) : (document.querySelector('img.gbii') ? document.querySelector('img.gbii').src : null);
                        const aria = a ? a.getAttribute('aria-label') : (document.querySelector('a[aria-label^="Google Account:"]') ? document.querySelector('a[aria-label^="Google Account:"]') .getAttribute('aria-label') : null);
                        return { img, aria };
                    } catch(e){ return {}; }
                })();`, true);

                if (profileInfo && profileInfo.img) {
                    // Save profile image for the new account
                    await accountsModule.setProfileImageForAccount(accountIndex, profileInfo.img).catch(() => {});
                    // Try to parse email/name from aria text like "Google Account: Name\n(email)"
                    if (profileInfo.aria) {
                        const text = profileInfo.aria.replace(/^Google Account:\s*/i, '').trim();
                        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
                        const email = lines[lines.length - 1] && lines[lines.length - 1].includes('@') ? lines[lines.length - 1] : null;
                        if (email) accountsModule.updateAccount(accountIndex, { email, name: lines[0] || undefined });
                    }
                }
            } catch (e) {
                console.warn('Failed to extract profile info:', e && e.message ? e.message : e);
            }

            if (tempWin && !tempWin.isDestroyed()) tempWin.close();

            try {
                // Set the newly added account as the current account so the
                // choice window highlights it. Persist settings immediately.
                if (typeof settings !== 'undefined') {
                    settings.currentAccountIndex = accountIndex;
                    try { saveSettings(settings); } catch (e) { console.warn('Failed to save settings after adding account', e); }
                }

                // Open the choice window (the small Alt+N style chooser)
                try {
                    const choiceWin = createWindow();
                    if (choiceWin && !choiceWin.isDestroyed()) {
                        try {
                            choiceWin.loadFile('choice.html');
                            const choiceSize = { width: 500, height: 450 };
                            choiceWin.setResizable(false);
                            choiceWin.setSize(choiceSize.width, choiceSize.height);
                            choiceWin.center();
                            choiceWin.setAlwaysOnTop(true, 'screen-saver');
                            choiceWin.focus();
                            choiceWin.show();
                        } catch (e) {
                            console.warn('Failed to prepare choice window UI:', e && e.message ? e.message : e);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to open choice window after account add:', e && e.message ? e.message : e);
                }
            } catch (err) {
                console.warn('Error while finalizing account addition:', err && err.message ? err.message : err);
            }

            // reload existing windows so new account session takes effect
            BrowserWindow.getAllWindows().forEach(win => {
                if (win && !win.isDestroyed()) {
                    const view = win.getBrowserView();
                    if (view && view.webContents && !view.webContents.isDestroyed()) view.webContents.reload();
                }
            });

        } catch (error) {
            console.error('Error during partitioned login handling:', error);
        }
    });
}

module.exports = {
    initialize,
    createAndManageLoginWindowForPartition
};
