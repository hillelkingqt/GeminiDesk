// MCP Manager Module

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mcpProxyProcess = null;
let mcpSetupWin = null;

function setupContextMenu(webContents) {
    if (!webContents || webContents.isDestroyed()) return;
    const { Menu, clipboard } = require('electron');

    webContents.on('context-menu', (event, params) => {
        const menuTemplate = [
            {
                label: 'Copy',
                role: 'copy',
                accelerator: 'CmdOrCtrl+C',
                enabled: params.editFlags.canCopy
            }
        ];

        if (menuTemplate.length > 0) {
            const contextMenu = Menu.buildFromTemplate(menuTemplate);
            contextMenu.popup({
                window: BrowserWindow.fromWebContents(webContents),
                x: params.x,
                y: params.y
            });
        }
    });
}

function openMcpSetupWindow(parent) {
    try {
        if (mcpSetupWin) {
            mcpSetupWin.focus();
            return;
        }

        mcpSetupWin = new BrowserWindow({
            width: 780,
            height: 720,
            minWidth: 640,
            minHeight: 560,
            resizable: true,
            frame: false,
            alwaysOnTop: true,
            parent: parent || undefined,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                contextIsolation: true,
            }
        });

        setupContextMenu(mcpSetupWin.webContents);

        // Open external links in default browser
        mcpSetupWin.webContents.setWindowOpenHandler(({ url }) => {
            try { shell.openExternal(url); } catch (e) {}
            return { action: 'deny' };
        });
        mcpSetupWin.webContents.on('will-navigate', (e, url) => {
            if (!url.startsWith('file://')) {
                e.preventDefault();
                try { shell.openExternal(url); } catch (err) {}
            }
        });

    mcpSetupWin.loadFile('mcp-setup.html');

        mcpSetupWin.once('ready-to-show', () => {
            if (mcpSetupWin) {
                mcpSetupWin.show();
                mcpSetupWin.setAlwaysOnTop(true, 'screen-saver');
            }
        });

        mcpSetupWin.on('closed', () => {
            mcpSetupWin = null;
        });
    } catch (e) {
        console.warn('Error creating MCP setup window:', e && e.message ? e.message : e);
    }
}

// Automatically create MCP config and launch proxy in background
ipcMain.handle('mcp-setup-doitforme', async () => {
    try {
        const userDataDir = app.getPath('userData');
        const cfgDir = path.join(userDataDir, 'mcp');
        const cfgPath = path.join(cfgDir, 'config.json');

        if (!fs.existsSync(cfgDir)) {
            fs.mkdirSync(cfgDir, { recursive: true });
        }

        // Minimal default config using Desktop Commander
        const defaultConfig = {
            mcpServers: {
                'desktop-commander': {
                    command: 'npx',
                    args: ['-y', '@wonderwhy-er/desktop-commander']
                }
            }
        };

        // Write or overwrite config.json
        try {
            fs.writeFileSync(cfgPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        } catch (e) {
            return { success: false, step: 'write-config', message: e && e.message ? e.message : String(e) };
        }

        // If already running, return success with existing info
        if (mcpProxyProcess && !mcpProxyProcess.killed) {
            return { success: true, reused: true, configPath: cfgPath, url: 'http://localhost:3006/sse' };
        }

        // Launch the proxy server in a VISIBLE terminal window (so user sees it running)
        try {
            const proxyCmd = `npx -y @srbhptl39/mcp-superassistant-proxy@latest --config "${cfgPath}" --outputTransport sse`;
            if (process.platform === 'win32') {
                // Open a new PowerShell window with -NoExit so it stays open
                // Using cmd /c start ... to ensure a new window is spawned
                spawn('cmd.exe', ['/c', 'start', 'powershell.exe', '-NoExit', '-Command', proxyCmd], {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: false,
                    env: { ...process.env }
                }).unref();
                // We cannot reliably track the child PID started via 'start', so do not set mcpProxyProcess
            } else if (process.platform === 'darwin') {
                // On macOS, open a visible Terminal.app window with the command
                // Use osascript to tell Terminal to run the command in a new window
                const escapedCmd = proxyCmd.replace(/"/g, '\\"');
                const appleScript = `tell application "Terminal"
                    activate
                    do script "${escapedCmd}"
                end tell`;
                spawn('osascript', ['-e', appleScript], {
                    detached: true,
                    stdio: 'ignore',
                    env: { ...process.env }
                }).unref();
            } else {
                // On Linux, try common terminal emulators in order of preference
                const terminals = [
                    { cmd: 'gnome-terminal', args: ['--', 'bash', '-c', `${proxyCmd}; exec bash`] },
                    { cmd: 'konsole', args: ['-e', 'bash', '-c', `${proxyCmd}; exec bash`] },
                    { cmd: 'xfce4-terminal', args: ['-e', `bash -c "${proxyCmd}; exec bash"`] },
                    { cmd: 'xterm', args: ['-hold', '-e', proxyCmd] }
                ];

                let launched = false;
                for (const term of terminals) {
                    try {
                        // Check if terminal exists using 'which'
                        const which = require('child_process').spawnSync('which', [term.cmd]);
                        if (which.status === 0) {
                            spawn(term.cmd, term.args, {
                                detached: true,
                                stdio: 'ignore',
                                env: { ...process.env }
                            }).unref();
                            launched = true;
                            break;
                        }
                    } catch (e) {
                        // Try next terminal
                    }
                }

                // Fallback: run in background if no terminal found
                if (!launched) {
                    const child = spawn('npx', ['-y', '@srbhptl39/mcp-superassistant-proxy@latest', '--config', cfgPath, '--outputTransport', 'sse'], {
                        shell: true,
                        detached: true,
                        stdio: 'ignore',
                        env: { ...process.env }
                    });
                    child.unref();
                    mcpProxyProcess = child;
                }
            }
        } catch (e) {
            return { success: false, step: 'spawn-proxy', message: e && e.message ? e.message : String(e) };
        }

        return { success: true, configPath: cfgPath, url: 'http://localhost:3006/sse', visibleShell: true };
    } catch (err) {
        return { success: false, step: 'unexpected', message: err && err.message ? err.message : String(err) };
    }
});

// Open MCP setup window explicitly (no parent to keep it independent)
ipcMain.on('open-mcp-setup-window', () => {
    try {
        openMcpSetupWindow(undefined);
    } catch (e) {
        console.warn('Failed to open MCP setup window via IPC:', e && e.message ? e.message : e);
    }
});

function killProxy() {
    try {
        if (mcpProxyProcess && !mcpProxyProcess.killed) {
            process.kill(mcpProxyProcess.pid);
        }
    } catch (e) {
        // ignore kill errors
    }
}

module.exports = {
    openMcpSetupWindow,
    killProxy
};
