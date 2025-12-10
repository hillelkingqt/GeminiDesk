// Voice Assistant Module

let clickMicrophoneButton = null;

async function executeVoiceScript(view) {
    const script = `
        (async function() {
            console.log('Voice Assistant: Looking for microphone button...');

            const waitForElement = (selector, timeout = 5000) => {
                return new Promise((resolve, reject) => {
                    const timer = setInterval(() => {
                        const element = document.querySelector(selector);
                        if (element && !element.disabled && element.offsetParent !== null) {
                            clearInterval(timer);
                            resolve(element);
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(timer);
                        reject(new Error('Element not found: ' + selector));
                    }, timeout);
                });
            };

            const simulateClick = (element) => {
                ['mousedown', 'mouseup', 'click'].forEach(type => {
                    const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                    element.dispatchEvent(event);
                });
            };

            try {
                // Find the microphone button using multiple selectors
                const micSelectors = [
                    'button[aria-label*="microphone" i]',
                    'button[aria-label*="mic" i]',
                    'button.speech_dictation_mic_button',
                    'speech-dictation-mic-button button',
                    '.mic-button-container button',
                    'button[data-node-type="speech_dictation_mic_button"]'
                ];

                let micButton = null;
                for (const selector of micSelectors) {
                    try {
                        micButton = await waitForElement(selector, 1000);
                        if (micButton) {
                            console.log('Voice Assistant: Found mic button with selector:', selector);
                            break;
                        }
                    } catch (e) {
                        // Try next selector
                    }
                }

                if (!micButton) {
                    throw new Error('Could not find microphone button');
                }

                // Click the microphone button
                simulateClick(micButton);
                console.log('Voice Assistant: Clicked microphone button successfully!');

                return { success: true };

            } catch (error) {
                console.error('Voice Assistant Error:', error);
                return { success: false, error: error.message };
            }
        })();
    `;

    try {
        const result = await view.webContents.executeJavaScript(script);
        if (result.success) {
            console.log('Voice Assistant activated successfully!');
        } else {
            console.error('Voice Assistant failed:', result.error);
        }
    } catch (error) {
        console.error('Voice Assistant script execution failed:', error);
    }
}

async function clickMicrophoneButtonImpl(targetWin, view) {
    if (!targetWin || targetWin.isDestroyed() || !view || view.webContents.isDestroyed()) {
        console.error('Invalid window or view for voice assistant');
        return;
    }
    await executeVoiceScript(view);
}

module.exports = {
    clickMicrophoneButton: clickMicrophoneButtonImpl
};
