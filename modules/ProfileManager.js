const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { app, BrowserWindow } = require('electron');

class ProfileManager {
    constructor(dependencies) {
        this.deps = dependencies;
        this.profileCaptureTimestamps = new Map();
        this.avatarDirectoryPath = null;
        this.PROFILE_CAPTURE_COOLDOWN_MS = 60 * 1000;
        this.PROFILE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
    }

    getAvatarStorageDir() {
        if (this.avatarDirectoryPath) {
            return this.avatarDirectoryPath;
        }

        // userData might not be available if app not ready, but usually this is called late enough
        // allowing injection of userData path for testing
        const userDataPath = this.deps.userDataPath || app.getPath('userData');
        const dir = path.join(userDataPath, 'account-avatars');

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (err) {
                console.warn('Failed to create avatar storage directory:', err && err.message ? err.message : err);
            }
        }
        this.avatarDirectoryPath = dir;
        return dir;
    }

    async downloadAccountAvatar(sourceUrl, accountIndex) {
        if (!sourceUrl) return '';
        try {
            // Using global fetch (available in Electron/Node 18+)
            const response = await fetch(sourceUrl);
            if (!response || !response.ok) {
                throw new Error(`HTTP ${response ? response.status : 'unknown'}`);
            }
            const buffer = await response.arrayBuffer();
            const bufferData = Buffer.from(buffer);

            const dir = this.getAvatarStorageDir();
            const avatarPath = path.join(dir, `account-${accountIndex}.png`);
            await fsp.writeFile(avatarPath, bufferData);
            return avatarPath;
        } catch (error) {
            console.warn('Failed to download account avatar:', error && error.message ? error.message : error);
            return '';
        }
    }

    shouldAttemptProfileCapture(accountIndex, forceAttempt = false) {
        if (typeof accountIndex !== 'number' || accountIndex < 0) {
            return false;
        }
        if (forceAttempt) {
            return true;
        }
        const now = Date.now();
        const last = this.profileCaptureTimestamps.get(accountIndex) || 0;
        if (now - last < this.PROFILE_CAPTURE_COOLDOWN_MS) {
            return false;
        }
        this.profileCaptureTimestamps.set(accountIndex, now);
        return true;
    }

    async captureAccountProfile(view, accountIndex, forceAttempt = false) {
        if (!view || !view.webContents || view.webContents.isDestroyed()) {
            return;
        }
        if (!this.shouldAttemptProfileCapture(accountIndex, forceAttempt)) {
            return;
        }

        const settings = this.deps.settingsModule.getSettings();
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
                (now - existingAccount.lastProfileFetch) > this.PROFILE_REFRESH_INTERVAL_MS ||
                (existingAccount.avatarUrl && existingAccount.avatarUrl !== profile.avatarUrl)
            );

            if (needsDownload) {
                const downloaded = await this.downloadAccountAvatar(profile.avatarUrl, accountIndex);
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
                const updatedAccount = this.deps.accountsModule.updateAccountMetadata(accountIndex, updates);
                if (updatedAccount && this.deps.utils) {
                    this.deps.utils.broadcastToAllWebContents('settings-updated', this.deps.settingsModule.getSettings());
                }
            }
        } catch (error) {
            console.warn('Failed to capture account profile:', error && error.message ? error.message : error);
        }
    }

    maybeCaptureAccountProfile(view, accountIndex, forceAttempt = false) {
        if (typeof accountIndex !== 'number' || accountIndex < 0) {
            return;
        }
        // Fire and forget
        this.captureAccountProfile(view, accountIndex, forceAttempt).catch(err => {
            console.error('Error in maybeCaptureAccountProfile:', err);
        });
    }
}

module.exports = ProfileManager;
