// ==UserScript==
// @name         Lyra Exporter Fetch (One-Click AI Chat Backup)
// @name:zh-CN 支持Claude、ChatGPT、Grok、Gemini、NotebookLM等多平台的全功能AI对话跨分支全局搜索文档PDF长截图导出管理工具
// @name:zh-TW   Lyra Exporter Fetch (一鍵 AI 對話備份)
// @name:ja      Lyra Exporter Fetch (ワンクリック AI チャットバックアップ)
// @name:ko      Lyra Exporter Fetch (원클릭 AI 채팅 백업)
// @name:es      Lyra Exporter Fetch (Backup de Chat AI con Un Clic)
// @name:pt      Lyra Exporter Fetch (Backup de Chat AI com Um Clique)
// @name:fr      Lyra Exporter Fetch (Sauvegarde de Chat AI en Un Clic)
// @name:de      Lyra Exporter Fetch (Ein-Klick AI-Chat-Backup)
// @description One-click export for Claude, ChatGPT, Grok, Gemini , Google AI Studio & NotebookLM. Backups all chat branches, artifacts, and attachments. Exports to JSON/Markdown/PDF/Editable Screenshots. The ultimate companion for Lyra Exporter to build your local AI knowledge base.
// @description:zh-CN  一键导出 Claude/ChatGPT/Gemini/Google AI Studio/NotebookLM 对话记录（支持分支、PDF、长截图）。保留完整对话分支、附加图片、LaTeX 公式、Artifacts、附件与思考过程。Lyra Exporter 的最佳搭档，打造您的本地 AI 知识库。
// @description:zh-TW 一鍵匯出 Claude、ChatGPT、Grok、Gemini、Google AI Studio 和 NotebookLM 的對話。備份所有聊天分支、Artifacts 和附件。匯出為 JSON/Markdown/PDF/可編輯截圖。Lyra Exporter 的終極配套工具，用於建構本地 AI 知識庫。
// @description:ja Claude、ChatGPT、Grok、Gemini、Google AI Studio、NotebookLM のワンクリックエクスポート。すべてのチャットブランチ、アーティファクト、添付ファイルをバックアップ。JSON/Markdown/PDF/編集可能なスクリーンショットにエクスポート。ローカル AI ナレッジベース構築のための Lyra Exporter の究極のコンパニオン。
// @description:ko Claude, ChatGPT, Grok, Gemini, Google AI Studio 및 NotebookLM 원클릭 내보내기. 모든 채팅 브랜치, 아티팩트 및 첨부 파일 백업. JSON/Markdown/PDF/편집 가능한 스크린샷으로 내보내기. 로컬 AI 지식 베이스 구축을 위한 Lyra Exporter의 궁극적인 동반자.
// @description:es Exportación con un clic para Claude, ChatGPT, Grok, Gemini, Google AI Studio y NotebookLM. Respalda todas las ramas de chat, artefactos y adjuntos. Exporta a JSON/Markdown/PDF/Capturas editables. El compañero definitivo de Lyra Exporter para construir tu base de conocimiento de IA local.
// @description:pt Exportação com um clique para Claude, ChatGPT, Grok, Gemini, Google AI Studio e NotebookLM. Faz backup de todas as ramificações de chat, artefatos e anexos. Exporta para JSON/Markdown/PDF/Capturas editáveis. O companheiro definitivo do Lyra Exporter para construir sua base de conhecimento de IA local.
// @description:fr Exportation en un clic pour Claude, ChatGPT, Grok, Gemini, Google AI Studio et NotebookLM. Sauvegarde toutes les branches de chat, artefacts et pièces jointes. Exporte vers JSON/Markdown/PDF/Captures modifiables. Le compagnon ultime de Lyra Exporter pour construire votre base de connaissances IA locale.
// @description:de Ein-Klick-Export für Claude, ChatGPT, Grok, Gemini, Google AI Studio und NotebookLM. Sichert alle Chat-Branches, Artefakte und Anhänge. Exportiert nach JSON/Markdown/PDF/Bearbeitbare Screenshots. Der ultimative Begleiter für Lyra Exporter zum Aufbau Ihrer lokalen AI-Wissensdatenbank.
// @namespace    userscript://lyra-conversation-exporter
// @version      8
// @homepage     https://github.com/Yalums/lyra-exporter/
// @supportURL   https://github.com/Yalums/lyra-exporter/issues
// @author       Yalums, Amir Harati, AlexMercer
// @match        https://claude.easychat.top/*
// @match        https://pro.easychat.top/*
// @match        https://claude.ai/*
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://grok.com/*
// @match        https://x.com/i/grok*
// @match        https://gemini.google.com/app/*
// @match        https://notebooklm.google.com/*
// @match        https://aistudio.google.com/*
// @include      *://gemini.google.com/*
// @include      *://notebooklm.google.com/*
// @include      *://aistudio.google.com/*
// @connect      googleusercontent.com
// @connect      lh3.googleusercontent.com
// @connect      assets.grok.com
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.js
// @license      GNU General Public License v3.0
// @downloadURL https://update.greasyfork.org/scripts/539579/Lyra%20Exporter%20Fetch%20%28One-Click%20AI%20Chat%20Backup%29.user.js
// @updateURL https://update.greasyfork.org/scripts/539579/Lyra%20Exporter%20Fetch%20%28One-Click%20AI%20Chat%20Backup%29.meta.js
// ==/UserScript==

    (function() {
        'use strict';
        if (window.lyraFetchInitialized) return;
        window.lyraFetchInitialized = true;

        // Wrap global prompt to avoid environments where prompt() is disabled
        try {
            const _origPrompt = window.prompt;
            window.prompt = function(message, defaultValue) {
                try {
                    if (typeof _origPrompt === 'function') return _origPrompt(message, defaultValue);
                } catch (e) {
                    console.warn('[Lyra] window.prompt() threw an error or is unsupported:', e && e.message);
                }
                // If prompt is unavailable, return the provided default value (or empty string)
                // This preserves execution flow where code expects a string rather than throwing.
                return typeof defaultValue !== 'undefined' && defaultValue !== null ? defaultValue : '';
            };
        } catch (e) {
            console.warn('[Lyra] Failed to override window.prompt():', e && e.message);
        }

        // Trusted Types support for CSP compatibility
        let trustedPolicy = null;
        if (typeof window.trustedTypes !== 'undefined' && window.trustedTypes.createPolicy) {
            try {
                trustedPolicy = window.trustedTypes.createPolicy('lyra-exporter-policy', {
                    createHTML: (input) => input
                });
                console.log('[Lyra] Trusted-Types policy created successfully');
            } catch (e) {
                console.warn('[Lyra] Failed to create Trusted-Types policy:', e);
            }
        }

        function safeSetInnerHTML(element, html) {
            if (!element) return;
            if (trustedPolicy) {
                element.innerHTML = trustedPolicy.createHTML(html);
            } else {
                element.innerHTML = html;
            }
        }

        const Config = {
            CONTROL_ID: 'lyra-controls',
            TOGGLE_ID: 'lyra-toggle-button',
            LANG_SWITCH_ID: 'lyra-lang-switch',
            TREE_SWITCH_ID: 'lyra-tree-mode-switch',
            IMAGE_SWITCH_ID: 'lyra-image-switch',
            CANVAS_SWITCH_ID: 'lyra-canvas-switch',
            WORKSPACE_TYPE_ID: 'lyra-workspace-type',
            MANUAL_ID_BTN: 'lyra-manual-id-btn',
            EXPORTER_URL: 'https://yalums.github.io/lyra-exporter/',
            EXPORTER_ORIGIN: 'https://yalums.github.io',
            TIMING: {
                SCROLL_DELAY: 250,
                SCROLL_TOP_WAIT: 1000,
                VERSION_STABLE: 1500,
                VERSION_SCAN_INTERVAL: 1000,
                HREF_CHECK_INTERVAL: 800,
                PANEL_INIT_DELAY: 2000,
                BATCH_EXPORT_SLEEP: 300,
                BATCH_EXPORT_YIELD: 0
            }
        };

        const State = {
            currentPlatform: (() => {
                const host = window.location.hostname;
                const path = window.location.pathname;
                console.log('[Lyra] Detecting platform, hostname:', host, 'path:', path);
                if (host.includes('claude.ai') || host.endsWith('easychat.top') || host.includes('.easychat.top')) {
                    console.log('[Lyra] Platform detected: claude');
                    return 'claude';
                }
                if (host.includes('chatgpt') || host.includes('openai')) {
                    console.log('[Lyra] Platform detected: chatgpt');
                    return 'chatgpt';
                }
                if (host.includes('grok.com') || (host.includes('x.com') && path.includes('/i/grok'))) {
                    console.log('[Lyra] Platform detected: grok');
                    return 'grok';
                }
                if (host.includes('gemini')) {
                    console.log('[Lyra] Platform detected: gemini');
                    return 'gemini';
                }
                if (host.includes('notebooklm')) {
                    console.log('[Lyra] Platform detected: notebooklm');
                    return 'notebooklm';
                }
                if (host.includes('aistudio')) {
                    console.log('[Lyra] Platform detected: aistudio');
                    return 'aistudio';
                }
                console.log('[Lyra] Platform detected: null (unknown)');
                return null;
            })(),
            isPanelCollapsed: localStorage.getItem('lyraExporterCollapsed') === 'true',
            includeImages: localStorage.getItem('lyraIncludeImages') === 'true',
            capturedUserId: localStorage.getItem('lyraClaudeUserId') || '',
            chatgptAccessToken: null,
            chatgptUserId: localStorage.getItem('lyraChatGPTUserId') || '',
            chatgptWorkspaceId: localStorage.getItem('lyraChatGPTWorkspaceId') || '',
            chatgptWorkspaceType: localStorage.getItem('lyraChatGPTWorkspaceType') || 'user',
            panelInjected: false,
            includeCanvas: localStorage.getItem('lyraIncludeCanvas') === 'true'
        };

        let collectedData = new Map();
        const LyraFlags = {
            hasRetryWithoutToolButton: false,
            lastCanvasContent: null,
            lastCanvasMessageIndex: -1
        };

        const i18n = {
            languages: {
                zh: {
                    loading: '加载中...', exporting: '导出中...', compressing: '压缩中...', preparing: '准备中...',
                    exportSuccess: '导出成功!', noContent: '没有可导出的对话内容。',
                    exportCurrentJSON: '导出当前', exportAllConversations: '导出全部',
                    branchMode: '多分支', includeImages: '含图像',
                    enterFilename: '请输入文件名(不含扩展名):', untitledChat: '未命名对话',
                    uuidNotFound: '未找到对话UUID!', fetchFailed: '获取对话数据失败',
                    exportFailed: '导出失败: ', gettingConversation: '获取对话',
                    withImages: ' (处理图片中...)', successExported: '成功导出', conversations: '个对话!',
                    manualUserId: '手动设置ID', enterUserId: '请输入您的组织ID (settings/account):',
                    userIdSaved: '用户ID已保存!',
                    workspaceType: '团队空间', userWorkspace: '个人区', teamWorkspace: '工作区',
                    manualWorkspaceId: '手动设置工作区ID', enterWorkspaceId: '请输入工作区ID (工作空间设置/工作空间 ID):',
                    workspaceIdSaved: '工作区ID已保存!', tokenNotFound: '未找到访问令牌!',
                    viewOnline: '预览对话',
                    loadFailed: '加载失败: ',
                    cannotOpenExporter: '无法打开 Lyra Exporter,请检查弹窗拦截',
                    versionTracking: '实时',
                    detectingConversations: '正在探测对话数量...',
                    foundConversations: '检测到',
                    selectExportCount: '请输入要导出最近的多少个对话 (输入 0 或留空导出全部):',
                    invalidNumber: '输入无效，请输入有效的数字',
                    exportCancelled: '已取消导出',
                },
                en: {
                    loading: 'Loading...', exporting: 'Exporting...', compressing: 'Compressing...', preparing: 'Preparing...',
                    exportSuccess: 'Export successful!', noContent: 'No conversation content to export.',
                    exportCurrentJSON: 'Export', exportAllConversations: 'Save All',
                    branchMode: 'Branch', includeImages: 'Images',
                    enterFilename: 'Enter filename (without extension):', untitledChat: 'Untitled Chat',
                    uuidNotFound: 'UUID not found!', fetchFailed: 'Failed to fetch conversation data',
                    exportFailed: 'Export failed: ', gettingConversation: 'Getting conversation',
                    withImages: ' (processing images...)', successExported: 'Successfully exported', conversations: 'conversations!',
                    manualUserId: 'Customize UUID', enterUserId: 'Organization ID (settings/account)',
                    userIdSaved: 'User ID saved!',
                    workspaceType: 'Workspace', userWorkspace: 'Personal', teamWorkspace: 'Team',
                    manualWorkspaceId: 'Set Workspace ID', enterWorkspaceId: 'Enter Workspace ID(Workspace settings/Workspace ID):',
                    workspaceIdSaved: 'Workspace ID saved!', tokenNotFound: 'Access token not found!',
                    viewOnline: 'Preview',
                    loadFailed: 'Load failed: ',
                    cannotOpenExporter: 'Cannot open Lyra Exporter, please check popup blocker',
                    versionTracking: 'Realtime',
                    detectingConversations: 'Detecting conversations...',
                    foundConversations: 'Found',
                    selectExportCount: 'How many recent conversations to export? (Enter 0 or leave empty for all):',
                    invalidNumber: 'Invalid input, please enter a valid number',
                    exportCancelled: 'Export cancelled',
                }
            },
            currentLang: localStorage.getItem('lyraExporterLanguage') || (navigator.language.startsWith('zh') ? 'zh' : 'en'),
            t: (key) => i18n.languages[i18n.currentLang]?.[key] || key,
            setLanguage: (lang) => {
                i18n.currentLang = lang;
                localStorage.setItem('lyraExporterLanguage', lang);
            },
            getLanguageShort() {
                return this.currentLang === 'zh' ? '简体中文' : 'English';
            }
        };

        const previewIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        const collapseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        const expandIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        const exportIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        const zipIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 11V9a7 7 0 0 0-7-7a7 7 0 0 0-7 7v2"></path><rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect></svg>';

        const ErrorHandler = {
            handle: (error, context, options = {}) => {
                const {
                    showAlert = true,
                    logToConsole = true,
                    userMessage = null
                } = options;

                const errorMsg = error?.message || String(error);
                const contextMsg = context ? `[${context}]` : '';

                if (logToConsole) {
                    console.error(`[Lyra] ${contextMsg}`, error);
                }

                if (showAlert) {
                    const displayMsg = userMessage || `${i18n.t('exportFailed')} ${errorMsg}`;
                    alert(displayMsg);
                }

                return false;
            }
        };

        const Utils = {
            sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

            sanitizeFilename: (name) => name.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').substring(0, 100),

            blobToBase64: (blob) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }),

            downloadJSON: (jsonString, filename) => {
                const blob = new Blob([jsonString], { type: 'application/json' });
                Utils.downloadFile(blob, filename);
            },

            downloadFile: (blob, filename) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            },

            setButtonLoading: (btn, text) => {
                btn.disabled = true;
                safeSetInnerHTML(btn, `<div class="lyra-loading"></div> <span>${text}</span>`);
            },

            restoreButton: (btn, originalContent) => {
                btn.disabled = false;
                safeSetInnerHTML(btn, originalContent);
            },

            createButton: (innerHTML, onClick, useInlineStyles = false) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'lyra-button';
                safeSetInnerHTML(btn, innerHTML);

                // Ensure button receives pointer events even if parent has restrictive styles
                btn.style.pointerEvents = 'auto';

                // Provide visible debug logging and safe handler invocation
                btn.addEventListener('click', (ev) => {
                    try {
                        ev.preventDefault();
                    } catch (e) {}
                    try {
                        console.log('[Lyra] Button clicked:', (btn.textContent || '').trim());
                    } catch (e) {}

                    try {
                        const result = onClick(btn);
                        // If handler returned a promise, attach a catch to report errors
                        if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                            result.catch(err => console.error('[Lyra] Async handler error:', err));
                        }
                    } catch (err) {
                        console.error('[Lyra] Button handler error:', err);
                    }
                });

                if (useInlineStyles) {
                    Object.assign(btn.style, {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        width: '100%',
                        maxWidth: '100%',
                        padding: '8px 12px',
                        margin: '8px 0',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        letterSpacing: '0.3px',
                        height: '32px',
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap'
                    });
                    // keep pointer-events override when using inline styles
                    btn.style.pointerEvents = 'auto';
                }

                return btn;
            },

            createToggle: (label, id, checked = false) => {
                const container = document.createElement('div');
                container.className = 'lyra-toggle';
                const labelSpan = document.createElement('span');
                labelSpan.className = 'lyra-toggle-label';
                labelSpan.textContent = label;

                const switchLabel = document.createElement('label');
                switchLabel.className = 'lyra-switch';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = id;
                input.checked = checked;

                const slider = document.createElement('span');
                slider.className = 'lyra-slider';

                switchLabel.appendChild(input);
                switchLabel.appendChild(slider);
                container.appendChild(labelSpan);
                container.appendChild(switchLabel);

                return container;
            },

            createProgressElem: (parent) => {
                const elem = document.createElement('div');
                elem.className = 'lyra-progress';
                parent.appendChild(elem);
                return elem;
            }
        };

    // Simple hash function for better deduplication
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * Extract canvas content from a DOM element
     * Supports code blocks, artifacts, interactive elements, and text content
     * @param {Element} root - The root element to extract canvas from (typically a model-response container)
     * @returns {Array} Array of canvas objects with type, content, and metadata
     */
    function extractCanvasFromElement(root) {
        const canvasData = [];
        const seen = new Set();
        if (!root || !(root instanceof Element)) return canvasData;

        // Enhanced code block detection with multiple selectors
        const codeBlockSelectors = [
            'code-block',
            'pre code',
            '.code-block',
            '[data-code-block]',
            '.artifact-code',
            'code-execution-result code'
        ];

        codeBlockSelectors.forEach((selector) => {
            const blocks = root.querySelectorAll(selector);
            blocks.forEach((block) => {
                const codeContent = block.textContent || block.innerText;
                if (!codeContent) return;
                const trimmed = codeContent.trim();
                if (!trimmed || trimmed.length < 5) return; // Skip very short content

                const hash = simpleHash(trimmed);
                if (seen.has(hash)) return;
                seen.add(hash);

                // Try to detect language from multiple sources
                let language = 'unknown';
                const langAttr = block.querySelector('[data-lang]');
                if (langAttr) {
                    language = langAttr.getAttribute('data-lang') || 'unknown';
                } else if (block.className) {
                    const match = block.className.match(/language-(\w+)/);
                    if (match) language = match[1];
                }

                canvasData.push({
                    type: 'code',
                    content: trimmed,
                    language: language,
                    selector: selector
                });
            });
        });

        // Artifact detection (Gemini's interactive components)
        const artifactSelectors = [
            '[data-artifact]',
            '.artifact-container',
            'artifact-element',
            '.interactive-canvas'
        ];

        artifactSelectors.forEach((selector) => {
            const artifacts = root.querySelectorAll(selector);
            artifacts.forEach((artifact) => {
                const content = artifact.textContent || artifact.innerText;
                if (!content) return;
                const trimmed = content.trim();
                if (!trimmed || trimmed.length < 5) return;

                const hash = simpleHash(trimmed);
                if (seen.has(hash)) return;
                seen.add(hash);

                canvasData.push({
                    type: 'artifact',
                    content: trimmed,
                    selector: selector
                });
            });
        });

        // Canvas element detection (actual HTML5 canvas)
        const canvasElements = root.querySelectorAll('canvas');
        canvasElements.forEach((canvas) => {
            // Try to get canvas context or data
            const canvasId = canvas.id || canvas.className || 'unnamed-canvas';
            const hash = simpleHash(canvasId + canvas.width + canvas.height);
            if (seen.has(hash)) return;
            seen.add(hash);

            canvasData.push({
                type: 'canvas_element',
                content: `Canvas element: ${canvasId} (${canvas.width}x${canvas.height})`,
                metadata: {
                    id: canvasId,
                    width: canvas.width,
                    height: canvas.height
                }
            });
        });

        return canvasData;
    }

    function extractGlobalCanvasContent() {
        const canvasData = [];
        const seen = new Set();

        let globalRetryLabel = '';
        try {
            const retryBtnGlobal = document.querySelector('button.retry-without-tool-button');
            if (retryBtnGlobal) {
                globalRetryLabel = (retryBtnGlobal.innerText || '').trim();
            }
        } catch (e) {
            globalRetryLabel = '';
        }

        const codeBlocks = document.querySelectorAll('code-block, pre code, .code-block');
        codeBlocks.forEach((block) => {
            const codeContent = block.textContent || block.innerText;
            if (!codeContent) return;
            const trimmed = codeContent.trim();
            if (!trimmed) return;
            const key = trimmed.substring(0, 100);
            if (seen.has(key)) return;
            seen.add(key);

            const langAttr = block.querySelector('[data-lang]');
            const language = langAttr ? langAttr.getAttribute('data-lang') || 'unknown' : 'unknown';
            canvasData.push({
                type: 'code',
                content: trimmed,
                language: language
            });
        });

        const responseElements = document.querySelectorAll('response-element, .model-response-text, .markdown');
        responseElements.forEach((element) => {
            if (element.closest('code-block') || element.querySelector('code-block')) return;
            let clone;
            try {
                clone = element.cloneNode(true);
                clone.querySelectorAll('button.retry-without-tool-button').forEach(btn => btn.remove());
            } catch (e) {
                clone = element;
            }
            let md = '';
            try {
                md = htmlToMarkdown(clone).trim();
            } catch (e) {
                const textContent = element.textContent || element.innerText;
                md = textContent ? textContent.trim() : '';
            }
            if (!md) return;
            const key = md.substring(0, 100);
            if (seen.has(key)) return;
            seen.add(key);
            canvasData.push({
                type: 'text',
                content: md
            });
        });

        return canvasData;
    }
        const LyraCommunicator = {
            open: async (jsonData, filename) => {
                try {
                    // Check if running within GeminiDesk (Electron) and use native PDF generation
                    if (window.electronAPI && window.electronAPI.generatePdfFromJson) {
                        window.electronAPI.generatePdfFromJson(jsonData, filename.replace('.json', ''));
                        return true;
                    }

                    const exporterWindow = window.open(Config.EXPORTER_URL, '_blank');
                    if (!exporterWindow) {
                        alert(i18n.t('cannotOpenExporter'));
                        return false;
                    }

                    const checkInterval = setInterval(() => {
                        try {
                            exporterWindow.postMessage({
                                type: 'LYRA_HANDSHAKE',
                                source: 'lyra-fetch-script'
                            }, Config.EXPORTER_ORIGIN);
                        } catch (e) {
                        }
                    }, 1000);

                    const handleMessage = (event) => {
                        if (event.origin !== Config.EXPORTER_ORIGIN) {
                            return;
                        }
                        if (event.data && event.data.type === 'LYRA_READY') {
                            clearInterval(checkInterval);
                            const dataToSend = {
                                type: 'LYRA_LOAD_DATA',
                                source: 'lyra-fetch-script',
                                data: {
                                    content: jsonData,
                                    filename: filename || `${State.currentPlatform}_export_${new Date().toISOString().slice(0,10)}.json`
                                }
                            };
                            exporterWindow.postMessage(dataToSend, Config.EXPORTER_ORIGIN);
                            window.removeEventListener('message', handleMessage);
                        }
                    };

                    window.addEventListener('message', handleMessage);

                    setTimeout(() => {
                        clearInterval(checkInterval);
                        window.removeEventListener('message', handleMessage);
                    }, 60000);

                    return true;
                } catch (error) {
                    alert(`${i18n.t('cannotOpenExporter')}: ${error.message}`);
                    return false;
                }
            }
        };

        const ClaudeHandler = {
        init: () => {
            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    function captureUserId(url) {
                        const match = url.match(/\\/api\\/organizations\\/([a-f0-9-]+)\\//);
                        if (match && match[1]) {
                            localStorage.setItem('lyraClaudeUserId', match[1]);
                            window.dispatchEvent(new CustomEvent('lyraUserIdCaptured', { detail: { userId: match[1] } }));
                        }
                    }
                    const originalXHROpen = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function() {
                        if (arguments[1]) captureUserId(arguments[1]);
                        return originalXHROpen.apply(this, arguments);
                    };
                    const originalFetch = window.fetch;
                    window.fetch = function(resource) {
                        const url = typeof resource === 'string' ? resource : (resource.url || '');
                        if (url) captureUserId(url);
                        return originalFetch.apply(this, arguments);
                    };
                })();
            `;
            (document.head || document.documentElement).appendChild(script);
            script.remove();
            window.addEventListener('lyraUserIdCaptured', (e) => {
                if (e.detail.userId) State.capturedUserId = e.detail.userId;
            });
        },
        addUI: (controlsArea) => {

            const treeMode = window.location.search.includes('tree=true');
            controlsArea.appendChild(Utils.createToggle(i18n.t('branchMode'), Config.TREE_SWITCH_ID, treeMode));

            controlsArea.appendChild(Utils.createToggle(i18n.t('includeImages'), Config.IMAGE_SWITCH_ID, State.includeImages));
            document.addEventListener('change', (e) => {
                if (e.target.id === Config.IMAGE_SWITCH_ID) {
                    State.includeImages = e.target.checked;
                    localStorage.setItem('lyraIncludeImages', State.includeImages);
                }
            });
        },
        addButtons: (controlsArea) => {
            controlsArea.appendChild(Utils.createButton(
                `${previewIcon} ${i18n.t('viewOnline')}`,
                async (btn) => {
                    const uuid = ClaudeHandler.getCurrentUUID();
                    if (!uuid) { alert(i18n.t('uuidNotFound')); return; }
                    if (!await ClaudeHandler.ensureUserId()) return;
                    const original = btn.innerHTML;
                    Utils.setButtonLoading(btn, i18n.t('loading'));
                    try {
                        const includeImages = document.getElementById(Config.IMAGE_SWITCH_ID)?.checked || false;
                        const data = await ClaudeHandler.getConversation(uuid, includeImages);
                        if (!data) throw new Error(i18n.t('fetchFailed'));
                        const jsonString = JSON.stringify(data, null, 2);
                        const filename = `claude_${data.name || 'conversation'}_${uuid.substring(0, 8)}.json`;
                        await LyraCommunicator.open(jsonString, filename);
                    } catch (error) {
                        ErrorHandler.handle(error, 'Preview conversation', {
                            userMessage: `${i18n.t('loadFailed')} ${error.message}`
                        });
                    } finally {
                        Utils.restoreButton(btn, original);
                    }
                }
            ));
            controlsArea.appendChild(Utils.createButton(
                `${exportIcon} ${i18n.t('exportCurrentJSON')}`,
                async (btn) => {
                    const uuid = ClaudeHandler.getCurrentUUID();
                    if (!uuid) { alert(i18n.t('uuidNotFound')); return; }
                    if (!await ClaudeHandler.ensureUserId()) return;
                    const filename = prompt(i18n.t('enterFilename'), Utils.sanitizeFilename(`claude_${uuid.substring(0, 8)}`));
                    if (!filename?.trim()) return;
                    const original = btn.innerHTML;
                    Utils.setButtonLoading(btn, i18n.t('exporting'));
                    try {
                        const includeImages = document.getElementById(Config.IMAGE_SWITCH_ID)?.checked || false;
                        const data = await ClaudeHandler.getConversation(uuid, includeImages);
                        if (!data) throw new Error(i18n.t('fetchFailed'));
                        Utils.downloadJSON(JSON.stringify(data, null, 2), `${filename.trim()}.json`);
                    } catch (error) {
                        ErrorHandler.handle(error, 'Export conversation');
                    } finally {
                        Utils.restoreButton(btn, original);
                    }
                }
            ));
            controlsArea.appendChild(Utils.createButton(
                `${zipIcon} ${i18n.t('exportAllConversations')}`,
                (btn) => ClaudeHandler.exportAll(btn, controlsArea)
            ));
        },
        getCurrentUUID: () => window.location.pathname.match(/\/chat\/([a-zA-Z0-9-]+)/)?.[1],
        ensureUserId: async () => {
            if (State.capturedUserId) return State.capturedUserId;
            const saved = localStorage.getItem('lyraClaudeUserId');
            if (saved) {
                State.capturedUserId = saved;
                return saved;
            }
            alert('未能检测到用户ID / User ID not detected');
            return null;
        },
        getBaseUrl: () => {
            if (window.location.hostname.includes('claude.ai')) {
                return 'https://claude.ai';
            } else if (window.location.hostname.includes('easychat.top')) {
                return `https://${window.location.hostname}`;
            }
            return window.location.origin;
        },
        getAllConversations: async () => {
            const userId = await ClaudeHandler.ensureUserId();
            if (!userId) return null;
            try {
                const response = await fetch(`${ClaudeHandler.getBaseUrl()}/api/organizations/${userId}/chat_conversations`);
                if (!response.ok) throw new Error('Fetch failed');
                return await response.json();
            } catch (error) {
                console.error('Get all conversations error:', error);
                return null;
            }
        },
        getConversation: async (uuid, includeImages = false) => {
            const userId = await ClaudeHandler.ensureUserId();
            if (!userId) return null;
            try {
                const treeMode = document.getElementById(Config.TREE_SWITCH_ID)?.checked || false;
                const endpoint = treeMode ?
                    `/api/organizations/${userId}/chat_conversations/${uuid}?tree=True&rendering_mode=messages&render_all_tools=true` :
                    `/api/organizations/${userId}/chat_conversations/${uuid}`;
                const apiUrl = `${ClaudeHandler.getBaseUrl()}${endpoint}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                if (includeImages && data.chat_messages) {
                    for (const msg of data.chat_messages) {
                        const fileArrays = ['files', 'files_v2', 'attachments'];
                        for (const key of fileArrays) {
                            if (Array.isArray(msg[key])) {
                                for (const file of msg[key]) {
                                    const isImage = file.file_kind === 'image' || file.file_type?.startsWith('image/');
                                    const imageUrl = file.preview_url || file.thumbnail_url || file.file_url;
                                    if (isImage && imageUrl && !file.embedded_image) {
                                        try {
                                            const fullUrl = imageUrl.startsWith('http') ? imageUrl : ClaudeHandler.getBaseUrl() + imageUrl;
                                            const imgResp = await fetch(fullUrl);
                                            if (imgResp.ok) {
                                                const blob = await imgResp.blob();
                                                const base64 = await Utils.blobToBase64(blob);
                                                file.embedded_image = { type: 'image', format: blob.type, size: blob.size, data: base64, original_url: imageUrl };
                                            }
                                        } catch (err) {
                                            console.error('Process image error:', err);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return data;
            } catch (error) {
                console.error('Get conversation error:', error);
                return null;
            }
        },
        exportAll: async (btn, controlsArea) => {
            if (typeof fflate === 'undefined' || typeof fflate.zipSync !== 'function' || typeof fflate.strToU8 !== 'function') {
                const errorMsg = i18n.currentLang === 'zh'
                    ? '批量导出功能需要压缩库支持。\n\n由于当前平台的安全策略限制,该功能暂时不可用。\n建议使用"导出当前"功能单个导出对话。'
                    : 'Batch export requires compression library.\n\nThis feature is currently unavailable due to platform security policies.\nPlease use "Export" button to export conversations individually.';
                alert(errorMsg);
                return;
            }
            if (!await ClaudeHandler.ensureUserId()) return;

            // 先探测对话数量
            const original = btn.innerHTML;
            Utils.setButtonLoading(btn, i18n.t('detectingConversations'));

            let allConvs;
            try {
                allConvs = await ClaudeHandler.getAllConversations();
                if (!allConvs || !Array.isArray(allConvs)) throw new Error(i18n.t('fetchFailed'));
            } catch (error) {
                ErrorHandler.handle(error, 'Detect conversations');
                Utils.restoreButton(btn, original);
                return;
            }

            const totalCount = allConvs.length;
            Utils.restoreButton(btn, original);

            // 弹出确认框让用户选择导出数量
            const promptMsg = i18n.currentLang === 'zh'
                ? `${i18n.t('foundConversations')} ${totalCount} ${i18n.t('conversations')}\n\n${i18n.t('selectExportCount')}`
                : `${i18n.t('foundConversations')} ${totalCount} ${i18n.t('conversations')}\n\n${i18n.t('selectExportCount')}`;

            const userInput = prompt(promptMsg, totalCount.toString());

            // 用户取消
            if (userInput === null) {
                alert(i18n.t('exportCancelled'));
                return;
            }

            // 解析用户输入
            let exportCount = totalCount;
            const trimmedInput = userInput.trim();

            if (trimmedInput !== '' && trimmedInput !== '0') {
                const parsed = parseInt(trimmedInput, 10);
                if (isNaN(parsed) || parsed < 0) {
                    alert(i18n.t('invalidNumber'));
                    return;
                }
                exportCount = Math.min(parsed, totalCount);
            }

            // 开始导出
            const progress = Utils.createProgressElem(controlsArea);
            progress.textContent = i18n.t('preparing');
            Utils.setButtonLoading(btn, i18n.t('exporting'));

            try {
                const includeImages = document.getElementById(Config.IMAGE_SWITCH_ID)?.checked || false;
                let exported = 0;

                // 只导出最近的 exportCount 个对话
                const convsToExport = allConvs.slice(0, exportCount);
                console.log(`Starting export of ${convsToExport.length} conversations (out of ${totalCount} total)`);

                const zipEntries = {};
                for (let i = 0; i < convsToExport.length; i++) {
                    const conv = convsToExport[i];
                    progress.textContent = `${i18n.t('gettingConversation')} ${i + 1}/${convsToExport.length}${includeImages ? i18n.t('withImages') : ''}`;
                    if (i > 0 && i % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, Config.TIMING.BATCH_EXPORT_YIELD));
                    } else if (i > 0) {
                        await Utils.sleep(Config.TIMING.BATCH_EXPORT_SLEEP);
                    }
                    try {
                        const data = await ClaudeHandler.getConversation(conv.uuid, includeImages);
                        if (data) {
                            const title = Utils.sanitizeFilename(data.name || conv.uuid);
                            const filename = `claude_${conv.uuid.substring(0, 8)}_${title}.json`;
                            zipEntries[filename] = fflate.strToU8(JSON.stringify(data, null, 2));
                            exported++;
                        }
                    } catch (error) {
                        console.error(`Failed to process ${conv.uuid}:`, error);
                    }
                }
                console.log(`Export complete: ${exported} files. Compressing...`);
                progress.textContent = `${i18n.t('compressing')}…`;

                const zipUint8 = fflate.zipSync(zipEntries, { level: 1 });
                const zipBlob = new Blob([zipUint8], { type: 'application/zip' });

                const zipFilename = `claude_export_${exportCount === totalCount ? 'all' : 'recent_' + exportCount}_${new Date().toISOString().slice(0, 10)}.zip`;
                Utils.downloadFile(zipBlob, zipFilename);
                alert(`${i18n.t('successExported')} ${exported} ${i18n.t('conversations')}`);
            } catch (error) {
                ErrorHandler.handle(error, 'Export all conversations');
            } finally {
                Utils.restoreButton(btn, original);
                if (progress.parentNode) progress.parentNode.removeChild(progress);
            }
        }
    };

    // Helper function to fetch images via GM_xmlhttpRequest (bypass CORS)
    function fetchViaGM(url, headers = {}) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest === 'undefined') {
                fetch(url, { headers }).then(r => {
                    if (r.ok) return r.blob();
                    return Promise.reject(new Error(`Status: ${r.status}`));
                }).then(resolve).catch(reject);
                return;
            }
            GM_xmlhttpRequest({
                method: "GET",
                url,
                headers,
                responseType: "blob",
                onload: r => {
                    if (r.status >= 200 && r.status < 300) {
                        resolve(r.response);
                    } else {
                        reject(new Error(`Status: ${r.status}`));
                    }
                },
                onerror: e => reject(new Error(e.statusText || 'Network error'))
            });
        });
    }

    // Process image element and return base64 data
    async function processImageElement(imgElement, accessToken = null) {
        if (!imgElement) return null;
        const url = imgElement.src;
        if (!url || url.startsWith('data:')) return null;

        try {
            let base64Data, mimeType, size;

            if (url.startsWith('blob:')) {
                try {
                    const blob = await fetch(url).then(r => r.ok ? r.blob() : Promise.reject());
                    base64Data = await Utils.blobToBase64(blob);
                    mimeType = blob.type;
                    size = blob.size;
                } catch {
                    // Canvas fallback
                    const canvas = document.createElement('canvas');
                    canvas.width = imgElement.naturalWidth || imgElement.width;
                    canvas.height = imgElement.naturalHeight || imgElement.height;
                    canvas.getContext('2d').drawImage(imgElement, 0, 0);

                    const isPhoto = canvas.width * canvas.height > 50000;
                    const dataURL = isPhoto ? canvas.toDataURL('image/jpeg', 0.85) : canvas.toDataURL('image/png');
                    mimeType = isPhoto ? 'image/jpeg' : 'image/png';
                    base64Data = dataURL.split(',')[1];
                    size = Math.round((base64Data.length * 3) / 4);
                }
            } else {
                const headers = {};
                if (url.includes('backend-api') && accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                const blob = await fetchViaGM(url, headers);
                base64Data = await Utils.blobToBase64(blob);
                mimeType = blob.type;
                size = blob.size;

                // Fix MIME type if it's octet-stream or empty
                if (!mimeType || mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
                    if (url.includes('.jpg') || url.includes('.jpeg')) {
                        mimeType = 'image/jpeg';
                    } else if (url.includes('.png')) {
                        mimeType = 'image/png';
                    } else if (url.includes('.gif')) {
                        mimeType = 'image/gif';
                    } else if (url.includes('.webp')) {
                        mimeType = 'image/webp';
                    } else {
                        // Detect from base64 magic bytes
                        const firstBytes = base64Data.substring(0, 20);
                        if (firstBytes.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
                        else if (firstBytes.startsWith('/9j/')) mimeType = 'image/jpeg';
                        else if (firstBytes.startsWith('R0lGOD')) mimeType = 'image/gif';
                        else if (firstBytes.startsWith('UklGR')) mimeType = 'image/webp';
                        else mimeType = 'image/png';
                    }
                }
            }

            return { type: 'image', format: mimeType, size, data: base64Data, original_src: url };
        } catch (e) {
            console.error('[ChatGPT] Failed to process image:', url.substring(0, 80));
            return null;
        }
    }

    const ChatGPTHandler = {
        init: () => {
            const rawFetch = window.fetch;
            window.fetch = async function(resource, options) {
                const headers = options?.headers;
                if (headers) {
                    let authHeader = null;
                    if (typeof headers === 'string') {
                        authHeader = headers;
                    } else if (headers instanceof Headers) {
                        authHeader = headers.get('Authorization');
                    } else {
                        authHeader = headers.Authorization || headers.authorization;
                    }

                    if (authHeader?.startsWith('Bearer ')) {
                        const token = authHeader.slice(7);
                        if (token && token.toLowerCase() !== 'dummy') {
                            State.chatgptAccessToken = token;
                        }
                    }
                }

                return rawFetch.apply(this, arguments);
            };
        },

        ensureAccessToken: async () => {
            if (State.chatgptAccessToken) return State.chatgptAccessToken;

            try {
                const response = await fetch('/api/auth/session?unstable_client=true');
                const session = await response.json();
                if (session.accessToken) {
                    State.chatgptAccessToken = session.accessToken;
                    return session.accessToken;
                }
            } catch (error) {
                console.error('Failed to get access token:', error);
            }

            return null;
        },

        getOaiDeviceId: () => {
            const cookieString = document.cookie;
            const match = cookieString.match(/oai-did=([^;]+)/);
            return match ? match[1] : null;
        },

        getCurrentConversationId: () => {
            const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
            return match ? match[1] : null;
        },

        getAllConversations: async () => {
            const token = await ChatGPTHandler.ensureAccessToken();
            if (!token) throw new Error(i18n.t('tokenNotFound'));

            const deviceId = ChatGPTHandler.getOaiDeviceId();
            if (!deviceId) throw new Error('Cannot get device ID');

            const headers = {
                'Authorization': `Bearer ${token}`,
                'oai-device-id': deviceId
            };

            if (State.chatgptWorkspaceType === 'team' && State.chatgptWorkspaceId) {
                headers['ChatGPT-Account-Id'] = State.chatgptWorkspaceId;
            }

            const allConversations = [];
            let offset = 0;
            let hasMore = true;

            while (hasMore) {
                const response = await fetch(`/backend-api/conversations?offset=${offset}&limit=28&order=updated`, { headers });
                if (!response.ok) throw new Error('Failed to fetch conversation list');

                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    allConversations.push(...data.items);
                    hasMore = data.items.length === 28;
                    offset += data.items.length;
                } else {
                    hasMore = false;
                }
            }

            return allConversations;
        },

        // Extract images from DOM for current conversation
        extractImagesFromDOM: async (conversationId, includeImages, accessToken = null) => {
            if (!includeImages) return {};

            const currentId = ChatGPTHandler.getCurrentConversationId();
            if (currentId !== conversationId) {
                console.log('[ChatGPT] Not current conversation, skipping DOM image extraction');
                return {};
            }

            const imageMap = {};
            let lastUserMessageId = null;  // 追踪最后的用户消息 ID，用于关联孤立的助手图片

            const messageGroups = document.querySelectorAll('[data-testid^="conversation-turn-"]');

            for (const group of messageGroups) {
                // 查找整个 group 中所有可能的 message-id
                const findMessageId = (container) => {
                    if (!container) return null;
                    return container.getAttribute('data-message-id') ||
                           container.closest('[data-message-id]')?.getAttribute('data-message-id') ||
                           group.querySelector('[data-message-id]')?.getAttribute('data-message-id');
                };

                // User messages - look for uploaded images
                const userContainer = group.querySelector('[data-message-author-role="user"]');
                if (userContainer) {
                    // 记录用户消息 ID，即使没有图片也要记录（用于关联后续的助手生成图片）
                    const userMessageId = findMessageId(userContainer);
                    if (userMessageId) {
                        lastUserMessageId = userMessageId;
                    }

                    // Find images in user message
                    const userImages = userContainer.querySelectorAll('img[src*="backend-api"], img[src*="files.oaiusercontent.com"], img[src*="oaiusercontent"]');
                    if (userImages.length > 0) {
                        const images = [];
                        for (const img of userImages) {
                            const imageData = await processImageElement(img, accessToken);
                            if (imageData) images.push(imageData);
                        }
                        if (images.length > 0 && lastUserMessageId) {
                            if (!imageMap[lastUserMessageId]) imageMap[lastUserMessageId] = {};
                            imageMap[lastUserMessageId].user = images;
                        }
                    }
                }

                // Assistant messages - look for generated images (including DALL-E generated images)
                const assistantContainer = group.querySelector('[data-message-author-role="assistant"]');
                
                // Collect all candidate assistant images from multiple sources
                const candidateImages = [];
                const seenSrcs = new Set();
                
                // Helper to add images without duplicates
                const addImages = (imgs) => {
                    for (const img of imgs) {
                        if (img.src && !seenSrcs.has(img.src)) {
                            seenSrcs.add(img.src);
                            candidateImages.push(img);
                        }
                    }
                };
                
                // 1. Images in assistant container
                if (assistantContainer) {
                    addImages(assistantContainer.querySelectorAll('img'));
                }
                
                // 2. AI-generated images - find by id pattern (image-xxxx)
                addImages(group.querySelectorAll('[id^="image-"] img'));
                
                // 3. Images with estuary/content URLs (generated content)
                addImages(group.querySelectorAll('img[src*="estuary/content"], img[src*="estuary"]'));
                
                // 4. Images with "已生成图片" or "Generated" alt text
                addImages(group.querySelectorAll('img[alt*="生成"], img[alt*="Generated"], img[alt*="generated"]'));
                
                // 5. Find imagegen containers by iterating through elements (handles class names with /)
                group.querySelectorAll('div').forEach(div => {
                    const classList = div.className || '';
                    if (classList.includes('imagegen') || classList.includes('image-gen')) {
                        addImages(div.querySelectorAll('img'));
                    }
                });
                
                // 6. Find by aria-label
                addImages(group.querySelectorAll('img[aria-label*="图片"], img[aria-label*="image"]'));
                
                // Exclude user images
                const userImgSrcs = new Set();
                group.querySelectorAll('[data-message-author-role="user"] img').forEach(img => userImgSrcs.add(img.src));
                
                const uniqueImages = candidateImages.filter(img => !userImgSrcs.has(img.src));

                if (uniqueImages.length > 0) {
                    const images = [];
                    for (const img of uniqueImages) {
                        // Skip loading/placeholder images (blurred intermediate images during generation)
                        // Check blur on img itself
                        const imgStyle = window.getComputedStyle(img);
                        const imgFilter = imgStyle.filter || imgStyle.webkitFilter || '';
                        if (imgFilter.includes('blur')) continue;

                        // Check blur on parent element (ChatGPT applies blur to parent div)
                        const parent = img.parentElement;
                        if (parent) {
                            const parentStyle = window.getComputedStyle(parent);
                            const parentFilter = parentStyle.filter || parentStyle.webkitFilter || '';
                            if (parentFilter.includes('blur')) continue;
                        }

                        // Skip images with loading/placeholder/pulse classes
                        const classList = img.className || '';
                        if (classList.includes('loading') || classList.includes('placeholder') ||
                            classList.includes('skeleton') || classList.includes('pulse')) continue;

                        // Skip images with loading aria attributes
                        if (img.getAttribute('aria-busy') === 'true' || img.getAttribute('data-loading') === 'true') continue;

                        // Wait for image to load if needed
                        if (!img.complete) {
                            await new Promise(r => {
                                img.onload = img.onerror = r;
                                setTimeout(r, 3000);
                            });
                        }

                        // Skip small images (icons/UI elements)
                        const width = img.naturalWidth || img.width || 0;
                        const height = img.naturalHeight || img.height || 0;
                        if (width < 50 || height < 50) continue;

                        const imageData = await processImageElement(img, accessToken);
                        if (imageData) images.push(imageData);
                    }
                    
                    if (images.length > 0) {
                        // 尝试多种方式获取 messageId
                        let messageId = findMessageId(assistantContainer);
                        
                        // 如果 assistantContainer 没有 messageId，尝试查找 group 中的任何 assistant 相关的 messageId
                        if (!messageId) {
                            // 方法1: 查找所有 data-message-id 属性
                            const allMessageIds = group.querySelectorAll('[data-message-id]');
                            for (const el of allMessageIds) {
                                const role = el.getAttribute('data-message-author-role');
                                if (role === 'assistant') {
                                    messageId = el.getAttribute('data-message-id');
                                    break;
                                }
                            }
                        }
                        
                        // 方法2: 在同一 group 中查找用户消息
                        if (!messageId) {
                            const userContainer = group.querySelector('[data-message-author-role="user"]');
                            const userMessageId = findMessageId(userContainer);
                            if (userMessageId) {
                                if (!imageMap[userMessageId]) imageMap[userMessageId] = {};
                                imageMap[userMessageId].assistant_generated = images;
                                continue;
                            }
                        }

                        // 方法3: 使用之前遍历过的用户消息 ID（跨 group 查找）
                        if (!messageId && lastUserMessageId) {
                            if (!imageMap[lastUserMessageId]) imageMap[lastUserMessageId] = {};
                            imageMap[lastUserMessageId].assistant_generated = images;
                            continue;
                        }

                        if (messageId) {
                            if (!imageMap[messageId]) imageMap[messageId] = {};
                            imageMap[messageId].assistant = images;
                        }
                    }
                }
            }

            return imageMap;
        },

        getConversation: async (conversationId, includeImages = false) => {
            const token = await ChatGPTHandler.ensureAccessToken();
            if (!token) {
                console.error('[ChatGPT] Token not found');
                throw new Error(i18n.t('tokenNotFound'));
            }

            const deviceId = ChatGPTHandler.getOaiDeviceId();
            if (!deviceId) {
                console.error('[ChatGPT] Device ID not found in cookies');
                throw new Error('Cannot get device ID');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'oai-device-id': deviceId
            };

            if (State.chatgptWorkspaceType === 'team' && State.chatgptWorkspaceId) {
                headers['ChatGPT-Account-Id'] = State.chatgptWorkspaceId;
            }

            const response = await fetch(`/backend-api/conversation/${conversationId}`, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[ChatGPT] Fetch failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    conversationId,
                    workspaceType: State.chatgptWorkspaceType
                });

                let errorMessage = `Failed to fetch conversation (${response.status}): ${errorText || response.statusText}`;
                if (response.status === 404) {
                    const currentMode = State.chatgptWorkspaceType === 'team' ? i18n.t('teamWorkspace') : i18n.t('userWorkspace');
                    const suggestMode = State.chatgptWorkspaceType === 'team' ? i18n.t('userWorkspace') : i18n.t('teamWorkspace');
                    errorMessage += `\n\n当前模式: ${currentMode}\n建议尝试切换到: ${suggestMode}`;
                    if (State.chatgptWorkspaceType === 'team') {
                        errorMessage += '并手动填写工作区ID';
                    } else {
                        errorMessage += '并手动填写个人ID';
                    }
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Extract and merge images from DOM if requested
            if (includeImages) {
                const imageMap = await ChatGPTHandler.extractImagesFromDOM(conversationId, includeImages, token);

                // Merge images into conversation data
                if (data.mapping && Object.keys(imageMap).length > 0) {
                    const messageIdToNodeId = {};
                    for (const nodeId in data.mapping) {
                        const node = data.mapping[nodeId];
                        if (node?.message?.id) {
                            messageIdToNodeId[node.message.id] = nodeId;
                        }
                    }

                    for (const [messageId, images] of Object.entries(imageMap)) {
                        const nodeId = messageIdToNodeId[messageId];
                        if (nodeId && data.mapping[nodeId]) {
                            if (!data.mapping[nodeId].lyra_images) {
                                data.mapping[nodeId].lyra_images = {};
                            }
                            if (images.user) {
                                data.mapping[nodeId].lyra_images.user = images.user;
                            }
                            if (images.assistant) {
                                data.mapping[nodeId].lyra_images.assistant = images.assistant;
                            }
                            if (images.assistant_generated) {
                                data.mapping[nodeId].lyra_images.assistant_generated = images.assistant_generated;
                            }
                        }
                    }
                }
            }

            return data;
        },

        previewConversation: async () => {
            const conversationId = ChatGPTHandler.getCurrentConversationId();
            if (!conversationId) {
                alert(i18n.t('uuidNotFound'));
                return;
            }

            try {
                const includeImages = State.includeImages || false;
                const data = await ChatGPTHandler.getConversation(conversationId, includeImages);
                const jsonString = JSON.stringify(data, null, 2);
                const filename = `chatgpt_${data.title || 'conversation'}_${conversationId.substring(0, 8)}.json`;
                await LyraCommunicator.open(jsonString, filename);
            } catch (error) {
                ErrorHandler.handle(error, 'Preview conversation', {
                    userMessage: `${i18n.t('loadFailed')} ${error.message}`
                });
            }
        },

        exportCurrent: async (btn) => {
            const conversationId = ChatGPTHandler.getCurrentConversationId();
            if (!conversationId) {
                alert(i18n.t('uuidNotFound'));
                return;
            }

            const original = btn.innerHTML;
            Utils.setButtonLoading(btn, i18n.t('exporting'));

            try {
                const includeImages = State.includeImages || false;
                const data = await ChatGPTHandler.getConversation(conversationId, includeImages);

                const filename = prompt(i18n.t('enterFilename'), data.title || i18n.t('untitledChat'));
                if (!filename) {
                    Utils.restoreButton(btn, original);
                    return;
                }

                Utils.downloadJSON(JSON.stringify(data, null, 2), `${Utils.sanitizeFilename(filename)}.json`);
            } catch (error) {
                ErrorHandler.handle(error, 'Export conversation');
            } finally {
                Utils.restoreButton(btn, original);
            }
        },

        exportAll: async (btn, controlsArea) => {
            if (typeof fflate === 'undefined' || typeof fflate.zipSync !== 'function' || typeof fflate.strToU8 !== 'function') {
                const errorMsg = i18n.currentLang === 'zh'
                    ? '批量导出功能需要压缩库支持。\n\n由于当前平台的安全策略限制,该功能暂时不可用。\n建议使用"导出当前"功能单个导出对话。'
                    : 'Batch export requires compression library.\n\nThis feature is currently unavailable due to platform security policies.\nPlease use "Export" button to export conversations individually.';
                alert(errorMsg);
                return;
            }

            // 先探测对话数量
            const original = btn.innerHTML;
            Utils.setButtonLoading(btn, i18n.t('detectingConversations'));

            let allConvs;
            try {
                allConvs = await ChatGPTHandler.getAllConversations();
                if (!allConvs || !Array.isArray(allConvs)) throw new Error(i18n.t('fetchFailed'));
            } catch (error) {
                ErrorHandler.handle(error, 'Detect conversations');
                Utils.restoreButton(btn, original);
                return;
            }

            const totalCount = allConvs.length;
            Utils.restoreButton(btn, original);

            // 弹出确认框让用户选择导出数量
            const promptMsg = i18n.currentLang === 'zh'
                ? `${i18n.t('foundConversations')} ${totalCount} ${i18n.t('conversations')}\n\n${i18n.t('selectExportCount')}`
                : `${i18n.t('foundConversations')} ${totalCount} ${i18n.t('conversations')}\n\n${i18n.t('selectExportCount')}`;

            const userInput = prompt(promptMsg, totalCount.toString());

            // 用户取消
            if (userInput === null) {
                alert(i18n.t('exportCancelled'));
                return;
            }

            // 解析用户输入
            let exportCount = totalCount;
            const trimmedInput = userInput.trim();

            if (trimmedInput !== '' && trimmedInput !== '0') {
                const parsed = parseInt(trimmedInput, 10);
                if (isNaN(parsed) || parsed < 0) {
                    alert(i18n.t('invalidNumber'));
                    return;
                }
                exportCount = Math.min(parsed, totalCount);
            }

            // 开始导出
            const progress = Utils.createProgressElem(controlsArea);
            progress.textContent = i18n.t('preparing');
            Utils.setButtonLoading(btn, i18n.t('exporting'));

            try {
                let exported = 0;
                const zipEntries = {};

                const includeImages = State.includeImages || false;
                const currentConvId = ChatGPTHandler.getCurrentConversationId();

                // 只导出最近的 exportCount 个对话
                const convsToExport = allConvs.slice(0, exportCount);
                console.log(`Starting export of ${convsToExport.length} conversations (out of ${totalCount} total)`);

                for (let i = 0; i < convsToExport.length; i++) {
                    const conv = convsToExport[i];
                    progress.textContent = `${i18n.t('gettingConversation')} ${i + 1}/${convsToExport.length}`;

                    if (i > 0 && i % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, Config.TIMING.BATCH_EXPORT_YIELD));
                    } else if (i > 0) {
                        await Utils.sleep(Config.TIMING.BATCH_EXPORT_SLEEP);
                    }

                    try {
                        // Note: DOM image extraction only works for the currently open conversation
                        const shouldExtractImages = includeImages && conv.id === currentConvId;
                        const data = await ChatGPTHandler.getConversation(conv.id, shouldExtractImages);
                        if (data) {
                            const title = Utils.sanitizeFilename(data.title || conv.id);
                            const filename = `chatgpt_${conv.id.substring(0, 8)}_${title}.json`;
                            zipEntries[filename] = fflate.strToU8(JSON.stringify(data, null, 2));
                            exported++;
                        }
                    } catch (error) {
                        console.error(`Failed to process ${conv.id}:`, error);
                    }
                }

                progress.textContent = `${i18n.t('compressing')}…`;
                const zipUint8 = fflate.zipSync(zipEntries, { level: 1 });
                const zipBlob = new Blob([zipUint8], { type: 'application/zip' });

                const zipFilename = `chatgpt_export_${exportCount === totalCount ? 'all' : 'recent_' + exportCount}_${new Date().toISOString().slice(0, 10)}.zip`;
                Utils.downloadFile(zipBlob, zipFilename);
                alert(`${i18n.t('successExported')} ${exported} ${i18n.t('conversations')}`);
            } catch (error) {
                ErrorHandler.handle(error, 'Export all conversations');
            } finally {
                Utils.restoreButton(btn, original);
                if (progress.parentNode) progress.parentNode.removeChild(progress);
            }
        },

        addUI: (controls) => {
            // Image inclusion toggle
            const imageToggle = Utils.createToggle(
                i18n.t('includeImages'),
                Config.IMAGE_SWITCH_ID,
                State.includeImages
            );

            const imageToggleInput = imageToggle.querySelector('input');
            imageToggleInput.addEventListener('change', (e) => {
                State.includeImages = e.target.checked;
                localStorage.setItem('lyraIncludeImages', State.includeImages);
                console.log('[ChatGPT] Include images:', State.includeImages);
            });

            controls.appendChild(imageToggle);

            // Workspace type toggle
            const initialLabel = State.chatgptWorkspaceType === 'team' ? i18n.t('teamWorkspace') : i18n.t('userWorkspace');
            const workspaceToggle = Utils.createToggle(
                initialLabel,
                Config.WORKSPACE_TYPE_ID,
                State.chatgptWorkspaceType === 'team'
            );

            const toggleInput = workspaceToggle.querySelector('input');
            const toggleLabel = workspaceToggle.querySelector('.lyra-toggle-label');

            toggleInput.addEventListener('change', (e) => {
                State.chatgptWorkspaceType = e.target.checked ? 'team' : 'user';
                localStorage.setItem('lyraChatGPTWorkspaceType', State.chatgptWorkspaceType);
                toggleLabel.textContent = e.target.checked ? i18n.t('teamWorkspace') : i18n.t('userWorkspace');
                console.log('[ChatGPT] Workspace type changed to:', State.chatgptWorkspaceType);
                UI.recreatePanel();
            });

            controls.appendChild(workspaceToggle);
        },

        addButtons: (controls) => {
            controls.appendChild(Utils.createButton(
                `${previewIcon} ${i18n.t('viewOnline')}`,
                () => ChatGPTHandler.previewConversation()
            ));

            controls.appendChild(Utils.createButton(
                `${exportIcon} ${i18n.t('exportCurrentJSON')}`,
                (btn) => ChatGPTHandler.exportCurrent(btn)
            ));

            controls.appendChild(Utils.createButton(
                `${zipIcon} ${i18n.t('exportAllConversations')}`,
                (btn) => ChatGPTHandler.exportAll(btn, controls)
            ));

            const idLabel = document.createElement('div');
            idLabel.className = 'lyra-input-trigger';

            if (State.chatgptWorkspaceType === 'user') {
                idLabel.textContent = `${i18n.t('manualUserId')}`;
                idLabel.addEventListener('click', () => {
                    const newId = prompt(i18n.t('enterUserId'));
                    if (newId?.trim()) {
                        State.chatgptUserId = newId.trim();
                        localStorage.setItem('lyraChatGPTUserId', State.chatgptUserId);
                        alert(i18n.t('userIdSaved'));
                    }
                });
            } else {
                idLabel.textContent = `${i18n.t('manualWorkspaceId')}`;
                idLabel.addEventListener('click', () => {
                    const newId = prompt(i18n.t('enterWorkspaceId'));
                    if (newId?.trim()) {
                        State.chatgptWorkspaceId = newId.trim();
                        localStorage.setItem('lyraChatGPTWorkspaceId', State.chatgptWorkspaceId);
                        alert(i18n.t('workspaceIdSaved'));
                    }
                });
            }

            controls.appendChild(idLabel);
        }
    };

    // Helper function to fetch images via GM_xmlhttpRequest (bypass CORS)
    function fetchViaGM(url, headers = {}) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest === 'undefined') {
                fetch(url, { headers }).then(r => {
                    if (r.ok) return r.blob();
                    return Promise.reject(new Error(`Status: ${r.status}`));
                }).then(blob => {
                    resolve(blob);
                }).catch(err => {
                    console.error('[Grok] Fetch failed:', err);
                    reject(err);
                });
                return;
            }

            GM_xmlhttpRequest({
                method: "GET",
                url,
                headers,
                responseType: "blob",
                onload: r => {
                    if (r.status >= 200 && r.status < 300) {
                        resolve(r.response);
                    } else {
                        console.error('[Grok] GM_xmlhttpRequest bad status:', r.status);
                        reject(new Error(`Status: ${r.status}`));
                    }
                },
                onerror: e => {
                    console.error('[Grok] GM_xmlhttpRequest error:', e);
                    reject(new Error(e.statusText || 'Network error'));
                },
                ontimeout: () => {
                    console.error('[Grok] GM_xmlhttpRequest timeout');
                    reject(new Error('Request timeout'));
                }
            });
        });
    }

    // Process image element and return base64 data
    async function processImageElement(imgElement) {
        if (!imgElement) return null;

        const url = imgElement.src;
        if (!url || url.startsWith('data:')) return null;

        try {
            let base64Data, mimeType, size;

            if (url.startsWith('blob:')) {
                try {
                    const blob = await fetch(url).then(r => r.ok ? r.blob() : Promise.reject());
                    base64Data = await Utils.blobToBase64(blob);
                    mimeType = blob.type;
                    size = blob.size;
                } catch (blobError) {
                    // Canvas fallback for blob URLs
                    const canvas = document.createElement('canvas');
                    canvas.width = imgElement.naturalWidth || imgElement.width;
                    canvas.height = imgElement.naturalHeight || imgElement.height;
                    canvas.getContext('2d').drawImage(imgElement, 0, 0);

                    const isPhoto = canvas.width * canvas.height > 50000;
                    const dataURL = isPhoto ? canvas.toDataURL('image/jpeg', 0.85) : canvas.toDataURL('image/png');
                    mimeType = isPhoto ? 'image/jpeg' : 'image/png';
                    base64Data = dataURL.split(',')[1];
                    size = Math.round((base64Data.length * 3) / 4);
                }
            } else {
                // Try Canvas method first (more reliable for already-loaded images)
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = imgElement.naturalWidth || imgElement.width;
                    canvas.height = imgElement.naturalHeight || imgElement.height;

                    if (canvas.width === 0 || canvas.height === 0) {
                        throw new Error('Image not loaded or has zero dimensions');
                    }

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(imgElement, 0, 0);

                    const isPhoto = canvas.width * canvas.height > 50000;
                    const dataURL = isPhoto ? canvas.toDataURL('image/jpeg', 0.85) : canvas.toDataURL('image/png');

                    mimeType = isPhoto ? 'image/jpeg' : 'image/png';
                    base64Data = dataURL.split(',')[1];
                    size = Math.round((base64Data.length * 3) / 4);
                } catch (canvasError) {
                    // Fallback to GM_xmlhttpRequest if Canvas fails (CORS issues)
                    console.warn('[Grok] Canvas method failed, using GM_xmlhttpRequest fallback:', canvasError.message);

                    const blob = await fetchViaGM(url);
                    base64Data = await Utils.blobToBase64(blob);
                    mimeType = blob.type;
                    size = blob.size;
                }

                // Fix MIME type if it's octet-stream or empty
                if (!mimeType || mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
                    if (url.includes('.jpg') || url.includes('.jpeg')) {
                        mimeType = 'image/jpeg';
                    } else if (url.includes('.png')) {
                        mimeType = 'image/png';
                    } else if (url.includes('.gif')) {
                        mimeType = 'image/gif';
                    } else if (url.includes('.webp')) {
                        mimeType = 'image/webp';
                    } else {
                        // Detect from base64 magic bytes
                        const firstBytes = base64Data.substring(0, 20);
                        if (firstBytes.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
                        else if (firstBytes.startsWith('/9j/')) mimeType = 'image/jpeg';
                        else if (firstBytes.startsWith('R0lGOD')) mimeType = 'image/gif';
                        else if (firstBytes.startsWith('UklGR')) mimeType = 'image/webp';
                        else mimeType = 'image/png';
                    }
                }
            }

            return { type: 'image', format: mimeType, size, data: base64Data, original_src: url };
        } catch (e) {
            console.error('[Grok] Failed to process image:', e);
            return null;
        }
    }

    const GrokHandler = {
        init: () => {
            // Grok doesn't require special initialization like token capture
            console.log('[Lyra] GrokHandler initialized');
        },

        getCurrentConversationId: () => {
            // Grok URL: https://grok.com/{conversationId} - ID is the last segment of path
            const pathSegments = window.location.pathname.split('/').filter(s => s);
            const lastSegment = pathSegments[pathSegments.length - 1];
            // Grok conversation IDs are typically UUID-like (36 chars) or similar long strings
            if (lastSegment && lastSegment.length >= 20) {
                return lastSegment;
            }
            return null;
        },

        getAllConversations: async () => {
            try {
                const response = await fetch('/rest/app-chat/conversations', {
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.status}`);
                const data = await response.json();
                return data.conversations || [];
            } catch (error) {
                console.error('[Lyra] Get all conversations error:', error);
                return null;
            }
        },

        getConversation: async (conversationId) => {
            try {
                // Step 1: Get all response nodes with tree structure
                const nodeUrl = `/rest/app-chat/conversations/${conversationId}/response-node?includeThreads=true`;
                const nodeResponse = await fetch(nodeUrl, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                });
                if (!nodeResponse.ok) throw new Error(`Failed to get response nodes: ${nodeResponse.status}`);
                const nodeData = await nodeResponse.json();
                const responseNodes = nodeData.responseNodes || [];
                const responseIds = responseNodes.map(node => node.responseId);

                if (!responseIds.length) {
                    return { conversationId, responses: [], title: null, conversationTree: null };
                }

                // Step 2: Load full conversation content
                const loadUrl = `/rest/app-chat/conversations/${conversationId}/load-responses`;
                const loadResponse = await fetch(loadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ responseIds })
                });
                if (!loadResponse.ok) throw new Error(`Failed to load responses: ${loadResponse.status}`);
                const conversationData = await loadResponse.json();

                // Step 3: Build tree structure map
                const nodeMap = new Map();
                responseNodes.forEach(node => {
                    nodeMap.set(node.responseId, {
                        responseId: node.responseId,
                        parentResponseId: node.parentResponseId || null,
                        childResponseIds: node.childResponseIds || [],
                        threadId: node.threadId || null
                    });
                });

                // Step 4: Process and structure the data
                const processedResponses = (conversationData.responses || [])
                    .filter(r => !r.partial)
                    .sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
                    .map(r => {
                        const processed = {
                            responseId: r.responseId,
                            sender: r.sender,
                            createTime: r.createTime,
                            message: r.message || ''
                        };

                        // Add tree structure information
                        const nodeInfo = nodeMap.get(r.responseId);
                        if (nodeInfo) {
                            processed.parentResponseId = nodeInfo.parentResponseId;
                            processed.childResponseIds = nodeInfo.childResponseIds;
                            if (nodeInfo.threadId) {
                                processed.threadId = nodeInfo.threadId;
                            }
                        }

                        // Process citations if present
                        if (r.sender === 'assistant' && r.cardAttachmentsJson && r.webSearchResults) {
                            const citations = [];
                            try {
                                r.cardAttachmentsJson.forEach(cardStr => {
                                    const card = JSON.parse(cardStr);
                                    if (card.cardType === 'citation_card' && card.url) {
                                        const searchResult = r.webSearchResults.find(sr => sr.url === card.url);
                                        citations.push({
                                            id: card.id,
                                            url: card.url,
                                            title: searchResult?.title || 'Source'
                                        });
                                    }
                                });
                            } catch (e) {
                                console.warn('[Lyra] Failed to parse cardAttachmentsJson:', e);
                            }
                            if (citations.length > 0) {
                                processed.citations = citations;
                            }
                            if (r.webSearchResults) {
                                processed.webSearchResults = r.webSearchResults;
                            }
                        }

                        // Include other potentially useful fields
                        if (r.attachments) processed.attachments = r.attachments;
                        if (r.cardAttachmentsJson) processed.cardAttachmentsJson = r.cardAttachmentsJson;
                        if (r.imageAttachments) processed.imageAttachments = r.imageAttachments;
                        if (r.fileAttachments) processed.fileAttachments = r.fileAttachments;

                        return processed;
                    });

                // Try to get conversation title from list if available
                let title = null;
                try {
                    const allConvs = await GrokHandler.getAllConversations();
                    const conv = allConvs?.find(c => c.conversationId === conversationId);
                    title = conv?.title || null;
                } catch (e) {
                    console.warn('[Lyra] Could not fetch title:', e);
                }

                // Step 5: Capture images from DOM if State.includeImages is true
                if (State.includeImages) {
                    const processedUrls = new Set();

                    // Method 1: Find AI-generated images by response ID containers
                    const messageContainers = document.querySelectorAll('[id^="response-"]');

                    for (const container of messageContainers) {
                        const responseId = container.id.replace('response-', '');
                        const response = processedResponses.find(r => r.responseId === responseId);
                        if (!response) continue;

                        const capturedImages = [];

                        // Capture AI-generated images (in data-testid="image-viewer" containers)
                        const generatedImgs = container.querySelectorAll('[data-testid="image-viewer"] img[src*="assets.grok.com"]');

                        for (const img of generatedImgs) {
                            // Skip blurred background images (they have filter style)
                            const parentStyle = img.parentElement?.style;
                            if (parentStyle && parentStyle.filter && parentStyle.filter.includes('blur')) {
                                continue;
                            }

                            // Skip if already processed
                            if (processedUrls.has(img.src)) continue;
                            processedUrls.add(img.src);

                            try {
                                const imageData = await processImageElement(img);
                                if (imageData) {
                                    capturedImages.push({
                                        ...imageData,
                                        source: 'ai_generated'
                                    });
                                }
                            } catch (e) {
                                console.error('[Grok] Failed to process AI image:', e);
                            }
                        }

                        // Add captured images to response
                        if (capturedImages.length > 0) {
                            response.capturedImages = capturedImages;
                            console.log(`[Grok] Captured ${capturedImages.length} AI-generated image(s) for response ${responseId}`);
                        }
                    }

                    // Method 2: Find user-uploaded images globally and match to human messages
                    // User uploads appear in figure elements with preview-image URLs
                    const allUserImages = document.querySelectorAll('figure img[src*="assets.grok.com"][src*="preview-image"]');

                    for (const img of allUserImages) {
                        if (processedUrls.has(img.src)) continue;
                        processedUrls.add(img.src);

                        try {
                            const imageData = await processImageElement(img);

                            if (imageData) {
                                // Find the closest human message (look for messages with fileAttachments)
                                const humanResponses = processedResponses.filter(r =>
                                    r.sender === 'human' &&
                                    r.fileAttachments &&
                                    r.fileAttachments.length > 0
                                );

                                // Add to the last human message with file attachments
                                if (humanResponses.length > 0) {
                                    const targetResponse = humanResponses[humanResponses.length - 1];
                                    if (!targetResponse.capturedImages) {
                                        targetResponse.capturedImages = [];
                                    }
                                    targetResponse.capturedImages.push({
                                        ...imageData,
                                        source: 'user_upload'
                                    });
                                    console.log(`[Grok] Captured user-uploaded image for response ${targetResponse.responseId}`);
                                } else {
                                    console.warn('[Grok] No human messages with file attachments found to attach user image');
                                }
                            }
                        } catch (e) {
                            console.error('[Grok] Failed to process user image:', e);
                        }
                    }
                }

                return {
                    conversationId,
                    title,
                    responses: processedResponses,
                    conversationTree: {
                        nodes: Array.from(nodeMap.values()),
                        rootNodeId: responseNodes.find(n => !n.parentResponseId)?.responseId || null
                    },
                    exportTime: new Date().toISOString(),
                    platform: 'grok'
                };
            } catch (error) {
                console.error('[Lyra] Get conversation error:', error);
                throw error;
            }
        },

        addUI: (controls) => {
            // Initialize includeImages to true by default for Grok if not set
            if (localStorage.getItem('lyraIncludeImages') === null) {
                State.includeImages = true;
                localStorage.setItem('lyraIncludeImages', 'true');
                console.log('[Grok] Initialized includeImages to true by default');
            }

            // Add "Include Images" toggle
            const imageToggle = Utils.createToggle(
                i18n.t('includeImages'),
                'lyra-include-images-toggle',
                State.includeImages,
                (e) => {
                    State.includeImages = e.target.checked;
                    localStorage.setItem('lyraIncludeImages', State.includeImages);
                    console.log('[Grok] Include images:', State.includeImages);
                }
            );
            controls.appendChild(imageToggle);
        },

        addButtons: (controls) => {
            controls.appendChild(Utils.createButton(
                `${previewIcon} ${i18n.t('viewOnline')}`,
                async (btn) => {
                    const conversationId = GrokHandler.getCurrentConversationId();
                    if (!conversationId) {
                        alert(i18n.t('uuidNotFound'));
                        return;
                    }
                    const original = btn.innerHTML;
                    Utils.setButtonLoading(btn, i18n.t('loading'));
                    try {
                        const data = await GrokHandler.getConversation(conversationId);
                        if (!data) throw new Error(i18n.t('fetchFailed'));
                        const jsonString = JSON.stringify(data, null, 2);
                        const filename = `grok_${data.title || 'conversation'}_${conversationId.substring(0, 8)}.json`;
                        await LyraCommunicator.open(jsonString, filename);
                    } catch (error) {
                        ErrorHandler.handle(error, 'Preview conversation', {
                            userMessage: `${i18n.t('loadFailed')} ${error.message}`
                        });
                    } finally {
                        Utils.restoreButton(btn, original);
                    }
                }
            ));

            controls.appendChild(Utils.createButton(
                `${exportIcon} ${i18n.t('exportCurrentJSON')}`,
                async (btn) => {
                    const conversationId = GrokHandler.getCurrentConversationId();
                    if (!conversationId) {
                        alert(i18n.t('uuidNotFound'));
                        return;
                    }
                    const filename = prompt(i18n.t('enterFilename'), Utils.sanitizeFilename(`grok_${conversationId.substring(0, 8)}`));
                    if (!filename?.trim()) return;
                    const original = btn.innerHTML;
                    Utils.setButtonLoading(btn, i18n.t('exporting'));
                    try {
                        const data = await GrokHandler.getConversation(conversationId);
                        if (!data) throw new Error(i18n.t('fetchFailed'));
                        Utils.downloadJSON(JSON.stringify(data, null, 2), `${filename.trim()}.json`);
                    } catch (error) {
                        ErrorHandler.handle(error, 'Export conversation');
                    } finally {
                        Utils.restoreButton(btn, original);
                    }
                }
            ));

            controls.appendChild(Utils.createButton(
                `${zipIcon} ${i18n.t('exportAllConversations')}`,
                (btn) => GrokHandler.exportAll(btn, controls)
            ));
        },

        exportAll: async (btn, controlsArea) => {
            if (typeof fflate === 'undefined' || typeof fflate.zipSync !== 'function' || typeof fflate.strToU8 !== 'function') {
                const errorMsg = i18n.currentLang === 'zh'
                    ? '批量导出功能需要压缩库支持。\n\n由于当前平台的安全策略限制,该功能暂时不可用。\n建议使用"导出当前"功能单个导出对话。'
                    : 'Batch export requires compression library.\n\nThis feature is currently unavailable due to platform security policies.\nPlease use "Export" button to export conversations individually.';
                alert(errorMsg);
                return;
            }

            // 先探测对话数量
            const original = btn.innerHTML;
            Utils.setButtonLoading(btn, i18n.t('detectingConversations'));

            let allConvs;
            try {
                allConvs = await GrokHandler.getAllConversations();
                if (!allConvs || !Array.isArray(allConvs)) throw new Error(i18n.t('fetchFailed'));
            } catch (error) {
                ErrorHandler.handle(error, 'Detect conversations');
                Utils.restoreButton(btn, original);
                return;
            }

            const totalCount = allConvs.length;
            Utils.restoreButton(btn, original);

            // 弹出确认框让用户选择导出数量
            const promptMsg = i18n.currentLang === 'zh'
                ? `${i18n.t('foundConversations')} ${totalCount} ${i18n.t('conversations')}\n\n${i18n.t('selectExportCount')}`
                : `${i18n.t('foundConversations')} ${totalCount} ${i18n.t('conversations')}\n\n${i18n.t('selectExportCount')}`;

            const userInput = prompt(promptMsg, totalCount.toString());

            // 用户取消
            if (userInput === null) {
                alert(i18n.t('exportCancelled'));
                return;
            }

            // 解析用户输入
            let exportCount = totalCount;
            const trimmedInput = userInput.trim();

            if (trimmedInput !== '' && trimmedInput !== '0') {
                const parsed = parseInt(trimmedInput, 10);
                if (isNaN(parsed) || parsed < 0) {
                    alert(i18n.t('invalidNumber'));
                    return;
                }
                exportCount = Math.min(parsed, totalCount);
            }

            // 开始导出
            const progress = Utils.createProgressElem(controlsArea);
            progress.textContent = i18n.t('preparing');
            Utils.setButtonLoading(btn, i18n.t('exporting'));

            try {
                let exported = 0;
                const zipEntries = {};

                // 只导出最近的 exportCount 个对话
                const convsToExport = allConvs.slice(0, exportCount);
                console.log(`[Grok] Starting export of ${convsToExport.length} conversations (out of ${totalCount} total)`);

                for (let i = 0; i < convsToExport.length; i++) {
                    const conv = convsToExport[i];
                    progress.textContent = `${i18n.t('gettingConversation')} ${i + 1}/${convsToExport.length}`;

                    if (i > 0 && i % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, Config.TIMING.BATCH_EXPORT_YIELD));
                    } else if (i > 0) {
                        await Utils.sleep(Config.TIMING.BATCH_EXPORT_SLEEP);
                    }

                    try {
                        const data = await GrokHandler.getConversation(conv.conversationId);
                        if (data) {
                            const title = Utils.sanitizeFilename(data.title || conv.conversationId);
                            const filename = `grok_${conv.conversationId.substring(0, 8)}_${title}.json`;
                            zipEntries[filename] = fflate.strToU8(JSON.stringify(data, null, 2));
                            exported++;
                        }
                    } catch (error) {
                        console.error(`[Lyra] Failed to process ${conv.conversationId}:`, error);
                    }
                }

                progress.textContent = `${i18n.t('compressing')}…`;
                const zipUint8 = fflate.zipSync(zipEntries, { level: 1 });
                const zipBlob = new Blob([zipUint8], { type: 'application/zip' });

                const zipFilename = `grok_export_${exportCount === totalCount ? 'all' : 'recent_' + exportCount}_${new Date().toISOString().slice(0, 10)}.zip`;
                Utils.downloadFile(zipBlob, zipFilename);
                alert(`${i18n.t('successExported')} ${exported} ${i18n.t('conversations')}`);
            } catch (error) {
                ErrorHandler.handle(error, 'Export all conversations');
            } finally {
                Utils.restoreButton(btn, original);
                if (progress.parentNode) progress.parentNode.removeChild(progress);
            }
        }
    };


// Version tracking system for Gemini (Optimized)
const VersionTracker = {
    tracker: null,
    scanInterval: null,
    hrefCheckInterval: null,
    currentHref: location.href,
    isTracking: false,
    isScanning: false,
    imageCache: new Map(),
    imagePool: new Map(),

    getImageHashKey: (img) => img ? `${img.size}-${img.format}-${img.data.substring(0, 100)}` : null,

    getOrFetchImage: async (imgElement, retries = 3) => {
        if (!imgElement.complete || !imgElement.naturalWidth) {
            await new Promise(r => {
                if (imgElement.complete) return r();
                imgElement.onload = imgElement.onerror = r;
                setTimeout(r, 2000);
            });
        }

        const url = imgElement.src;
        if (!url || url.startsWith('data:') || url.includes('drive-thirdparty.googleusercontent.com')) return null;
        if (VersionTracker.imageCache.has(url)) return VersionTracker.imageCache.get(url);

        for (let i = 1; i <= retries; i++) {
            try {
                const imageData = await processImageElement(imgElement);
                if (imageData) {
                    const hashKey = VersionTracker.getImageHashKey(imageData);
                    if (hashKey && VersionTracker.imagePool.has(hashKey)) {
                        const existing = VersionTracker.imagePool.get(hashKey);
                        VersionTracker.imageCache.set(url, existing);
                        return existing;
                    }
                    if (hashKey) VersionTracker.imagePool.set(hashKey, imageData);
                    VersionTracker.imageCache.set(url, imageData);
                    return imageData;
                }
            } catch (e) {
                if (i === retries) return null;
                await new Promise(r => setTimeout(r, 500 * i));
            }
        }
        return null;
    },

    createEmptyTracker: () => ({ turns: {}, order: [] }),

    resetTracker: (reason) => {
        VersionTracker.tracker = VersionTracker.createEmptyTracker();
        VersionTracker.imageCache.clear();
        VersionTracker.imagePool.clear();
    },

    startTracking: () => {
        if (VersionTracker.isTracking) return;
        VersionTracker.isTracking = true;
        VersionTracker.resetTracker();
        VersionTracker.scanInterval = setInterval(() => VersionTracker.scanOnce(), Config.TIMING.VERSION_SCAN_INTERVAL);
        VersionTracker.hrefCheckInterval = setInterval(() => {
            if (location.href !== VersionTracker.currentHref) {
                VersionTracker.currentHref = location.href;
                VersionTracker.resetTracker();
            }
        }, Config.TIMING.HREF_CHECK_INTERVAL);
    },

    stopTracking: () => {
        if (!VersionTracker.isTracking) return;
        VersionTracker.isTracking = false;
        clearInterval(VersionTracker.scanInterval);
        clearInterval(VersionTracker.hrefCheckInterval);
        VersionTracker.scanInterval = VersionTracker.hrefCheckInterval = null;
    },

    ensureTurn: (turnId) => {
        const tracker = VersionTracker.tracker;
        if (!tracker.turns[turnId]) {
            tracker.turns[turnId] = {
                id: turnId,
                userVersions: [], assistantVersions: [],
                userLastText: '', assistantCommittedText: '', assistantPendingText: '', assistantPendingSince: 0,
                userImages: new Map(), assistantImages: new Map()
            };
            tracker.order.push(turnId);
        }
        return tracker.turns[turnId];
    },

    getTurnId: (node, idx) => node.getAttribute?.('data-message-id') || node.getAttribute?.('data-id') || `turn-${idx}`,

    areImageListsEqual: (a, b) => {
        if (!a && !b) return true;
        if (!a || !b || a.length !== b.length) return false;
        return a.every((img, i) => img.size === b[i].size && img.data === b[i].data);
    },

    handleUser: (turnId, text, images = []) => {
        const t = VersionTracker.ensureTurn(turnId);
        const value = (text || '').trim();
        if (!value && !images.length) return;

        const last = t.userVersions.at(-1);
        const lastImages = last ? (t.userImages.get(last.version) || []) : [];
        const isTextSame = last?.text === value;
        const isImagesSame = VersionTracker.areImageListsEqual(lastImages, images);

        if (isTextSame && isImagesSame) return;
        if (last?.text && !value && isImagesSame) return; // Skip intermediate edit state

        const version = t.userVersions.length;
        t.userVersions.push({ version, type: version ? 'edit' : 'normal', text: value });
        if (images.length) t.userImages.set(version, images);
        t.userLastText = value;
    },

    handleAssistant: (turnId, domText, images = []) => {
        const t = VersionTracker.ensureTurn(turnId);
        const text = (domText || '').trim();
        if (!text && !images.length) return;

        const now = Date.now();
        if (text !== t.assistantPendingText) {
            t.assistantPendingText = text;
            t.assistantPendingSince = now;
            return;
        }
        if (now - t.assistantPendingSince < Config.TIMING.VERSION_STABLE) return;

        const userVersion = t.userVersions.at(-1)?.version ?? null;
        const last = t.assistantVersions.at(-1);
        const lastImages = last ? (t.assistantImages.get(last.version) || []) : [];

        if (last?.userVersion === userVersion && last?.text === text && VersionTracker.areImageListsEqual(lastImages, images)) {
            t.assistantPendingSince = now;
            return;
        }

        const version = t.assistantVersions.length;
        t.assistantVersions.push({ version, type: version ? 'retry' : 'normal', userVersion, text });
        if (images.length) t.assistantImages.set(version, images);
        t.assistantCommittedText = text;
    },

    scanOnce: async () => {
        if (VersionTracker.isScanning) return;
        VersionTracker.isScanning = true;

        try {
            const turns = document.querySelectorAll('div.conversation-turn, div.single-turn, div.conversation-container');
            if (!turns.length) return;

            const includeImages = document.getElementById(Config.IMAGE_SWITCH_ID)?.checked || false;

            for (const turn of turns) {
                const idx = Array.from(turns).indexOf(turn);
                const id = VersionTracker.getTurnId(turn, idx);
                let userImages = [], assistantImages = [];

                if (includeImages) {
                    const userImgEls = turn.querySelectorAll('user-query img, user-query-file-preview img, .file-preview-container img');
                    // 只获取 message-content 内的图片，排除 model-thoughts
                    const modelContent = turn.querySelector('model-response message-content');
                    const modelImgEls = modelContent?.querySelectorAll('img') || [];

                    if (userImgEls.length) userImages = (await Promise.all([...userImgEls].map(i => VersionTracker.getOrFetchImage(i)))).filter(Boolean);
                    if (modelImgEls.length) assistantImages = (await Promise.all([...modelImgEls].map(i => VersionTracker.getOrFetchImage(i)))).filter(Boolean);
                }

                VersionTracker.handleUser(id, VersionTracker.getUserText(turn), userImages);
                VersionTracker.handleAssistant(id, VersionTracker.getAssistantText(turn), assistantImages);
            }
        } finally {
            VersionTracker.isScanning = false;
        }
    },

    getUserText: (turn) => (turn.querySelector('user-query .query-text, .query-text-line, [data-user-text]')?.innerText || '').trim(),

    getAssistantText: (turn) => {
        // 严格只从 message-content 获取内容，完全排除 model-thoughts
        const messageContent = turn.querySelector('message-content');
        if (!messageContent) return '';
        
        // 优先选择 markdown-main-panel
        let panel = messageContent.querySelector('.markdown-main-panel');
        if (!panel) {
            // 回退：使用整个 message-content，但要排除思考过程
            panel = messageContent;
        }
        
        const clone = panel.cloneNode(true);
        // 移除所有不需要的元素
        clone.querySelectorAll('button.retry-without-tool-button, model-thoughts, .model-thoughts, .thoughts-header').forEach(b => b.remove());
        
        const text = htmlToMarkdown(clone);
        // 过滤掉只有思考标题的短文本（通常小于50字符且不包含换行）
        if (text.length < 50 && !text.includes('\n') && !text.includes('*') && !text.includes('#')) {
            // 可能是思考标题如"分析分析"、"Analyzing"etc，跳过
            return '';
        }
        return text;
    },

    buildVersionedData: (title) => {
        const { turns, order } = VersionTracker.tracker;
        const result = [];

        for (const id of order) {
            const t = turns[id];
            if (!t) continue;

            const mapVersions = (versions, imgMap) => versions
                .filter(v => v.text?.trim() || imgMap.get(v.version)?.length)
                .map(v => {
                    const d = { version: v.version, type: v.type, text: v.text };
                    if (v.userVersion !== undefined) d.userVersion = v.userVersion;
                    const imgs = imgMap.get(v.version);
                    if (imgs?.length) d.images = imgs;
                    return d;
                });

            result.push({
                turnIndex: result.length,
                human: t.userVersions.length ? { versions: mapVersions(t.userVersions, t.userImages) } : null,
                assistant: t.assistantVersions.length ? { versions: mapVersions(t.assistantVersions, t.assistantImages) } : null
            });
        }

        return { title: title || 'Gemini Chat', platform: 'gemini', exportedAt: new Date().toISOString(), conversation: result };
    }
};

VersionTracker.tracker = VersionTracker.createEmptyTracker();

window.lyraGeminiExport = (title) => VersionTracker.buildVersionedData(title || 'Gemini Chat');
window.lyraGeminiReset = () => VersionTracker.resetTracker();

function fetchViaGM(url) {
    return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === 'undefined') {
            fetch(url).then(r => r.ok ? r.blob() : Promise.reject(new Error(`Status: ${r.status}`))).then(resolve).catch(reject);
            return;
        }
        GM_xmlhttpRequest({
            method: "GET", url, responseType: "blob",
            onload: r => r.status >= 200 && r.status < 300 ? resolve(r.response) : reject(new Error(`Status: ${r.status}`)),
            onerror: e => reject(new Error(e.statusText || 'Network error'))
        });
    });
}

async function processImageElement(imgElement) {
    if (!imgElement) return null;
    const url = imgElement.src;
    if (!url || url.startsWith('data:') || url.includes('drive-thirdparty.googleusercontent.com')) return null;

    try {
        let base64Data, mimeType, size;

        if (url.startsWith('blob:')) {
            try {
                const blob = await fetch(url).then(r => r.ok ? r.blob() : Promise.reject());
                base64Data = await Utils.blobToBase64(blob);
                mimeType = blob.type;
                size = blob.size;
            } catch {
                // Canvas fallback
                const canvas = document.createElement('canvas');
                canvas.width = imgElement.naturalWidth || imgElement.width;
                canvas.height = imgElement.naturalHeight || imgElement.height;
                canvas.getContext('2d').drawImage(imgElement, 0, 0);

                const isPhoto = canvas.width * canvas.height > 50000;
                const dataURL = isPhoto ? canvas.toDataURL('image/jpeg', 0.85) : canvas.toDataURL('image/png');
                mimeType = isPhoto ? 'image/jpeg' : 'image/png';
                base64Data = dataURL.split(',')[1];
                size = Math.round((base64Data.length * 3) / 4);
            }
        } else {
            const blob = await fetchViaGM(url);
            base64Data = await Utils.blobToBase64(blob);
            mimeType = blob.type;
            size = blob.size;
        }

        return { type: 'image', format: mimeType, size, data: base64Data, original_src: url };
    } catch (e) {
        console.error('[LyraGemini] Failed to process image:', url, e);
        return null;
    }
}

const MD_TAGS = {
    h1: c => `\n# ${c}\n`, h2: c => `\n## ${c}\n`, h3: c => `\n### ${c}\n`,
    h4: c => `\n#### ${c}\n`, h5: c => `\n##### ${c}\n`, h6: c => `\n###### ${c}\n`,
    strong: c => `**${c}**`, b: c => `**${c}**`, em: c => `*${c}*`, i: c => `*${c}*`,
    hr: () => '\n---\n', br: () => '\n', p: c => `\n${c}\n`, div: c => c,
    blockquote: c => `\n> ${c.split('\n').join('\n> ')}\n`,
    table: c => `\n${c}\n`, thead: c => c, tbody: c => c, tr: c => `${c}|\n`,
    th: c => `| **${c}** `, td: c => `| ${c} `, li: c => c
};

function htmlToMarkdown(element) {
    if (!element) return '';

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        const tag = node.tagName.toLowerCase();
        const children = [...node.childNodes].map(processNode).join('');

        if (MD_TAGS[tag]) return MD_TAGS[tag](children);

        if (tag === 'code') {
            const inPre = node.parentElement?.tagName.toLowerCase() === 'pre';
            if (children.includes('\n') || inPre) return inPre ? children : `\n\`\`\`\n${children}\n\`\`\`\n`;
            return `\`${children}\``;
        }
        if (tag === 'pre') {
            const code = node.querySelector('code');
            if (code) {
                const lang = code.className.match(/language-(\w+)/)?.[1] || '';
                return `\n\`\`\`${lang}\n${code.textContent}\n\`\`\`\n`;
            }
            return `\n\`\`\`\n${children}\n\`\`\`\n`;
        }
        if (tag === 'a') {
            const href = node.getAttribute('href');
            return href ? `[${children}](${href})` : children;
        }
        if (tag === 'ul') return `\n${[...node.children].map(li => `- ${processNode(li)}`).join('\n')}\n`;
        if (tag === 'ol') return `\n${[...node.children].map((li, i) => `${i + 1}. ${processNode(li)}`).join('\n')}\n`;

        return children;
    }

    return processNode(element).replace(/^\s+/, '').replace(/\n{3,}/g, '\n\n').trim();
}

function getAIStudioScroller() {
    for (const sel of ['ms-chat-session ms-autoscroll-container', 'mat-sidenav-content', '.chat-view-container']) {
        const el = document.querySelector(sel);
        if (el && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) return el;
    }
    return document.documentElement;
}

async function extractDataIncremental_AiStudio(includeImages = true) {
    for (const turn of document.querySelectorAll('ms-chat-turn')) {
        if (collectedData.has(turn)) continue;

        const userEl = turn.querySelector('.chat-turn-container.user');
        const modelEl = turn.querySelector('.chat-turn-container.model');
        const turnData = { type: 'unknown', text: '', images: [] };

        if (userEl) {
            const textEl = userEl.querySelector('.user-prompt-container .turn-content');
            if (textEl) {
                let text = textEl.innerText.trim().replace(/^User\s*[\n:]?/i, '').trim();
                if (text) { turnData.type = 'user'; turnData.text = text; }
            }
            if (includeImages) {
                const imgs = userEl.querySelectorAll('.user-prompt-container img');
                turnData.images = (await Promise.all([...imgs].map(processImageElement))).filter(Boolean);
            }
        } else if (modelEl) {
            const chunks = modelEl.querySelectorAll('ms-prompt-chunk');
            const texts = [], imgPromises = [];

            chunks.forEach(chunk => {
                if (chunk.querySelector('ms-thought-chunk')) return;
                const cmark = chunk.querySelector('ms-cmark-node');
                if (cmark) {
                    const md = htmlToMarkdown(cmark);
                    if (md) texts.push(md);
                    if (includeImages) [...cmark.querySelectorAll('img')].forEach(i => imgPromises.push(processImageElement(i)));
                }
            });

            const text = texts.join('\n\n').trim();
            if (text) { turnData.type = 'model'; turnData.text = text; }
            if (includeImages) turnData.images = (await Promise.all(imgPromises)).filter(Boolean);
        }

        if (turnData.type !== 'unknown' && (turnData.text || turnData.images.length)) {
            collectedData.set(turn, turnData);
        }
    }
}

const ScraperHandler = {
    handlers: {
        gemini: {
            getTitle: () => {
                const input = prompt('请输入对话标题 / Enter title:', '对话');
                return input === null ? null : (input || i18n.t('untitledChat'));
            },
            extractData: async (includeImages = true) => {
                const data = [];
                const turns = document.querySelectorAll("div.conversation-turn, div.single-turn, div.conversation-container");

                for (const container of turns) {
                    const userEl = container.querySelector("user-query .query-text, .query-text-line");
                    // 严格只从 message-content 获取内容
                    const messageContent = container.querySelector("message-content");
                    const modelEl = messageContent?.querySelector(".markdown-main-panel");

                    const humanText = userEl?.innerText.trim() || "";
                    let assistantText = "";

                    if (modelEl) {
                        const clone = modelEl.cloneNode(true);
                        clone.querySelectorAll('button.retry-without-tool-button, model-thoughts, .model-thoughts, .thoughts-header').forEach(b => b.remove());
                        assistantText = htmlToMarkdown(clone);
                    } else if (messageContent) {
                        // 回退：使用整个 message-content
                        const clone = messageContent.cloneNode(true);
                        clone.querySelectorAll('button.retry-without-tool-button, model-thoughts, .model-thoughts, .thoughts-header').forEach(b => b.remove());
                        assistantText = htmlToMarkdown(clone);
                    }
                    
                    // 过滤掉只有思考标题的短文本
                    if (assistantText.length < 50 && !assistantText.includes('\n') && !assistantText.includes('*') && !assistantText.includes('#')) {
                        assistantText = "";
                    }

                    let userImages = [], modelImages = [];
                    if (includeImages) {
                        const uImgs = container.querySelectorAll("user-query img, user-query-file-preview img, .file-preview-container img");
                        // 只从 message-content 获取图片
                        const mImgs = messageContent?.querySelectorAll("img") || [];
                        userImages = (await Promise.all([...uImgs].map(processImageElement))).filter(Boolean);
                        modelImages = (await Promise.all([...mImgs].map(processImageElement))).filter(Boolean);
                    }

                    if (humanText || assistantText || userImages.length || modelImages.length) {
                        const human = { text: humanText };
                        const assistant = { text: assistantText };
                        if (userImages.length) human.images = userImages;
                        if (modelImages.length) assistant.images = modelImages;
                        data.push({ human, assistant });
                    }
                }
                return data;
            }
        },

        notebooklm: {
            getTitle: () => 'NotebookLM_' + new Date().toISOString().slice(0, 10),
            extractData: async (includeImages = true) => {
                const data = [];
                for (const turn of document.querySelectorAll("div.chat-message-pair")) {
                    let question = turn.querySelector("chat-message .from-user-container .message-text-content")?.innerText.trim() || "";
                    if (question.startsWith('[Preamble] ')) question = question.substring(11).trim();

                    let answer = "";
                    const answerEl = turn.querySelector("chat-message .to-user-container .message-text-content");
                    if (answerEl) {
                        const parts = [];
                        answerEl.querySelectorAll('labs-tailwind-structural-element-view-v2').forEach(el => {
                            let line = el.querySelector('.bullet')?.innerText.trim() + ' ' || '';
                            const para = el.querySelector('.paragraph');
                            if (para) {
                                let text = '';
                                para.childNodes.forEach(n => {
                                    if (n.nodeType === Node.TEXT_NODE) text += n.textContent;
                                    else if (n.nodeType === Node.ELEMENT_NODE && !n.querySelector?.('.citation-marker')) {
                                        text += n.classList?.contains('bold') ? `**${n.innerText}**` : (n.innerText || n.textContent || '');
                                    }
                                });
                                line += text;
                            }
                            if (line.trim()) parts.push(line.trim());
                        });
                        answer = parts.join('\n\n');
                    }

                    let userImages = [], modelImages = [];
                    if (includeImages) {
                        userImages = (await Promise.all([...turn.querySelectorAll("chat-message .from-user-container img")].map(processImageElement))).filter(Boolean);
                        modelImages = (await Promise.all([...turn.querySelectorAll("chat-message .to-user-container img")].map(processImageElement))).filter(Boolean);
                    }

                    if (question || answer || userImages.length || modelImages.length) {
                        const human = { text: question };
                        const assistant = { text: answer };
                        if (userImages.length) human.images = userImages;
                        if (modelImages.length) assistant.images = modelImages;
                        data.push({ human, assistant });
                    }
                }
                return data;
            }
        },

        aistudio: {
            getTitle: () => {
                const input = prompt('请输入对话标题 / Enter title:', 'AI_Studio_Chat');
                return input === null ? null : (input || 'AI_Studio_Chat');
            },
            extractData: async (includeImages = true) => {
                collectedData.clear();
                const scroller = getAIStudioScroller();
                scroller.scrollTop = 0;
                await Utils.sleep(Config.TIMING.SCROLL_TOP_WAIT);

                let lastScrollTop = -1;
                while (true) {
                    await extractDataIncremental_AiStudio(includeImages);
                    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 10) break;
                    lastScrollTop = scroller.scrollTop;
                    scroller.scrollTop += scroller.clientHeight * 0.85;
                    await Utils.sleep(Config.TIMING.SCROLL_DELAY);
                    if (scroller.scrollTop === lastScrollTop) break;
                }

                await extractDataIncremental_AiStudio(includeImages);
                await Utils.sleep(500);

                const sorted = [];
                document.querySelectorAll('ms-chat-turn').forEach(t => {
                    if (collectedData.has(t)) sorted.push(collectedData.get(t));
                });

                const paired = [];
                let lastHuman = null;

                for (const item of sorted) {
                    if (item.type === 'user') {
                        lastHuman = lastHuman || { text: '', images: [] };
                        lastHuman.text = (lastHuman.text ? lastHuman.text + '\n' : '') + item.text;
                        if (item.images?.length) lastHuman.images.push(...item.images);
                    } else if (item.type === 'model') {
                        const human = { text: lastHuman?.text || "[No preceding user prompt found]" };
                        if (lastHuman?.images?.length) human.images = lastHuman.images;
                        const assistant = { text: item.text };
                        if (item.images?.length) assistant.images = item.images;
                        paired.push({ human, assistant });
                        lastHuman = null;
                    }
                }

                if (lastHuman) {
                    const human = { text: lastHuman.text };
                    if (lastHuman.images?.length) human.images = lastHuman.images;
                    paired.push({ human, assistant: { text: "[Model response is pending]" } });
                }
                return paired;
            }
        }
    },

    buildConversationJson: async (platform, title) => {
        const handler = ScraperHandler.handlers[platform];
        if (!handler) throw new Error('Invalid platform handler');

        if (platform === 'gemini' && document.getElementById(Config.CANVAS_SWITCH_ID)?.checked) {
            return VersionTracker.buildVersionedData(title);
        }

        const includeImages = document.getElementById(Config.IMAGE_SWITCH_ID)?.checked || false;
        const conversation = await handler.extractData(includeImages);
        if (!conversation?.length) throw new Error(i18n.t('noContent'));

        return { title, platform, exportedAt: new Date().toISOString(), conversation };
    },

    addButtons: (controlsArea, platform) => {
        const handler = ScraperHandler.handlers[platform];
        if (!handler) return;

        const colors = { gemini: '#1a73e8', notebooklm: '#000000', aistudio: '#777779' };
        const color = colors[platform] || '#4285f4';
        const useInline = platform === 'notebooklm' || platform === 'gemini';

        const createToggle = (label, id, state, onChange) => {
            const toggle = Utils.createToggle(label, id, state);
            const input = toggle.querySelector('.lyra-switch input');
            if (input) {
                input.addEventListener('change', onChange);
                const slider = toggle.querySelector('.lyra-slider');
                if (slider) slider.style.setProperty('--theme-color', color);
            }
            return toggle;
        };

        if (platform === 'gemini') {
            controlsArea.appendChild(createToggle(i18n.t('versionTracking') || '版本追踪', Config.CANVAS_SWITCH_ID, State.includeCanvas, e => {
                State.includeCanvas = e.target.checked;
                localStorage.setItem('lyraIncludeCanvas', State.includeCanvas);
                e.target.checked ? VersionTracker.startTracking() : VersionTracker.stopTracking();
            }));
            if (State.includeCanvas) VersionTracker.startTracking();
        }

        if (platform === 'gemini' || platform === 'aistudio') {
            controlsArea.appendChild(createToggle(i18n.t('includeImages'), Config.IMAGE_SWITCH_ID, State.includeImages, e => {
                State.includeImages = e.target.checked;
                localStorage.setItem('lyraIncludeImages', State.includeImages);
            }));
        }

        const createActionBtn = (icon, label, action) => {
            const btn = Utils.createButton(`${icon} ${i18n.t(label)}`, action, useInline);
            if (useInline) Object.assign(btn.style, { backgroundColor: color, color: 'white' });
            return btn;
        };

        if (platform !== 'notebooklm') {
            controlsArea.appendChild(createActionBtn(previewIcon, 'viewOnline', async btn => {
                const title = handler.getTitle();
                if (!title) return;
                const original = btn.innerHTML;
                Utils.setButtonLoading(btn, i18n.t('loading'));
                let progress = platform === 'aistudio' ? Utils.createProgressElem(controlsArea) : null;
                if (progress) progress.textContent = i18n.t('loading');
                try {
                    const json = await ScraperHandler.buildConversationJson(platform, title);
                    const filename = `${platform}_${Utils.sanitizeFilename(title)}_${new Date().toISOString().slice(0, 10)}.json`;
                    await LyraCommunicator.open(JSON.stringify(json, null, 2), filename);
                } catch (e) {
                    ErrorHandler.handle(e, 'Preview conversation', { userMessage: `${i18n.t('loadFailed')} ${e.message}` });
                } finally {
                    Utils.restoreButton(btn, original);
                    progress?.remove();
                }
            }));
        }

        controlsArea.appendChild(createActionBtn(exportIcon, 'exportCurrentJSON', async btn => {
            const title = handler.getTitle();
            if (!title) return;
            const original = btn.innerHTML;
            Utils.setButtonLoading(btn, i18n.t('exporting'));
            let progress = platform === 'aistudio' ? Utils.createProgressElem(controlsArea) : null;
            if (progress) progress.textContent = i18n.t('exporting');
            try {
                const json = await ScraperHandler.buildConversationJson(platform, title);
                const filename = `${platform}_${Utils.sanitizeFilename(title)}_${new Date().toISOString().slice(0, 10)}.json`;
                Utils.downloadJSON(JSON.stringify(json, null, 2), filename);
            } catch (e) {
                ErrorHandler.handle(e, 'Export conversation');
            } finally {
                Utils.restoreButton(btn, original);
                progress?.remove();
            }
        }));
    }
};


    const UI = {

        injectStyle: () => {
            const platformColors = {
                claude: '#141413',
                chatgpt: '#10A37F',
                grok: '#000000',
                gemini: '#1a73e8',
                notebooklm: '#4285f4',
                aistudio: '#777779'
            };
            const buttonColor = platformColors[State.currentPlatform] || '#4285f4';
            console.log('[Lyra] Current platform:', State.currentPlatform);
            console.log('[Lyra] Button color:', buttonColor);
            document.documentElement.style.setProperty('--lyra-button-color', buttonColor);
            console.log('[Lyra] CSS variable --lyra-button-color set to:', buttonColor);
            const linkId = 'lyra-fetch-external-css';
                                    GM_addStyle(`
                #lyra-controls {
                    position: fixed !important;
                    top: 50% !important;
                    right: 0 !important;
                    transform: translateY(-50%) translateX(10px) !important;
                    background: white !important;
                    border: 1px solid #dadce0 !important;
                    border-radius: 8px !important;
                    padding: 16px 16px 8px 16px !important;
                    width: 136px !important;
                    z-index: 999999 !important;
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
                    transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }

                #lyra-controls.collapsed {
                    transform: translateY(-50%) translateX(calc(100% - 35px + 6px)) !important;
                    opacity: 0.6 !important;
                    background: white !important;
                    border-color: #dadce0 !important;
                    border-radius: 8px 0 0 8px !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                    pointer-events: none !important;
                }
                #lyra-controls.collapsed .lyra-main-controls {
                    opacity: 0 !important;
                    pointer-events: none !important;
                }

                #lyra-controls:hover {
                    opacity: 1 !important;
                }

                #lyra-toggle-button {
                    position: absolute !important;
                    left: 0 !important;
                    top: 50% !important;
                    transform: translateY(-50%) translateX(-50%) !important;
                    cursor: pointer !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #ffffff !important;
                    color: var(--lyra-button-color) !important;
                    border-radius: 50% !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
                    border: 1px solid #dadce0 !important;
                    transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    z-index: 1000 !important;
                    pointer-events: all !important;
                }

                #lyra-controls.collapsed #lyra-toggle-button {
                    z-index: 2 !important;
                    left: 16px !important;
                    transform: translateY(-50%) translateX(-50%) !important;
                    width: 21px !important;
                    height: 21px !important;
                    background: var(--lyra-button-color) !important;
                    color: white !important;
                }

                #lyra-controls.collapsed #lyra-toggle-button:hover {
                    box-shadow:
                        0 4px 12px rgba(0,0,0,0.25),
                        0 0 0 3px rgba(255,255,255,0.9) !important;
                    transform: translateY(-50%) translateX(-50%) scale(1.15) !important;
                    opacity: 0.9 !important;
                }

                .lyra-main-controls {
                    margin-left: 0px !important;
                    padding: 0 3px !important;
                    transition: opacity 0.7s !important;
                }

                .lyra-title {
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    color: #202124 !important;
                    text-align: center;
                    margin-bottom: 12px !important;
                    padding-bottom: 0px !important;
                    letter-spacing: 0.3px !important;
                }

                .lyra-input-trigger {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 3px !important;
                    font-size: 10px !important;
                    margin: 10px auto 0 auto !important;
                    padding: 2px 6px !important;
                    border-radius: 3px !important;
                    background: transparent !important;
                    cursor: pointer !important;
                    transition: all 0.15s !important;
                    white-space: nowrap !important;
                    color: #5f6368 !important;
                    border: none !important;
                    font-weight: 500 !important;
                    width: fit-content !important;
                }

                .lyra-input-trigger:hover {
                    background: #f1f3f4 !important;
                    color: #202124 !important;
                }

                .lyra-button {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: 8px !important;
                    width: 100% !important;
                    padding: 8px 12px !important;
                    margin: 8px 0 !important;
                    border: none !important;
                    border-radius: 6px !important;
                    background: var(--lyra-button-color) !important;
                    color: white !important;
                    font-size: 11px !important;
                    font-weight: 500 !important;
                    cursor: pointer !important;
                    letter-spacing: 0.3px !important;
                    height: 32px !important;
                    box-sizing: border-box !important;
                }
                .lyra-button svg {
                    width: 16px !important;
                    height: 16px !important;
                    flex-shrink: 0 !important;
                }
                .lyra-button:disabled {
                    opacity: 0.6 !important;
                    cursor: not-allowed !important;
                }

                .lyra-status {
                    font-size: 10px !important;
                    padding: 6px 8px !important;
                    border-radius: 4px !important;
                    margin: 4px 0 !important;
                    text-align: center !important;
                }
                .lyra-status.success {
                    background: #e8f5e9 !important;
                    color: #2e7d32 !important;
                    border: 1px solid #c8e6c9 !important;
                }
                .lyra-status.error {
                    background: #ffebee !important;
                    color: #c62828 !important;
                    border: 1px solid #ffcdd2 !important;
                }

                .lyra-toggle {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    font-size: 11px !important;
                    font-weight: 500 !important;
                    color: #5f6368 !important;
                    margin: 3px 0 !important;
                    gap: 8px !important;
                    padding: 4px 8px !important;
                }

                .lyra-toggle:last-of-type {
                    margin-bottom: 14px !important;
                }

                .lyra-switch {
                    position: relative !important;
                    display: inline-block !important;
                    width: 32px !important;
                    height: 16px !important;
                    flex-shrink: 0 !important;
                }
                .lyra-switch input {
                    opacity: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                .lyra-slider {
                    position: absolute !important;
                    cursor: pointer !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background-color: #ccc !important;
                    transition: .3s !important;
                    border-radius: 34px !important;
                    --theme-color: var(--lyra-button-color);
                }
                .lyra-slider:before {
                    position: absolute !important;
                    content: "" !important;
                    height: 12px !important;
                    width: 12px !important;
                    left: 2px !important;
                    bottom: 2px !important;
                    background-color: white !important;
                    transition: .3s !important;
                    border-radius: 50% !important;
                }
                input:checked + .lyra-slider {
                    background-color: var(--theme-color, var(--lyra-button-color)) !important;
                }
                input:checked + .lyra-slider:before {
                    transform: translateX(16px) !important;
                }

                .lyra-loading {
                    display: inline-block !important;
                    width: 14px !important;
                    height: 14px !important;
                    border: 2px solid rgba(255, 255, 255, 0.3) !important;
                    border-radius: 50% !important;
                    border-top-color: #fff !important;
                    animation: lyra-spin 0.8s linear infinite !important;
                }
                @keyframes lyra-spin {
                    to { transform: rotate(360deg); }
                }

                .lyra-progress {
                    font-size: 10px !important;
                    color: #5f6368 !important;
                    margin-top: 4px !important;
                    text-align: center !important;
                    padding: 4px !important;
                    background: #f8f9fa !important;
                    border-radius: 4px !important;
                }

                .lyra-lang-toggle {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 3px !important;
                    font-size: 10px !important;
                    margin: 4px auto 0 auto !important;
                    padding: 2px 6px !important;
                    border-radius: 3px !important;
                    background: transparent !important;
                    cursor: pointer !important;
                    transition: all 0.15s !important;
                    white-space: nowrap !important;
                    color: #5f6368 !important;
                    border: none !important;
                    font-weight: 500 !important;
                    width: fit-content !important;
                }
                .lyra-lang-toggle:hover {
                    background: #f1f3f4 !important;
                    color: #202124 !important;
                }
            `);
        },

        toggleCollapsed: () => {
            State.isPanelCollapsed = !State.isPanelCollapsed;
            localStorage.setItem('lyraExporterCollapsed', State.isPanelCollapsed);
            const panel = document.getElementById(Config.CONTROL_ID);
            const toggle = document.getElementById(Config.TOGGLE_ID);
            if (!panel || !toggle) return;
            if (State.isPanelCollapsed) {
                panel.classList.add('collapsed');
                safeSetInnerHTML(toggle, collapseIcon);
            } else {
                panel.classList.remove('collapsed');
                safeSetInnerHTML(toggle, expandIcon);
            }
        },

        recreatePanel: () => {
            document.getElementById(Config.CONTROL_ID)?.remove();
            State.panelInjected = false;
            UI.createPanel();
        },

        createPanel: () => {
            if (document.getElementById(Config.CONTROL_ID) || State.panelInjected) return false;

            const container = document.createElement('div');
            container.id = Config.CONTROL_ID;

            // 修复easychat不加载配色（就近生效）
            const color = getComputedStyle(document.documentElement)
            .getPropertyValue('--lyra-button-color')
            .trim() || '#141413';
            container.style.setProperty('--lyra-button-color', color);

            if (State.isPanelCollapsed) container.classList.add('collapsed');

            if (State.currentPlatform === 'notebooklm' || State.currentPlatform === 'gemini') {
                Object.assign(container.style, {
                    position: 'fixed',
                    top: '50%',
                    right: '0',
                    transform: 'translateY(-50%) translateX(10px)',
                    background: 'white',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    padding: '16px 16px 8px 16px',
                    width: '136px',
                    zIndex: '999999',
                    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                    transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    boxSizing: 'border-box'
                });
            }

            const toggle = document.createElement('div');
            toggle.id = Config.TOGGLE_ID;
            safeSetInnerHTML(toggle, State.isPanelCollapsed ? collapseIcon : expandIcon);
            toggle.addEventListener('click', UI.toggleCollapsed);
            container.appendChild(toggle);

            const controls = document.createElement('div');
            controls.className = 'lyra-main-controls';

            if (State.currentPlatform === 'notebooklm' || State.currentPlatform === 'gemini') {
                Object.assign(controls.style, {
                    marginLeft: '0px',
                    padding: '0 3px',
                    transition: 'opacity 0.7s'
                });
            }

            const title = document.createElement('div');
            title.className = 'lyra-title';
            const titles = { claude: 'Claude', chatgpt: 'ChatGPT', grok: 'Grok', gemini: 'Gemini', notebooklm: 'Note LM', aistudio: 'AI Studio' };
            title.textContent = titles[State.currentPlatform] || 'Exporter';
            controls.appendChild(title);

            if (State.currentPlatform === 'claude') {
                ClaudeHandler.addUI(controls);
                ClaudeHandler.addButtons(controls);

                const inputLabel = document.createElement('div');
                inputLabel.className = 'lyra-input-trigger';
                inputLabel.textContent = `${i18n.t('manualUserId')}`;
                inputLabel.addEventListener('click', () => {
                    const newId = prompt(i18n.t('enterUserId'), State.capturedUserId);
                    if (newId?.trim()) {
                        State.capturedUserId = newId.trim();
                        localStorage.setItem('lyraClaudeUserId', State.capturedUserId);
                        alert(i18n.t('userIdSaved'));
                        UI.recreatePanel();
                    }
                });
                controls.appendChild(inputLabel);
            } else if (State.currentPlatform === 'chatgpt') {
                ChatGPTHandler.addUI(controls);
                ChatGPTHandler.addButtons(controls);
            } else if (State.currentPlatform === 'grok') {
                GrokHandler.addUI(controls);
                GrokHandler.addButtons(controls);
            } else {
                ScraperHandler.addButtons(controls, State.currentPlatform);
            }

            const langToggle = document.createElement('div');
            langToggle.className = 'lyra-lang-toggle';
            langToggle.textContent = `🌐 ${i18n.getLanguageShort()}`;
            langToggle.addEventListener('click', () => {
                i18n.setLanguage(i18n.currentLang === 'zh' ? 'en' : 'zh');
                UI.recreatePanel();
            });
            controls.appendChild(langToggle);

            container.appendChild(controls);
            document.body.appendChild(container);
            State.panelInjected = true;

            const panel = document.getElementById(Config.CONTROL_ID);
            if (State.isPanelCollapsed) {
                panel.classList.add('collapsed');
                safeSetInnerHTML(toggle, collapseIcon);
            } else {
                panel.classList.remove('collapsed');
                safeSetInnerHTML(toggle, expandIcon);
            }

            return true;
        }
    };

    const init = () => {
        if (!State.currentPlatform) return;

        if (State.currentPlatform === 'claude') ClaudeHandler.init();
        if (State.currentPlatform === 'chatgpt') ChatGPTHandler.init();
        if (State.currentPlatform === 'grok') GrokHandler.init();

        UI.injectStyle();

        const initPanel = () => {
            UI.createPanel();
            if (State.currentPlatform === 'claude' || State.currentPlatform === 'chatgpt' || State.currentPlatform === 'grok') {
                let lastUrl = window.location.href;
                new MutationObserver(() => {
                    if (window.location.href !== lastUrl) {
                        lastUrl = window.location.href;
                        setTimeout(() => {
                            if (!document.getElementById(Config.CONTROL_ID)) {
                                UI.createPanel();
                            }
                        }, 1000);
                    }
                }).observe(document.body, { childList: true, subtree: true });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(initPanel, Config.TIMING.PANEL_INIT_DELAY));
        } else {
            setTimeout(initPanel, Config.TIMING.PANEL_INIT_DELAY);
        }
    };


        init();
    })();