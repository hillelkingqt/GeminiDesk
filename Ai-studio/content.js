function setRTL(enabled) {
    if (enabled) {
        document.body.classList.add('rtl-enabled');
        document.documentElement.classList.add('rtl-enabled');
    } else {
        document.body.classList.remove('rtl-enabled');
        document.documentElement.classList.remove('rtl-enabled');
    }
}

// Check on initial load
chrome.storage.local.get(['rtlEnabled'], function(result) {
    const isEnabled = result.rtlEnabled === true; // Default is false
    setRTL(isEnabled);
});

// Listen for changes from GeminiDesk settings
chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'local' && changes.rtlEnabled) {
        setRTL(changes.rtlEnabled.newValue === true);
    }
});