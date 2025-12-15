document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('rtlToggle');
    const statusText = document.getElementById('statusText');

    // פונקציה לעדכון הטקסט בתחתית
    function updateStatus(isChecked) {
        statusText.textContent = isChecked ? 'Status: Active' : 'Status: Disabled';
        statusText.style.color = isChecked ? '#4f46e5' : '#9ca3af';
    }

    // פונקציה בטוחה לשליחת הודעה לסקריפט בדף
    function safelySendMessage(isEnabled) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            
            // בדיקה: האם הלשונית קיימת והאם היא של האתר הנכון?
            // אם לא, אנחנו לא שולחים כלום כדי למנוע את השגיאה
            if (currentTab && currentTab.url && currentTab.url.includes("aistudio.google.com")) {
                chrome.tabs.sendMessage(currentTab.id, {
                    action: "toggleRTL", 
                    state: isEnabled
                }, function(response) {
                    // בדיקה אם קרתה שגיאה (למשל אם הסקריפט עדיין לא נטען)
                    // זה מונע את ההודעה האדומה בקונסול
                    if (chrome.runtime.lastError) {
                        console.log("RTL Extension: Content script not ready yet or restricted.");
                    }
                });
            }
        });
    }

    // 1. טעינת המצב הקיים בפתיחת החלון (מהזיכרון בלבד)
    // זה מהיר ולא תלוי בדף עצמו
    chrome.storage.local.get(['rtlEnabled'], function(result) {
        // ברירת מחדל היא True אם אין ערך
        const isEnabled = result.rtlEnabled !== false;
        toggle.checked = isEnabled;
        updateStatus(isEnabled);
    });

    // 2. בעת לחיצה על המתג
    toggle.addEventListener('change', function() {
        const isEnabled = toggle.checked;
        updateStatus(isEnabled);

        // שמירת המצב בזיכרון הדפדפן
        chrome.storage.local.set({rtlEnabled: isEnabled});

        // ניסיון לשלוח את הפקודה לדף
        safelySendMessage(isEnabled);
    });
});