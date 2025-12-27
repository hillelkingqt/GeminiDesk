// Enable/disable wrapper and communication helpers (follows Ai-studio pattern)
function getStorage(keys, cb) {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
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

function _readCookie(name) {
    try {
        const m = document.cookie.match('(?:^|; )' + name + '=([^;]+)');
        return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
}

// Core renderer logic (kept mostly unchanged)
function createGeminimarkController() {
    // inject KaTeX CSS if not present
    const existing = document.getElementById('geminimark-katex-css');
    if (!existing) {
        const link = document.createElement("link");
        link.id = 'geminimark-katex-css';
        link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
        link.type = "text/css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }

    function processMessage(element) {
        if (element.dataset.markdownRendered === "true") return;

        let rawText = "";
        const lines = element.querySelectorAll('.query-text-line');
        if (lines.length > 0) {
            lines.forEach(line => {
                if (line.innerHTML.trim() === '<br>') {
                    rawText += "\n";
                } else {
                    rawText += line.textContent + "\n";
                }
            });
        } else {
            rawText = element.innerText;
        }

        // Store original raw text so we can restore it if the renderer is disabled
        try {
            element.dataset.geminimarkOriginal = encodeURIComponent(rawText);
        } catch (e) {}

        const mathPlaceholders = [];

        const protectMath = (text) => {
            text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, tex) => {
                const placeholder = `MATHBLOCK${mathPlaceholders.length}PLACEHOLDER`;
                mathPlaceholders.push({ type: 'block', tex: tex, placeholder: placeholder });
                return placeholder;
            });

            text = text.replace(/\$([^$\n]+?)\$/g, (match, tex) => {
                const placeholder = `MATHINLINE${mathPlaceholders.length}PLACEHOLDER`;
                mathPlaceholders.push({ type: 'inline', tex: tex, placeholder: placeholder });
                return placeholder;
            });

            return text;
        };

        let protectedText = protectMath(rawText);
        let htmlContent = marked.parse(protectedText);

        mathPlaceholders.forEach(item => {
            let renderedMath = "";
            try {
                renderedMath = katex.renderToString(item.tex, {
                    displayMode: item.type === 'block',
                    throwOnError: false,
                    output: 'html'
                });
            } catch (e) {
                renderedMath = `<span style="color:red; direction:ltr;">LaTeX Error</span>`;
            }

            if (item.type === 'block') {
                renderedMath = `<div class="math-block" dir="ltr">${renderedMath}</div>`;
            } else {
                renderedMath = `<span class="math-inline" dir="ltr">${renderedMath}</span>`;
            }

            htmlContent = htmlContent.split(item.placeholder).join(renderedMath);
        });

        const contentDiv = document.createElement('div');
        contentDiv.className = 'rendered-markdown-content';
        const isHebrew = /[\u0590-\u05FF]/.test(rawText);
        contentDiv.style.direction = isHebrew ? 'rtl' : 'ltr';
        contentDiv.style.textAlign = isHebrew ? 'right' : 'left';
        contentDiv.innerHTML = htmlContent;

        element.innerHTML = '';
        element.appendChild(contentDiv);
        element.dataset.markdownRendered = "true";
    }

    function scanForMessages() {
        const messages = document.querySelectorAll('user-query .query-text');
        messages.forEach(msg => processMessage(msg));
    }

    const observer = new MutationObserver(() => {
        scanForMessages();
    });

    return {
        start() {
            try {
                observer.observe(document.body, { childList: true, subtree: true });
                scanForMessages();
            } catch (e) {}
        },
        stop() {
            try { observer.disconnect(); } catch (e) {}

            // Restore any previously rendered elements to their original text
            try {
                const messages = document.querySelectorAll('user-query .query-text');
                messages.forEach(el => {
                    try {
                        if (el && el.dataset && el.dataset.markdownRendered === 'true') {
                            // Prefer original stored text
                            if (el.dataset.geminimarkOriginal) {
                                try {
                                    el.innerText = decodeURIComponent(el.dataset.geminimarkOriginal);
                                } catch (e) {
                                    el.innerText = el.dataset.geminimarkOriginal || '';
                                }
                            } else {
                                // Fallback: extract visible plain text from rendered content
                                const contentDiv = el.querySelector('.rendered-markdown-content');
                                if (contentDiv) {
                                    el.innerText = contentDiv.innerText || '';
                                }
                            }
                            delete el.dataset.markdownRendered;
                            try { delete el.dataset.geminimarkOriginal; } catch (e) {}
                        }
                    } catch (e) {}
                });
            } catch (e) {}
        }
    };
}

// Manage enabled state (storage.local -> cookie -> default true)
let gmController = null;
function setGeminimarkEnabled(enabled, source) {
    try { console.log('Geminimark: setting enabled ->', !!enabled, 'source:', source || 'unknown'); } catch (e) {}
    if (enabled) {
        if (!gmController) gmController = createGeminimarkController();
        try { gmController.start(); } catch (e) {}
    } else {
        try { if (gmController) gmController.stop(); } catch (e) {}
    }
}

getStorage(['geminimarkEnabled'], function(result) {
    let isEnabled;
    if (result && typeof result.geminimarkEnabled !== 'undefined') {
        isEnabled = result.geminimarkEnabled !== false;
    } else {
        const cookieVal = _readCookie('geminidesk_geminimark');
        if (cookieVal !== null) {
            isEnabled = cookieVal === '1' || cookieVal.toLowerCase() === 'true';
        } else {
            isEnabled = true;
        }
    }
    setGeminimarkEnabled(isEnabled, (result && typeof result.geminimarkEnabled !== 'undefined') ? 'storage' : (_readCookie('geminidesk_geminimark') !== null ? 'cookie' : 'default'));
});

onMessage(function(request) {
    if (!request) return;
    if (request.action === 'toggleGeminimark') {
        setGeminimarkEnabled(request.state, 'extension-message');
    }
});

// Listen for postMessage broadcasts from embedding app
try {
    window.addEventListener('message', function(ev) {
        try {
            const d = ev && ev.data;
            if (!d || d.type !== 'GeminiDesk:geminimarkEnabled') return;
            setGeminimarkEnabled(!!d.state, 'postMessage');
        } catch (e) {}
    }, false);
} catch (e) {}

// Listen for CustomEvent on the document
try {
    document.addEventListener('GeminiDeskGeminimarkEnabled', function(ev) {
        try {
            const state = ev && ev.detail && typeof ev.detail.state !== 'undefined' ? !!ev.detail.state : null;
            if (state !== null) setGeminimarkEnabled(state, 'customEvent');
        } catch (e) {}
    }, false);
} catch (e) {}