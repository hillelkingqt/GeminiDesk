document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('rtlToggle');
    const statusText = document.getElementById('statusText');

    // Cross-browser storage helpers
    function getStorage(keys, cb) {
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
            browser.storage.local.get(keys).then(cb).catch(function() { cb({}); });
        } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(keys, cb);
        } else {
            cb({});
        }
    }

    function setStorage(obj, cb) {
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
            browser.storage.local.set(obj).then(function() { if (cb) cb(); }).catch(function() { if (cb) cb(); });
        } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set(obj, cb);
        } else if (cb) {
            cb();
        }
    }

    // Function to update the footer text
    function updateStatus(isChecked) {
        const statusContainer = document.querySelector('.status-indicator');
        if (isChecked) {
            statusText.textContent = 'Active';
            statusContainer.classList.remove('status-inactive');
            statusContainer.classList.add('status-active');
        } else {
            statusText.textContent = 'Disabled';
            statusContainer.classList.remove('status-active');
            statusContainer.classList.add('status-inactive');
        }
    }

    // Cross-browser tab query and messaging
    function queryActiveTab(cb) {
        if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query) {
            browser.tabs.query({active: true, currentWindow: true}).then(function(tabs) { cb(tabs[0]); }).catch(function() { cb(null); });
        } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { cb(tabs[0]); });
        } else {
            cb(null);
        }
    }

    function sendMessageToTab(tabId, message) {
        if (!tabId) return;
        if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.sendMessage) {
            try { browser.tabs.sendMessage(tabId, message); } catch (e) { /* ignore */ }
        } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
            chrome.tabs.sendMessage(tabId, message, function() { if (chrome.runtime && chrome.runtime.lastError) { /* ignore */ } });
        }
    }

    // Safe function to send message to the content script (only when on aistudio page)
    function safelySendMessage(isEnabled) {
        queryActiveTab(function(currentTab) {
            if (currentTab && currentTab.url && currentTab.url.includes('aistudio.google.com')) {
                sendMessageToTab(currentTab.id, { action: 'toggleRTL', state: isEnabled });
            }
        });
    }

    // 1. Load the existing state on popup open (from storage only)
    // This is fast and independent of the page itself
    getStorage(['rtlEnabled'], function(result) {
        // Default is True if no value exists
        const isEnabled = result && result.rtlEnabled !== false;
        toggle.checked = isEnabled;
        updateStatus(isEnabled);

        // Persist default-on if not set (ensures freshly installed extension is ON)
        if (!Object.prototype.hasOwnProperty.call(result, 'rtlEnabled')) {
            setStorage({ rtlEnabled: isEnabled });
        }

        // Immediately notify the active tab so the page reflects the saved/default state
        safelySendMessage(isEnabled);
    });

    // 2. On switch toggle
    toggle.addEventListener('change', function() {
        const isEnabled = toggle.checked;
        updateStatus(isEnabled);

        // Save state to browser storage
        setStorage({ rtlEnabled: isEnabled });

        // Attempt to send the command to the page
        safelySendMessage(isEnabled);
    });
});