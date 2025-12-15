function setRTL(enabled) {
    if (enabled) {
        document.body.classList.add('rtl-enabled');
        document.documentElement.classList.add('rtl-enabled');
    } else {
        document.body.classList.remove('rtl-enabled');
        document.documentElement.classList.remove('rtl-enabled');
    }
}

// Initial load - check if RTL is enabled in extension storage
chrome.storage.local.get(['rtlEnabled'], function(result) {
    // Default to false (disabled) if not set
    const isEnabled = result.rtlEnabled === true;
    setRTL(isEnabled);
});

// Listen for changes from the main application
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.rtlEnabled) {
        const newValue = changes.rtlEnabled.newValue === true;
        setRTL(newValue);
    }
});