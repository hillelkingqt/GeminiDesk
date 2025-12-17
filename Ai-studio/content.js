// Cross-browser helpers (works with Chrome, Edge, Firefox)
function setRTL(enabled, source) {
    try {
        console.log('AI Studio RTL: applying ->', !!enabled, 'source:', source || 'unknown');
    } catch (e) {}
    if (enabled) {
        document.body.classList.add('rtl-enabled');
        document.documentElement.classList.add('rtl-enabled');
    } else {
        document.body.classList.remove('rtl-enabled');
        document.documentElement.classList.remove('rtl-enabled');
    }
}

function getStorage(keys, cb) {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
        // browser.storage returns a Promise
        browser.storage.local.get(keys).then(cb).catch(function() { cb({}); });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, cb);
    } else {
        cb({});
    }
}

function onMessage(cb) {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
        browser.runtime.onMessage.addListener(function(message, sender) { cb(message, sender); });
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(cb);
    }
}

// Apply state at initial load (default: enabled)
function _readCookie(name) {
    try {
        const m = document.cookie.match('(?:^|; )' + name + '=([^;]+)');
        return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
}

// Apply state at initial load (default: enabled). Priority:
// 1) chrome/browser storage.local (if present)
// 2) geminiDesk cookie override (set by the main app)
// 3) default true
getStorage(['rtlEnabled'], function(result) {
    let isEnabled;
    if (result && typeof result.rtlEnabled !== 'undefined') {
        isEnabled = result.rtlEnabled !== false; // explicit storage value wins
    } else {
        const cookieVal = _readCookie('geminidesk_rtl');
        if (cookieVal !== null) {
            isEnabled = cookieVal === '1' || cookieVal.toLowerCase() === 'true';
        } else {
            isEnabled = true;
        }
    }
    setRTL(isEnabled, (result && typeof result.rtlEnabled !== 'undefined') ? 'storage' : (_readCookie('geminidesk_rtl') !== null ? 'cookie' : 'default'));
});

// Listen for toggle messages from popup or background
onMessage(function(request, sender) {
    if (!request) return;
    if (request.action === 'toggleRTL') {
        setRTL(request.state, 'extension-message');
    }
});

// Also accept window.postMessage broadcasts from the embedding app
// so GeminiDesk can toggle RTL for sessions where chrome.storage isn't populated.
try {
    window.addEventListener('message', function(ev) {
        try {
            const d = ev && ev.data;
            if (!d || d.type !== 'GeminiDesk:aiStudioRtl') return;
            console.log('AI Studio RTL: received postMessage from embedding app', d && d.state);
            setRTL(!!d.state, 'postMessage');
        } catch (e) {}
    }, false);
} catch (e) {}

// Also listen for a CustomEvent dispatched on the document so page scripts
// (or `executeJavaScript` calls from the main process) can toggle RTL.
try {
    document.addEventListener('GeminiDeskAiStudioRtl', function(ev) {
        try {
            const state = ev && ev.detail && typeof ev.detail.state !== 'undefined' ? !!ev.detail.state : null;
            console.log('AI Studio RTL: received CustomEvent on document', state);
            if (state !== null) setRTL(state, 'customEvent');
        } catch (e) {}
    }, false);
} catch (e) {}