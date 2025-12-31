const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock Electron
const mockApp = {
    getPath: () => os.tmpdir()
};
const mockElectron = {
    app: mockApp
};

// Mock require
const originalRequire = require('module').prototype.require;
require('module').prototype.require = function(path) {
    if (path === 'electron') {
        return mockElectron;
    }
    return originalRequire.apply(this, arguments);
};

const settingsModule = require('../modules/settings.js');

(async () => {
    try {
        console.log('Testing saveSettingsAsync...');
        const testData = { ...settingsModule.defaultSettings, testKey: 'async-test-' + Date.now() };

        const start = process.hrtime.bigint();
        await settingsModule.saveSettingsAsync(testData);
        const end = process.hrtime.bigint();

        console.log(`Async save duration: ${(Number(end - start) / 1e6).toFixed(2)}ms`);

        // Verify file content
        const fileContent = fs.readFileSync(settingsModule.settingsPath, 'utf8');
        const parsed = JSON.parse(fileContent);

        if (parsed.testKey === testData.testKey) {
            console.log('SUCCESS: Settings saved correctly via async method.');
        } else {
            console.error('FAILURE: Saved data does not match.');
            process.exit(1);
        }

        // Verify cache update
        const cached = settingsModule.getSettings();
        if (cached.testKey === testData.testKey) {
             console.log('SUCCESS: Cache updated correctly.');
        } else {
             console.error('FAILURE: Cache not updated.');
             process.exit(1);
        }

    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    } finally {
        // Cleanup
        try { fs.unlinkSync(settingsModule.settingsPath); } catch(e) {}
    }
})();
