document.addEventListener('DOMContentLoaded', () => {

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.electronAPI.pieMenuAction('close');
        }
    });

    const centerBtn = document.getElementById('center-btn');
    let hoverTimer = null;

    if (centerBtn) {
        centerBtn.addEventListener('click', () => {
            window.electronAPI.pieMenuAction('minimize-maximize');
        });

        // Hover Logic (2 seconds)
        centerBtn.addEventListener('mouseenter', () => {
            console.log('Hover started');
            hoverTimer = setTimeout(() => {
                console.log('Hover trigger');
                window.electronAPI.pieMenuAction('minimize-maximize');
            }, 2000);
        });

        centerBtn.addEventListener('mouseleave', () => {
            console.log('Hover ended');
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
        });
    }

    // Optional: Close if clicked outside (on the transparent body)
    document.body.addEventListener('click', (e) => {
        if (e.target === document.body) {
            console.log('Background clicked, closing menu');
            window.electronAPI.pieMenuAction('close');
        }
    });

    // Dynamic Rendering
    const container = document.getElementById('dynamic-segments-container');

    const standardItems = [
        { name: 'Flash', action: 'new-window-flash', type: 'standard' },
        { name: 'Thinking', action: 'new-window-thinking', type: 'standard' },
        { name: 'Pro', action: 'new-window-pro', type: 'standard' }
    ];

    function renderSegments(customPrompts = []) {
        if (!container) return;
        container.innerHTML = '';

        // Merge items: Standard items + Custom Prompts
        const allItems = [...standardItems];
        if (customPrompts && customPrompts.length > 0) {
            customPrompts.forEach(p => {
                allItems.push({
                    name: p.name,
                    content: p.content,
                    type: 'custom',
                    action: { type: 'custom-prompt', content: p.content }
                });
            });
        }

        const totalItems = allItems.length;
        const radius = 110;

        // Starting angle: -90 degrees (Top)
        // Step angle: 360 / totalItems
        const startAngle = -90;
        const stepAngle = 360 / totalItems;

        allItems.forEach((item, index) => {
            const angleDeg = startAngle + (stepAngle * index);
            const rad = angleDeg * (Math.PI / 180);

            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            // Wrapper handles the Radial Position
            // We center the wrapper at 50% 50%, then translate it specific X/Y
            const wrapper = document.createElement('div');
            wrapper.className = 'segment-wrapper';
            wrapper.style.position = 'absolute';
            wrapper.style.top = '50%';
            wrapper.style.left = '50%';
            wrapper.style.width = '0';
            wrapper.style.height = '0';
            wrapper.style.zIndex = '5';
            wrapper.style.transform = `translate(${x}px, ${y}px)`; // Fixed position

            // Content bubble sits inside wrapper, centered
            const content = document.createElement('div');
            content.className = item.type === 'standard' ? 'segment-bubble standard' : 'segment-bubble custom';
            content.textContent = item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name;
            if (item.content) content.title = item.content;

            if (item.name === 'Flash') content.classList.add('bubble-flash');
            if (item.name === 'Thinking') content.classList.add('bubble-thinking');
            if (item.name === 'Pro') content.classList.add('bubble-pro');

            // CSS will handle transform: translate(-50%, -50%) for the bubble to center it on the wrapper
            // And CSS :hover will handle scale.

            content.addEventListener('click', (e) => {
                e.stopPropagation();
                window.electronAPI.pieMenuAction(item.action);
            });

            wrapper.appendChild(content);
            container.appendChild(wrapper);
        });
    }

    if (window.electronAPI.onPieMenuData) {
        window.electronAPI.onPieMenuData((data) => {
            console.log('Received Pie Menu Data:', data);
            const prompts = data.prompts || [];
            renderSegments(prompts);
        });
    } else {
        // Initial render without custom data (fallback)
        renderSegments([]);
    }
});
