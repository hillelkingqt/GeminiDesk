// Profile and Avatar Management Module

const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const fetch = require('node-fetch');

const PROFILE_CAPTURE_COOLDOWN_MS = 60 * 1000;
const PROFILE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

const profileCaptureTimestamps = new Map();
let avatarDirectoryPath = null;

let settings = null;
let updateAccountMetadata = null;
let broadcastToAllWebContents = null;

function initialize(deps) {
    settings = deps.settings;
    updateAccountMetadata = deps.updateAccountMetadata;
    broadcastToAllWebContents = deps.broadcastToAllWebContents;
}

function getAvatarStorageDir() {
    if (avatarDirectoryPath) {
        return avatarDirectoryPath;
    }
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

async function downloadAccountAvatar(sourceUrl, accountIndex) {
    if (!sourceUrl) return '';
    try {
        const response = await fetch(sourceUrl);
        if (!response || !response.ok) {
            throw new Error(`HTTP ${response ? response.status : 'unknown'}`);
        }
        const buffer = await response.buffer();
        const dir = getAvatarStorageDir();
        const avatarPath = path.join(dir, `account-${accountIndex}.png`);
        await fsp.writeFile(avatarPath, buffer);
        return avatarPath;
    } catch (error) {
        console.warn('Failed to download account avatar:', error && error.message ? error.message : error);
        return '';
    }
}

function shouldAttemptProfileCapture(accountIndex, forceAttempt = false) {
    if (typeof accountIndex !== 'number' || accountIndex < 0) {
        return false;
    }
    if (forceAttempt) {
        return true;
    }
    const now = Date.now();
    const last = profileCaptureTimestamps.get(accountIndex) || 0;
    if (now - last < PROFILE_CAPTURE_COOLDOWN_MS) {
        return false;
    }
    profileCaptureTimestamps.set(accountIndex, now);
    return true;
}

async function captureAccountProfile(view, accountIndex, forceAttempt = false) {
    if (!view || !view.webContents || view.webContents.isDestroyed()) {
        return;
    }
    if (!shouldAttemptProfileCapture(accountIndex, forceAttempt)) {
        return;
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

        if (!profile) {
            return;
        }

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
            if (downloaded) {
                avatarFile = downloaded;
            }
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

        if (profile.displayName && (
            !existingAccount ||
            !existingAccount.name ||
            existingAccount.name.startsWith('Account ')
        )) {
            updates.name = profile.displayName;
        }

        if (Object.keys(updates).length > 0) {
            const updatedAccount = updateAccountMetadata(accountIndex, updates);
            if (updatedAccount) {
                broadcastToAllWebContents('settings-updated', settings);
            }
        }
    } catch (error) {
        console.warn('Failed to capture account profile:', error && error.message ? error.message : error);
    }
}

function maybeCaptureAccountProfile(view, accountIndex, forceAttempt = false) {
    if (typeof accountIndex !== 'number' || accountIndex < 0) {
        return;
    }
    captureAccountProfile(view, accountIndex, forceAttempt);
}

module.exports = {
    initialize,
    getAvatarStorageDir,
    downloadAccountAvatar,
    captureAccountProfile,
    maybeCaptureAccountProfile,
    PROFILE_CAPTURE_COOLDOWN_MS,
    PROFILE_REFRESH_INTERVAL_MS
};
