// Extensions Management Module

const { session, BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');

let settings = null;
let constants = null;
let accountsModule = null;

// Track loaded extension IDs per label so we can attempt removal later
const loadedExtensions = new Map(); // label -> extensionId

// Path to unpacked extension root (must point to folder that contains manifest.json)
// In production (packaged app), use process.resourcesPath which points to resources/
// In dev, use __dirname which is the project root (relative to modules/ folder it's ..)
// Note: __dirname in this module is .../modules, so we need to go up one level or use app.getAppPath()
const EXT_PATH = app.isPackaged
    ? path.join(process.resourcesPath, '0.5.8_0')
    : path.join(__dirname, '..', '0.5.8_0');

function initialize(deps) {
    settings = deps.settings;
    constants = deps.constants;
    accountsModule = deps.accountsModule;
}

async function loadExtensionToSession(sess, label) {
    try {
        if (!sess || typeof sess.loadExtension !== 'function') return null;
        if (!fs.existsSync(EXT_PATH)) return null;
        const ext = await sess.loadExtension(EXT_PATH, { allowFileAccess: true });
        const id = ext && ext.id ? ext.id : (ext && ext.name ? ext.name : null);
        if (id) loadedExtensions.set(label, id);
        console.log(`Loaded extension into session (${label}) ->`, id || ext && ext.name || ext);
        return id;
    } catch (err) {
        console.warn(`Failed to load extension into session (${label}):`, err && err.message ? err.message : err);
        return null;
    }
}

async function loadExtensionToAllSessions() {
    try {
        if (!fs.existsSync(EXT_PATH)) return;

        // default
        await loadExtensionToSession(session.defaultSession, 'default');

        // main app partition
        if (constants && constants.SESSION_PARTITION) {
            const mainPart = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
            await loadExtensionToSession(mainPart, constants.SESSION_PARTITION);
        }

        // per-account partitions
        if (settings && Array.isArray(settings.accounts) && settings.accounts.length > 0) {
            for (let i = 0; i < settings.accounts.length; i++) {
                try {
                    const partName = accountsModule.getAccountPartition(i);
                    const accSess = session.fromPartition(partName, { cache: true });
                    await loadExtensionToSession(accSess, partName);
                } catch (e) {
                    console.warn('Error loading extension into account partition', e && e.message ? e.message : e);
                }
            }
        }

        // sessions attached to existing BrowserViews
        const allWindows = BrowserWindow.getAllWindows();
        allWindows.forEach(win => {
            try {
                const view = win.getBrowserView();
                if (view && view.webContents && view.webContents.session) {
                    const label = `view:${win.id}`;
                    loadExtensionToSession(view.webContents.session, label).catch(() => {});
                }
            } catch (e) {
                // ignore
            }
        });
    } catch (e) {
        console.warn('Error while loading extension into all sessions:', e && e.message ? e.message : e);
    }
}

async function unloadLoadedExtensions() {
    try {
        for (const [label, extId] of Array.from(loadedExtensions.entries())) {
            try {
                // choose session to call removeExtension on
                if (label === 'default') {
                    if (typeof session.defaultSession.removeExtension === 'function') {
                        session.defaultSession.removeExtension(extId);
                        console.log('Removed extension', extId, 'from default session');
                    }
                } else if (constants && label === constants.SESSION_PARTITION) {
                    const part = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
                    if (part && typeof part.removeExtension === 'function') {
                        part.removeExtension(extId);
                        console.log('Removed extension', extId, 'from partition', constants.SESSION_PARTITION);
                    }
                } else if (label.startsWith('persist:') || label.startsWith('view:')) {
                    // attempt to remove from partition named label
                    try {
                        const part = session.fromPartition(label, { cache: true });
                        if (part && typeof part.removeExtension === 'function') {
                            part.removeExtension(extId);
                            console.log('Removed extension', extId, 'from partition', label);
                        }
                    } catch (e) {
                        // fallback: try defaultSession removal
                        if (typeof session.defaultSession.removeExtension === 'function') {
                            try { session.defaultSession.removeExtension(extId); } catch (ee) {}
                        }
                    }
                } else if (label.startsWith('view:')) {
                    // handled above
                }
                loadedExtensions.delete(label);
            } catch (e) {
                console.warn('Failed to remove extension', extId, 'for', label, e && e.message ? e.message : e);
            }
        }
    } catch (e) {
        console.warn('Error unloading extensions:', e && e.message ? e.message : e);
    }
}

module.exports = {
    initialize,
    loadExtensionToSession,
    loadExtensionToAllSessions,
    unloadLoadedExtensions,
    EXT_PATH
};
