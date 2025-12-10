// Proxy Manager Module

const { session } = require('electron');

let settings = null;
let accountsModule = null;

function initialize(deps) {
    settings = deps.settings;
    accountsModule = deps.accountsModule;
}

/**
 * Apply proxy settings to all browser sessions.
 * Supports HTTP, HTTPS, and SOCKS5 proxies.
 */
async function applyProxySettings() {
    const proxyEnabled = settings.proxyEnabled || false;
    const proxyUrl = settings.proxyUrl || '';

    let proxyConfig = {};

    if (proxyEnabled && proxyUrl) {
        // Parse proxy URL to determine protocol
        // Supports: http://host:port, https://host:port, socks5://host:port
        proxyConfig = {
            proxyRules: proxyUrl
            // No bypass rules - proxy applies to all URLs
        };
        console.log(`Applying proxy settings: ${proxyUrl}`);
    } else {
        // Disable proxy (use direct connection)
        proxyConfig = {
            proxyRules: 'direct://'
        };
        console.log('Proxy disabled, using direct connection');
    }

    try {
        // Apply to default session
        await session.defaultSession.setProxy(proxyConfig);

        // Apply to all partitioned sessions (accounts)
        const accounts = settings.accounts || [];
        for (let i = 0; i < accounts.length; i++) {
            const partition = accountsModule.getAccountPartition(i);
            const accountSession = session.fromPartition(partition);
            await accountSession.setProxy(proxyConfig);
        }

        console.log('Proxy settings applied successfully to all sessions');
    } catch (error) {
        console.error('Failed to apply proxy settings:', error);
    }
}

module.exports = {
    initialize,
    applyProxySettings
};
