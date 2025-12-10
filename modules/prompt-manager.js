// Prompt Manager Module

const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let settings = null;
let saveSettings = null;
let broadcastToWindows = null;
let promptManagerWin = null;

function initialize(deps) {
    settings = deps.settings;
    saveSettings = deps.saveSettings;
    broadcastToWindows = deps.broadcastToWindows;
}

// Get all custom prompts
ipcMain.handle('get-custom-prompts', async () => {
    return settings.customPrompts || [];
});

// Add a new custom prompt
ipcMain.handle('add-custom-prompt', async (event, prompt) => {
    if (!settings.customPrompts) {
        settings.customPrompts = [];
    }
    const newPrompt = {
        id: Date.now().toString(),
        name: prompt.name || 'Untitled Prompt',
        content: prompt.content || '',
        isDefault: prompt.isDefault || false
    };

    // If this prompt is set as default, clear default from others
    if (newPrompt.isDefault) {
        settings.customPrompts.forEach(p => p.isDefault = false);
        settings.defaultPromptId = newPrompt.id;
    }

    settings.customPrompts.push(newPrompt);
    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return newPrompt;
});

// Update an existing custom prompt
ipcMain.handle('update-custom-prompt', async (event, prompt) => {
    if (!settings.customPrompts) return null;

    const index = settings.customPrompts.findIndex(p => p.id === prompt.id);
    if (index === -1) return null;

    // If this prompt is being set as default, clear default from others
    if (prompt.isDefault) {
        settings.customPrompts.forEach(p => p.isDefault = false);
        settings.defaultPromptId = prompt.id;
    } else if (settings.defaultPromptId === prompt.id) {
        settings.defaultPromptId = null;
    }

    settings.customPrompts[index] = { ...settings.customPrompts[index], ...prompt };
    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return settings.customPrompts[index];
});

// Delete a custom prompt
ipcMain.handle('delete-custom-prompt', async (event, promptId) => {
    if (!settings.customPrompts) return false;

    const index = settings.customPrompts.findIndex(p => p.id === promptId);
    if (index === -1) return false;

    // If deleting the default prompt, clear the default
    if (settings.defaultPromptId === promptId) {
        settings.defaultPromptId = null;
    }

    settings.customPrompts.splice(index, 1);
    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return true;
});

// Set a prompt as the default
ipcMain.handle('set-default-prompt', async (event, promptId) => {
    if (!settings.customPrompts) return false;

    // Clear default from all prompts
    settings.customPrompts.forEach(p => p.isDefault = false);

    if (promptId) {
        const prompt = settings.customPrompts.find(p => p.id === promptId);
        if (prompt) {
            prompt.isDefault = true;
            settings.defaultPromptId = promptId;
        } else {
            settings.defaultPromptId = null;
        }
    } else {
        settings.defaultPromptId = null;
    }

    saveSettings(settings);
    broadcastToWindows('settings-updated', settings);
    return true;
});

// Open Prompt Manager window
ipcMain.on('open-prompt-manager-window', (event) => {
    if (promptManagerWin && !promptManagerWin.isDestroyed()) {
        promptManagerWin.focus();
        return;
    }

    promptManagerWin = new BrowserWindow({
        width: 700,
        height: 600,
        frame: false,
        resizable: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true
        }
    });

    promptManagerWin.__internal = true;
    promptManagerWin.loadFile('prompt-manager.html');

    promptManagerWin.on('closed', () => {
        promptManagerWin = null;
    });
});

module.exports = {
    initialize
};
