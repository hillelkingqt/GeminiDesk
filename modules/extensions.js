// Extension Management Module

const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Path to unpacked extension root (must point to folder that contains manifest.json)
// In production (packaged app), use process.resourcesPath which points to resources/
// In dev, use __dirname which is the project root
const EXT_PATH = app.isPackaged 
    ? path.join(process.resourcesPath, '0.5.8_0')
    : path.join(path.dirname(__dirname), '0.5.8_0');

// Track loaded extension IDs per label so we can attempt removal later
const loadedExtensions = new Map(); // label -> extensionId

let constants = null;
let accountsModule = null;
let getSettings = null;

function initialize(deps) {
    constants = deps.constants;
    accountsModule = deps.accountsModule;
    getSettings = deps.getSettings;
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
        if (typeof constants !== 'undefined' && constants && constants.SESSION_PARTITION) {
            const mainPart = session.fromPartition(constants.SESSION_PARTITION, { cache: true });
            await loadExtensionToSession(mainPart, constants.SESSION_PARTITION);
        }

        // per-account partitions
        const s = getSettings();
        if (s && Array.isArray(s.accounts) && s.accounts.length > 0) {
            for (let i = 0; i < s.accounts.length; i++) {
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
                } else if (label === constants.SESSION_PARTITION) {
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
    getExtPath: () => EXT_PATH
};
