// Auto Launch Module

const AutoLaunch = require('auto-launch');
const { app } = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin';
const execPath = process.execPath;
const launcherPath = isMac ? path.resolve(execPath, '..', '..', '..') : execPath;

const autoLauncher = new AutoLaunch({
    name: 'GeminiApp',
    path: launcherPath,
    isHidden: true,
});

function setAutoLaunch(shouldEnable) {
    if (shouldEnable) {
        autoLauncher.enable();
    } else {
        autoLauncher.disable();
    }
}

module.exports = {
    setAutoLaunch
};
