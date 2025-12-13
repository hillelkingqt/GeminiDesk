const ProfileManager = require('../../modules/ProfileManager');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

// Mock electron
jest.mock('electron', () => ({
    app: {
        getPath: jest.fn().mockReturnValue('/mock/user/data'),
    },
    BrowserWindow: jest.fn()
}));

// Mock global fetch
global.fetch = jest.fn();

describe('ProfileManager', () => {
    let profileManager;
    let mockDeps;
    let mockView;
    let mockSettings;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock dependencies
        mockSettings = {
            accounts: [
                { index: 0, name: 'Account 1' }
            ]
        };

        mockDeps = {
            settingsModule: {
                getSettings: jest.fn().mockReturnValue(mockSettings)
            },
            accountsModule: {
                updateAccountMetadata: jest.fn().mockReturnValue(true)
            },
            utils: {
                broadcastToAllWebContents: jest.fn()
            },
            userDataPath: '/mock/user/data' // Inject path for consistent testing
        };

        // Setup mock view
        mockView = {
            webContents: {
                isDestroyed: jest.fn().mockReturnValue(false),
                executeJavaScript: jest.fn()
            }
        };

        profileManager = new ProfileManager(mockDeps);

        // Mock fs functions
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        jest.spyOn(fs, 'mkdirSync').mockImplementation(() => { });
        jest.spyOn(fsp, 'writeFile').mockResolvedValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAvatarStorageDir', () => {
        it('should return cached path if available', () => {
            profileManager.avatarDirectoryPath = '/cached/path';
            expect(profileManager.getAvatarStorageDir()).toBe('/cached/path');
        });

        it('should create directory if it does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const dir = profileManager.getAvatarStorageDir();
            expect(dir).toContain('account-avatars');
            expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('account-avatars'), { recursive: true });
        });

        it('should handle errors during directory creation', () => {
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockImplementation(() => { throw new Error('Permission denied'); });

            // Should not throw, but catch and log warning
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            profileManager.getAvatarStorageDir();

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('downloadAccountAvatar', () => {
        it('should return empty string if no source url', async () => {
            const result = await profileManager.downloadAccountAvatar('');
            expect(result).toBe('');
        });

        it('should download and save avatar', async () => {
            const mockBuffer = Buffer.from('fake-image');
            const mockResponse = {
                ok: true,
                arrayBuffer: jest.fn().mockResolvedValue(mockBuffer.buffer)
            };
            global.fetch.mockResolvedValue(mockResponse);

            // Mock getAvatarStorageDir to avoid fs calls logic inside it again
            jest.spyOn(profileManager, 'getAvatarStorageDir').mockReturnValue('/mock/avatars');

            const result = await profileManager.downloadAccountAvatar('http://example.com/avatar.png', 1);

            expect(global.fetch).toHaveBeenCalledWith('http://example.com/avatar.png');
            expect(fsp.writeFile).toHaveBeenCalledWith(expect.stringContaining('account-1.png'), expect.any(Buffer));
            expect(result).toContain('account-1.png');
        });

        it('should handle fetch errors', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            const result = await profileManager.downloadAccountAvatar('http://example.com/fail.png', 1);

            expect(consoleSpy).toHaveBeenCalled();
            expect(result).toBe('');
        });

        it('should handle non-ok response', async () => {
            global.fetch.mockResolvedValue({ ok: false, status: 404 });
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            await profileManager.downloadAccountAvatar('http://example.com/404.png', 1);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('shouldAttemptProfileCapture', () => {
        it('should return false for invalid account index', () => {
            expect(profileManager.shouldAttemptProfileCapture(-1)).toBe(false);
            expect(profileManager.shouldAttemptProfileCapture(null)).toBe(false);
        });

        it('should return true if forceAttempt is true', () => {
            expect(profileManager.shouldAttemptProfileCapture(0, true)).toBe(true);
        });

        it('should respect cooldown', () => {
            jest.useFakeTimers();
            const now = Date.now();
            jest.setSystemTime(now);

            // First attempt
            expect(profileManager.shouldAttemptProfileCapture(0)).toBe(true);

            // Immediate second attempt (should fail due to cooldown)
            expect(profileManager.shouldAttemptProfileCapture(0)).toBe(false);

            // Advance time past cooldown
            jest.advanceTimersByTime(profileManager.PROFILE_CAPTURE_COOLDOWN_MS + 100);
            expect(profileManager.shouldAttemptProfileCapture(0)).toBe(true);

            jest.useRealTimers();
        });
    });

    describe('captureAccountProfile', () => {
        beforeEach(() => {
            // Bypass cooldown for most tests
            jest.spyOn(profileManager, 'shouldAttemptProfileCapture').mockReturnValue(true);
            // Mock download
            jest.spyOn(profileManager, 'downloadAccountAvatar').mockResolvedValue('/mock/avatars/account-0.png');
        });

        it('should return early if view is destroyed', async () => {
            mockView.webContents.isDestroyed.mockReturnValue(true);
            await profileManager.captureAccountProfile(mockView, 0);
            expect(mockView.webContents.executeJavaScript).not.toHaveBeenCalled();
        });

        it('should do nothing if profile extraction fails/returns null', async () => {
            mockView.webContents.executeJavaScript.mockResolvedValue(null);
            await profileManager.captureAccountProfile(mockView, 0);
            expect(mockDeps.accountsModule.updateAccountMetadata).not.toHaveBeenCalled();
        });

        it('should update profile when new data found', async () => {
            const mockProfile = {
                avatarUrl: 'http://new.com/pic.png',
                email: 'test@example.com',
                displayName: 'Test User'
            };

            mockView.webContents.executeJavaScript.mockResolvedValue(mockProfile);

            // Existing account has different data
            mockSettings.accounts[0] = {
                index: 0,
                name: 'Account 1',
                email: 'old@example.com',
                avatarUrl: 'http://old.com/pic.png'
            };

            await profileManager.captureAccountProfile(mockView, 0);

            expect(profileManager.downloadAccountAvatar).toHaveBeenCalled();
            expect(mockDeps.accountsModule.updateAccountMetadata).toHaveBeenCalledWith(0, expect.objectContaining({
                email: 'test@example.com',
                name: 'Test User',
                avatarUrl: 'http://new.com/pic.png'
            }));
            expect(mockDeps.utils.broadcastToAllWebContents).toHaveBeenCalled();
        });

        it('should not update if data is identical', async () => {
            const mockProfile = {
                avatarUrl: 'http://same.com/pic.png',
                email: 'same@example.com',
                displayName: 'Same User'
            };
            mockView.webContents.executeJavaScript.mockResolvedValue(mockProfile);

            // Setup existing account to match
            mockSettings.accounts[0] = {
                index: 0,
                name: 'Same User',
                email: 'same@example.com',
                avatarUrl: 'http://same.com/pic.png',
                avatarFile: '/mock/avatars/account-0.png',
                lastProfileFetch: Date.now() // recent fetch
            };

            // Override check logic to ensure it doesn't think it needs download
            // Actually, logic is complex. 
            // If local file exists (mocked fs.existsSync false by default in beforeEach)
            fs.existsSync.mockReturnValue(true);

            await profileManager.captureAccountProfile(mockView, 0);

            expect(mockDeps.accountsModule.updateAccountMetadata).not.toHaveBeenCalled();
        });
    });
});
