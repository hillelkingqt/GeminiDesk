function setRTL(enabled) {
    if (enabled) {
        document.body.classList.add('rtl-enabled');
        document.documentElement.classList.add('rtl-enabled');
    } else {
        document.body.classList.remove('rtl-enabled');
        document.documentElement.classList.remove('rtl-enabled');
    }
}

// בדיקה בטעינה ראשונית
chrome.storage.local.get(['rtlEnabled'], function(result) {
    const isEnabled = result.rtlEnabled !== false; // ברירת מחדל פעיל
    setRTL(isEnabled);
});

// האזנה לשינויים מהתפריט
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleRTL") {
        setRTL(request.state);
    }
});