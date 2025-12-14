const path = require('path');

// Setup Mocks properly
const mockGetPath = jest.fn(() => 'C:\\tmp');
jest.mock('electron', () => ({
    app: {
        getPath: mockGetPath
    }
}), { virtual: true });

// Explicit mock for fs
const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockWriteFileSync = jest.fn();

jest.mock('fs', () => ({
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
    writeFileSync: mockWriteFileSync
}));

describe('Window Controls Settings', () => {
    let settings;
    // const mockSettingsPath = path.join('C:\\tmp', 'config.json');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        // Reset default mock implementations
        mockExistsSync.mockReset();
        mockReadFileSync.mockReset();
        mockWriteFileSync.mockReset();

        // Load the module under test
        settings = require('../modules/settings.js');
    });

    test('should have window controls enabled by default', () => {
        mockExistsSync.mockReturnValue(false);

        const currentSettings = settings.getSettings();

        expect(currentSettings.showMinimizeButton).toBe(true);
        expect(currentSettings.showNewWindowButton).toBe(true);
        expect(currentSettings.showCloseButton).toBe(true);
    });

    test('should have correct default button order with controls at the end', () => {
        mockExistsSync.mockReturnValue(false);

        const currentSettings = settings.getSettings();
        const expectedOrderEnding = ['minimize-button', 'fullscreen-button', 'close-window-button'];
        const actualOrder = currentSettings.buttonOrder;

        expect(actualOrder.slice(-3)).toEqual(expectedOrderEnding);
    });

    test('should read settings from disk if file exists', () => {
        const savedConfig = {
            showCloseButton: false,
            buttonOrder: ['foo', 'bar']
        };

        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue(JSON.stringify(savedConfig));

        const currentSettings = settings.getSettings();

        expect(mockExistsSync).toHaveBeenCalled();
        expect(mockReadFileSync).toHaveBeenCalled();
        expect(currentSettings.showCloseButton).toBe(false);
        expect(currentSettings.buttonOrder).toEqual(['foo', 'bar']);
    });

    test('should fall back to defaults if parsing fails', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue('invalid json');

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const currentSettings = settings.getSettings();

        expect(currentSettings.showCloseButton).toBe(true); // default
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    test('should save settings to file', () => {
        const newSettings = { some: 'setting' };
        settings.saveSettings(newSettings);

        expect(mockWriteFileSync).toHaveBeenCalledWith(
            expect.stringContaining('config.json'),
            JSON.stringify(newSettings, null, 2),
            'utf8'
        );
    });

    test('should handle save error', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockWriteFileSync.mockImplementation(() => { throw new Error('Write failed'); });

        settings.saveSettings({});

        expect(consoleSpy).toHaveBeenCalledWith("Failed to save settings to file.", expect.any(Error));

        consoleSpy.mockRestore();
    });

    test('should handle edge cases in settings merging (Branch Coverage)', () => {
        const savedConfig = {
            showInTaskbar: true,
            loadUnpackedExtension: true,
            disableAutoUpdateCheck: true,
            autoInstallUpdates: false
        };

        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue(JSON.stringify(savedConfig));

        const currentSettings = settings.getSettings();

        // Verify branches for lines 86-90
        expect(currentSettings.showInTaskbar).toBe(true);
        expect(currentSettings.loadUnpackedExtension).toBe(true);
        expect(currentSettings.disableAutoUpdateCheck).toBe(true);
        expect(currentSettings.autoInstallUpdates).toBe(false);

        // Test the opposite branches (undefined/false)
        mockReadFileSync.mockReturnValue(JSON.stringify({
            loadUnpackedExtension: false,
            disableAutoUpdateCheck: false
        }));

        // Reset modules? No, we can just call getSettings again if it doesn't cache internally?
        // defaults don't cache, it reads file every time.
        const otherSettings = settings.getSettings();
        expect(otherSettings.showInTaskbar).toBe(false); // Default is false (undefined in file -> false)
        expect(otherSettings.loadUnpackedExtension).toBe(false);
        expect(otherSettings.disableAutoUpdateCheck).toBe(false);
        expect(otherSettings.autoInstallUpdates).toBe(true); // Default is true
    });

    test('should handle empty settings object', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue('{}');

        const currentSettings = settings.getSettings();
        // Should return defaults if Object.keys is 0?
        // Line 81: if (savedSettings && Object.keys(savedSettings).length > 0)
        // If {}, keys length is 0, so it skips the block and return {...defaultSettings}.
        // This covers the "else" (implicit return default) of the main if.
        expect(currentSettings.showCloseButton).toBe(true);
    });
});

describe('macOS Platform Defaults', () => {
    let settings;
    const originalPlatform = process.platform;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        // Mock platform
        Object.defineProperty(process, 'platform', {
            value: 'darwin'
        });

        // We need to require settings.js AGAIN to re-evaluate top-level "isMac"
        settings = require('../modules/settings.js');
    });

    afterEach(() => {
        Object.defineProperty(process, 'platform', {
            value: originalPlatform
        });
    });

    test('should use macOS specific shortcuts', () => {
        const defaults = settings.defaultSettings;
        expect(defaults.shortcuts.showHide).toBe('Command+G');
        expect(defaults.shortcuts.quit).toBe('Command+Q');
    });
});
