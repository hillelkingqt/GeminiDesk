// Export Manager Module

const { BrowserWindow, dialog, shell, app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const translations = require('../translations.js');

let settings = null;
let pendingPdfExportData = null;
let exportFormatWin = null;
let pdfDirectionWin = null;
let selectedExportFormat = null;
let selectedPdfDirection = null;

function initialize(deps) {
    settings = deps.settings;
}

function registerIpcHandlers() {
    ipcMain.on('export-chat', (event) => {
        handleExportChat(event);
    });

    ipcMain.on('select-export-format', (event, format) => {
        handleSelectExportFormat(event, format);
    });

    ipcMain.on('select-pdf-direction', (event, direction) => {
        handleSelectPdfDirection(event, direction);
    });

    ipcMain.on('cancel-pdf-export', () => {
        closeExportWindows();
        pendingPdfExportData = null;
        selectedPdfDirection = null;
        selectedExportFormat = null;
    });
}

function openFormatChoiceWindow(parentWin) {
    if (exportFormatWin) {
        exportFormatWin.focus();
        return;
    }

    exportFormatWin = new BrowserWindow({
        width: 550,
        height: 450,
        frame: false,
        resizable: false,
        show: false,
        parent: parentWin,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
        }
    });

    exportFormatWin.loadFile('export-format-choice.html');

    exportFormatWin.once('ready-to-show', () => {
        if (exportFormatWin) exportFormatWin.show();
    });

    exportFormatWin.on('closed', () => {
        exportFormatWin = null;
        if (!selectedExportFormat) {
            pendingPdfExportData = null;
        }
        if (selectedExportFormat !== 'pdf') {
            selectedExportFormat = null;
        }
    });
}

function openPdfDirectionWindow(parentWin) {
    if (pdfDirectionWin) {
        pdfDirectionWin.focus();
        return;
    }

    pdfDirectionWin = new BrowserWindow({
        width: 550,
        height: 450,
        frame: false,
        resizable: false,
        show: false,
        parent: parentWin,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
        }
    });

    pdfDirectionWin.loadFile('pdf-direction-choice.html');

    pdfDirectionWin.once('ready-to-show', () => {
        if (pdfDirectionWin) pdfDirectionWin.show();
    });

    pdfDirectionWin.on('closed', () => {
        pdfDirectionWin = null;
        if (!selectedPdfDirection) {
            pendingPdfExportData = null;
            selectedExportFormat = null;
        }
    });
}

async function exportToMarkdown(win, title, chatHTML) {
    try {
        const userLang = settings.language || 'en';
        const t = translations[userLang] || translations.en;
        const userLabel = t['pdf-user-label'] || 'You:';
        const modelLabel = t['pdf-model-label'] || 'Gemini:';

        const { filePath } = await dialog.showSaveDialog(win, {
            title: 'Export Chat to Markdown',
            defaultPath: `${(title || 'chat').replace(/[\\/:*?"<>|]/g, '')}.md`,
            filters: [{ name: 'Markdown Files', extensions: ['md'] }]
        });

        if (!filePath) {
            console.log('User cancelled MD export.');
            return;
        }

        function htmlToMarkdown(html) {
            let result = html;
            const latexMap = new Map();
            let latexCounter = 0;

            result = result.replace(/<annotation[^>]*encoding=["']application\/x-tex["'][^>]*>([\s\S]*?)<\/annotation>/gi, (_, latex) => {
                const placeholder = `__LATEX_${latexCounter}__`;
                latexMap.set(placeholder, latex.trim());
                latexCounter++;
                return placeholder;
            });

            result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
                const placeholder = `__LATEX_DISPLAY_${latexCounter}__`;
                latexMap.set(placeholder, `$$${latex.trim()}$$`);
                latexCounter++;
                return placeholder;
            });

            result = result.replace(/\$([^\$\n]+?)\$/g, (match, latex) => {
                if (/^\d+([.,]\d+)?$/.test(latex.trim())) return match;
                const placeholder = `__LATEX_INLINE_${latexCounter}__`;
                latexMap.set(placeholder, `$${latex.trim()}$`);
                latexCounter++;
                return placeholder;
            });

            result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, latex) => {
                const placeholder = `__LATEX_DISPLAY_${latexCounter}__`;
                latexMap.set(placeholder, `$$${latex.trim()}$$`);
                latexCounter++;
                return placeholder;
            });

            result = result.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
                const placeholder = `__LATEX_INLINE_${latexCounter}__`;
                latexMap.set(placeholder, `$${latex.trim()}$`);
                latexCounter++;
                return placeholder;
            });

            result = result.replace(/<math[\s\S]*?<\/math>/gi, '');
            result = result.replace(/<svg[\s\S]*?<\/svg>/gi, '');
            result = result.replace(/<span[^>]*class="[^"]*katex[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
            result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

            const images = [];
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
            let imgMatch;
            while ((imgMatch = imgRegex.exec(result)) !== null) {
                const imgSrc = imgMatch[1];
                const imgAlt = imgMatch[2] || 'Image';
                if (imgSrc && imgSrc.startsWith('http')) {
                    images.push({ src: imgSrc, alt: imgAlt });
                }
            }
            result = result.replace(/<img[^>]*>/gi, '');

            result = result.replace(/<pre[^>]*(?:data-language="([^"]*)")?[^>]*>\s*<code[^>]*(?:class="[^"]*language-([^"]*)[^"]*")?[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
                (_, dataLang, classLang, code) => {
                    const lang = dataLang || classLang || '';
                    const cleanCode = code
                        .replace(/<[^>]+>/g, '')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");
                    return `\n\`\`\`${lang}\n${cleanCode.trim()}\n\`\`\`\n`;
                });

            result = result.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
                const cleanCode = code
                    .replace(/<[^>]+>/g, '')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                return `\n\`\`\`\n${cleanCode.trim()}\n\`\`\`\n`;
            });

            result = result.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, code) => {
                if (code.includes('__LATEX_')) return code;
                return `\`${code.replace(/<[^>]+>/g, '')}\``;
            });

            result = result.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
                const cleanText = text.replace(/<[^>]+>/g, '').trim();
                return `\n${'#'.repeat(parseInt(level))} ${cleanText}\n\n`;
            });

            result = result.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
            result = result.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
            result = result.replace(/<(del|s|strike)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~');
            result = result.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
            result = result.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '==$1==');

            result = result.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
                const cleanContent = content.replace(/<[^>]+>/g, '').trim();
                return `- ${cleanContent}\n`;
            });
            result = result.replace(/<\/?[ou]l[^>]*>/gi, '\n');

            result = result.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
                const lines = content.replace(/<[^>]+>/g, '').trim().split('\n');
                return lines.map(line => `> ${line}`).join('\n') + '\n';
            });

            result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
                let md = '\n';
                const rows = tableContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
                let isHeader = true;
                rows.forEach(row => {
                    const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
                    const cellContents = cells.map(cell => {
                        return cell.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/i, '$1')
                            .replace(/<[^>]+>/g, '')
                            .trim();
                    });
                    if (cellContents.length > 0) {
                        md += '| ' + cellContents.join(' | ') + ' |\n';
                        if (isHeader) {
                            md += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
                            isHeader = false;
                        }
                    }
                });
                return md + '\n';
            });

            result = result.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
                const cleanText = text.replace(/<[^>]+>/g, '').trim();
                return `[${cleanText}](${href})`;
            });

            result = result.replace(/<br\s*\/?>/gi, '\n');
            result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
            result = result.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');
            result = result.replace(/<hr[^>]*>/gi, '\n---\n');
            result = result.replace(/<[^>]+>/g, '');

            result = result
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
                .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

            latexMap.forEach((latex, placeholder) => {
                if (placeholder.includes('DISPLAY')) {
                    result = result.replace(new RegExp(placeholder, 'g'), `\n\n${latex}\n\n`);
                } else {
                    result = result.replace(new RegExp(placeholder, 'g'), latex.includes('$$') ? latex : `$${latex}$`);
                }
            });

            result = result.replace(/\n{3,}/g, '\n\n');
            result = result.trim();

            let imagesMd = '';
            images.forEach(img => {
                imagesMd += `![${img.alt}](${img.src})\n\n`;
            });

            return imagesMd + result;
        }

        let mdContent = `# ${title}\n\n`;

        chatHTML.forEach(message => {
            if (message.type === 'user') {
                mdContent += `## ${userLabel}\n\n`;
                mdContent += htmlToMarkdown(message.html);
                mdContent += '\n\n---\n\n';
            } else {
                mdContent += `## ${modelLabel}\n\n`;
                mdContent += htmlToMarkdown(message.html);
                mdContent += '\n\n---\n\n';
            }
        });

        fs.writeFileSync(filePath, mdContent, 'utf-8');

        console.log(`MD successfully saved to ${filePath}`);

        if (settings.openFileAfterExport) {
            shell.openPath(filePath).catch(err => {
                console.error('Failed to open MD file:', err);
            });
        }

        dialog.showMessageBox(win, {
            type: 'info',
            title: 'Export Successful',
            message: 'Chat exported successfully to Markdown!',
            buttons: ['OK']
        });

    } catch (err) {
        console.error('Failed to export to Markdown:', err);
        dialog.showErrorBox('Export Error', 'Failed to export chat to Markdown.');
    }
}

async function exportToPdf(win, title, chatHTML, direction) {
    try {
        const { filePath } = await dialog.showSaveDialog(win, {
            title: 'Export Chat to PDF',
            defaultPath: `${(title || 'chat').replace(/[\\/:*?"<>|]/g, '')}.pdf`,
            filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
        });

        if (!filePath) {
            console.log('User cancelled PDF export.');
            return;
        }

        const tempHtmlPath = path.join(app.getPath('temp'), `gemini-chat-${Date.now()}.html`);

        const katexCssPath = require.resolve('katex/dist/katex.min.css');
        const katexJsPath = require.resolve('katex/dist/katex.min.js');
        const katexAutoPath = require.resolve('katex/dist/contrib/auto-render.min.js');
        const katexDistDir = path.dirname(katexCssPath);

        function inlineKatexFonts(css) {
            return css.replace(/url\((?:\.\.\/)?fonts\/([^)]+\.(woff2|woff|ttf))\)/g, (_m, file) => {
                try {
                    const fontPath = path.join(katexDistDir, 'fonts', file);
                    const data = fs.readFileSync(fontPath).toString('base64');
                    const ext = file.split('.').pop();
                    const mimeType = ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : 'font/ttf';
                    return `url(data:${mimeType};base64,${data})`;
                } catch (e) {
                    return _m;
                }
            });
        }

        const katexCSS = inlineKatexFonts(fs.readFileSync(katexCssPath, 'utf8'));
        const katexJS = fs.readFileSync(katexJsPath, 'utf8');
        const katexAuto = fs.readFileSync(katexAutoPath, 'utf8');

        const userLang = settings.language || 'en';
        const t = translations[userLang] || translations.en;
        const userLabel = t['pdf-user-label'] || 'You:';
        const modelLabel = t['pdf-model-label'] || 'Gemini:';

        const isRTL = direction === 'rtl';
        const borderSide = isRTL ? 'border-right' : 'border-left';
        const textAlign = isRTL ? 'right' : 'left';

        let htmlContent = `<!DOCTYPE html>
<html dir="${direction}">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>` + katexCSS + `</style>
    <script>` + katexJS + `</script>
    <script>` + katexAuto + `</script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        /* PDF specific styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, system-ui, sans-serif; padding: 20px; font-size: 14px; line-height: 1.5; }
        h1 { text-align: center; color: #1967d2; border-bottom: 2px solid #1967d2; margin-bottom: 12px; }
        .message { margin-bottom: 10px; padding: 12px 14px; border-radius: 8px; }
        .user-message { background: #e3f2fd; ${borderSide}: 3px solid #1967d2; margin-${isRTL ? 'left' : 'right'}: 30px; }
        .model-message { background: #f5f5f5; ${borderSide}: 3px solid #5f6368; margin-${isRTL ? 'right' : 'left'}: 30px; }
        .message-header { font-weight: 600; font-size: 12px; opacity: 0.8; margin-bottom: 8px; }
        .message-content pre { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 0; margin: 16px 0; overflow-x: auto; direction: ltr !important; text-align: left !important; }
        .message-content pre code { display: block; padding: 12px; border: none; font-family: monospace; }
        .pdf-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <h1>${title}</h1>
`;

        chatHTML.forEach(message => {
            if (message.type === 'user') {
                htmlContent += `<div class="message user-message"><div class="message-header">${userLabel}</div><div class="message-content">${message.html}</div></div>`;
            } else {
                htmlContent += `<div class="message model-message"><div class="message-header">${modelLabel}</div><div class="message-content">${message.html}</div></div>`;
            }
        });

        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        htmlContent += `<div class="pdf-footer"><p>Exported from GeminiDesk • ${currentDate}</p></div>`;

        // Scripts...
        htmlContent += `
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof renderMathInElement !== 'undefined') {
                    renderMathInElement(document.body, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '\\\\[', right: '\\\\]', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\\\(', right: '\\\\)', display: false}
                        ],
                        throwOnError: false
                    });
                }
            });
        </script>
        </body></html>`;

        // Images placeholder logic
        htmlContent = htmlContent.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (match, imgUrl) => {
            if (match.includes('class="katex-svg"')) return match;
            return `<div style="padding: 10px; border: 1px dashed #ccc; text-align: center;">[Image: ${imgUrl}]</div>`;
        });

        fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

        const pdfWin = new BrowserWindow({ width: 1920, height: 1080, show: false, skipTaskbar: true, webPreferences: { offscreen: false } });
        pdfWin.__internal = true;
        await pdfWin.loadFile(tempHtmlPath);

        // Wait for render
        await new Promise(r => setTimeout(r, 3000));

        const pdfData = await pdfWin.webContents.printToPDF({
            landscape: false, printBackground: true, pageSize: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 }, preferCSSPageSize: true
        });

        fs.writeFileSync(filePath, pdfData);
        pdfWin.close();
        fs.unlinkSync(tempHtmlPath);

        if (settings.openFileAfterExport) {
            shell.openPath(filePath).catch(console.error);
        } else {
            shell.showItemInFolder(filePath);
        }

        dialog.showMessageBox(win, { type: 'info', title: 'Success!', message: 'PDF file created successfully!', buttons: ['OK'] });

    } catch (err) {
        console.error('Failed to export chat to PDF:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred.');
    }
}

async function handleExportChat(event) {
    const win = BrowserWindow.fromWebContents(event.sender);
    const view = win ? win.getBrowserView() : null;
    if (!view) return;

    try {
        const title = await view.webContents.executeJavaScript(`
            (() => {
                try {
                    const text = (el) => el ? (el.textContent || el.innerText || '').trim() : '';
                    if (location.hostname.includes('aistudio.google.com')) {
                        let el = document.querySelector('li.active a.prompt-link')
                              || document.querySelector('[data-test-id="conversation-title"]')
                              || document.querySelector('h1.conversation-title');
                        let t = text(el);
                        if (!t) t = (document.title || '').replace(/\s*\|\s*Google AI Studio$/i, '').trim();
                        return t || 'chat';
                    } else {
                        const el = document.querySelector('.conversation.selected .conversation-title')
                               || document.querySelector('[data-test-id="conversation-title"]');
                        return text(el) || (document.title || 'chat');
                    }
                } catch (e) {
                    return document.title || 'chat';
                }
            })();
        `);

        // The huge scraper script is here
        const chatHTML = await view.webContents.executeJavaScript(`
            (async () => {
                // אם זה AI Studio - משתמשים במבנה ms-chat-turn, כולל גלילה כדי לטעון את כל ההודעות
                if (document.querySelector('ms-chat-turn') || location.hostname.includes('aistudio.google.com')) {
                    const conversation = [];

                    // פונקציית עזר להמתנה
                    const delay = (ms) => new Promise(r => setTimeout(r, ms));

                    // לגלול את מכולת ההודעות כדי לטעון את כולן (בשל וירטואליזציה)
                    const scrollContainer = document.querySelector('ms-autoscroll-container');
                    if (scrollContainer) {
                        try {
                            scrollContainer.scrollTop = 0;
                            await delay(120);
                            const step = Math.max(200, scrollContainer.clientHeight - 50);
                            for (let y = 0; y <= scrollContainer.scrollHeight + step; y += step) {
                                scrollContainer.scrollTop = y;
                                await delay(100);
                            }
                            scrollContainer.scrollTop = 0;
                            await delay(120);
                        } catch (_) {}
                    }

                    const turns = Array.from(document.querySelectorAll('ms-chat-turn'));
                    turns.forEach(turn => {
                        const roleContainer = turn.querySelector('.virtual-scroll-container');
                        const roleAttr = roleContainer?.getAttribute('data-turn-role') || '';
                        const isUser = /user/i.test(roleAttr) || turn.querySelector('.user-prompt-container') !== null;
                        const isModel = /model/i.test(roleAttr) || turn.querySelector('.model-prompt-container') !== null;

                        const contentEl = turn.querySelector('.turn-content');
                        if (!contentEl) return;
                        const clone = contentEl.cloneNode(true);

                        const thoughtSelectors = [
                            'ms-thought-chunk',
                            '.thought-panel',
                            '.thought-collapsed-text',
                            'img.thinking-progress-icon',
                            'mat-accordion.thought-panel',
                            'mat-expansion-panel.thought-panel',
                            'ms-thought-chunk mat-expansion-panel',
                            'ms-thought-chunk mat-accordion',
                            '[class*="thought"]'
                        ];
                        thoughtSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

                        clone.querySelectorAll('math-inline, .math-inline, [class*="math-inline"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') ||
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');
                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }
                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }
                            if (latex) {
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$' + latex.trim() + '$');
                                marker.textContent = '$' + latex.trim() + '$';
                                mathEl.replaceWith(marker);
                            }
                        });

                        clone.querySelectorAll('math-block, .math-block, [class*="math-block"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') ||
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');
                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }
                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }
                            if (latex) {
                                const marker = document.createElement('div');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$$' + latex.trim() + '$$');
                                marker.textContent = '$$' + latex.trim() + '$$';
                                mathEl.replaceWith(marker);
                            }
                        });

                        clone.querySelectorAll('.katex, [class*="katex"]').forEach(katexEl => {
                            const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]');
                            if (annotation) {
                                const latex = annotation.textContent.trim();
                                const isDisplay = katexEl.closest('.katex-display') || katexEl.classList.contains('katex-display');
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                if (isDisplay) {
                                    marker.setAttribute('data-latex', '$$' + latex + '$$');
                                    marker.textContent = '$$' + latex + '$$';
                                } else {
                                    marker.setAttribute('data-latex', '$' + latex + '$');
                                    marker.textContent = '$' + latex + '$';
                                }
                                katexEl.replaceWith(marker);
                            }
                        });

                        const removeSelectors = [
                            'button', 'ms-chat-turn-options', 'mat-menu', '.actions-container', '.actions',
                            '.mat-mdc-menu-trigger', '[aria-label*="Rerun" i]', '[aria-label*="options" i]',
                            '[name="rerun-button"]', '.author-label', '.turn-separator'
                        ];
                        removeSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

                        const text = (clone.textContent || '').trim();
                        const hasImg = !!clone.querySelector('img');
                        if (!text && !hasImg) return;

                        conversation.push({
                            type: isUser ? 'user' : 'model',
                            html: clone.innerHTML,
                            text: text
                        });
                    });
                    return conversation;
                }

                const conversation = [];
                const conversationContainers = document.querySelectorAll('.conversation-container');

                conversationContainers.forEach(container => {
                    const userQuery = container.querySelector('user-query .query-text');
                    if (userQuery) {
                        const clone = userQuery.cloneNode(true);

                        const userImageSelectors = [
                            'user-query img',
                            'user-query .attachment-container img',
                            'user-query .image-container img',
                            'user-query uploaded-image img'
                        ];

                        let userImagesFound = [];
                        userImageSelectors.forEach(selector => {
                            const imgs = container.querySelectorAll(selector);
                            imgs.forEach(img => {
                                const imgSrc = img.src || img.getAttribute('src');
                                if (imgSrc && imgSrc.startsWith('http') && !userImagesFound.includes(imgSrc)) {
                                    userImagesFound.push(imgSrc);
                                    const imgTag = document.createElement('img');
                                    imgTag.src = imgSrc;
                                    imgTag.alt = img.alt || img.getAttribute('alt') || 'User uploaded image';
                                    imgTag.style.maxWidth = '100%';
                                    imgTag.style.height = 'auto';
                                    imgTag.style.display = 'block';
                                    imgTag.style.margin = '15px auto';
                                    imgTag.style.borderRadius = '8px';
                                    const imgContainer = document.createElement('div');
                                    imgContainer.className = 'user-image-container';
                                    imgContainer.appendChild(imgTag);
                                    clone.appendChild(imgContainer);
                                }
                            });
                        });

                        clone.querySelectorAll('button, mat-icon').forEach(el => el.remove());

                        conversation.push({
                            type: 'user',
                            html: clone.innerHTML,
                            text: userQuery.innerText.trim()
                        });
                    }

                    const modelResponse = container.querySelector('model-response .markdown');
                    if (modelResponse) {
                        const clone = modelResponse.cloneNode(true);

                        clone.querySelectorAll('math-inline, .math-inline, [class*="math-inline"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') ||
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');

                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }

                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }

                            if (latex) {
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$' + latex.trim() + '$');
                                marker.textContent = '$' + latex.trim() + '$';
                                mathEl.replaceWith(marker);
                            }
                        });

                        clone.querySelectorAll('math-block, .math-block, [class*="math-block"]').forEach(mathEl => {
                            let latex = mathEl.getAttribute('data-original') ||
                                        mathEl.getAttribute('data-latex') ||
                                        mathEl.getAttribute('data-formula');

                            if (!latex) {
                                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                                if (annotation) latex = annotation.textContent;
                            }

                            if (!latex) {
                                const semantics = mathEl.querySelector('semantics annotation');
                                if (semantics) latex = semantics.textContent;
                            }

                            if (latex) {
                                const marker = document.createElement('div');
                                marker.className = '__latex_preserved__';
                                marker.setAttribute('data-latex', '$$' + latex.trim() + '$$');
                                marker.textContent = '$$' + latex.trim() + '$$';
                                mathEl.replaceWith(marker);
                            }
                        });

                        clone.querySelectorAll('.katex, [class*="katex"]').forEach(katexEl => {
                            const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]');
                            if (annotation) {
                                const latex = annotation.textContent.trim();
                                const isDisplay = katexEl.closest('.katex-display') || katexEl.classList.contains('katex-display');
                                const marker = document.createElement('span');
                                marker.className = '__latex_preserved__';
                                if (isDisplay) {
                                    marker.setAttribute('data-latex', '$$' + latex + '$$');
                                    marker.textContent = '$$' + latex + '$$';
                                } else {
                                    marker.setAttribute('data-latex', '$' + latex + '$');
                                    marker.textContent = '$' + latex + '$';
                                }
                                katexEl.replaceWith(marker);
                            }
                        });

                        const imageSelectors = [
                            'generated-image img',
                            '.attachment-container img',
                            'single-image img',
                            '.generated-images img',
                            'response-element img',
                            '.image-container img'
                        ];

                        let imagesFound = [];
                        imageSelectors.forEach(selector => {
                            const imgs = container.querySelectorAll(selector);
                            imgs.forEach(img => {
                                const imgSrc = img.src || img.getAttribute('src');
                                if (imgSrc && imgSrc.startsWith('http') && !imagesFound.includes(imgSrc)) {
                                    imagesFound.push(imgSrc);
                                    const imgTag = document.createElement('img');
                                    imgTag.src = imgSrc;
                                    imgTag.alt = img.alt || img.getAttribute('alt') || 'Generated image';
                                    imgTag.style.maxWidth = '100%';
                                    imgTag.style.height = 'auto';
                                    imgTag.style.display = 'block';
                                    imgTag.style.margin = '15px auto';
                                    imgTag.style.borderRadius = '8px';
                                    const imgContainer = document.createElement('div');
                                    imgContainer.className = 'generated-image-container';
                                    imgContainer.appendChild(imgTag);
                                    clone.insertBefore(imgContainer, clone.firstChild);
                                }
                            });
                        });

                        const existingImages = clone.querySelectorAll('img');
                        existingImages.forEach(img => {
                            const imgSrc = img.src || img.getAttribute('src');
                            if (imgSrc && imgSrc.startsWith('http')) {
                                img.style.maxWidth = '100%';
                                img.style.height = 'auto';
                                img.style.display = 'block';
                                img.style.margin = '15px auto';
                                img.style.borderRadius = '8px';
                            }
                        });

                        clone.querySelectorAll('button, .action-button, .copy-button, mat-icon, .export-sheets-button-container').forEach(el => el.remove());

                        conversation.push({
                            type: 'model',
                            html: clone.innerHTML,
                            text: modelResponse.innerText.trim()
                        });
                    }
                });

                return conversation;
            })();
        `);

        if (!chatHTML || chatHTML.length === 0) {
            dialog.showErrorBox('Export Failed', 'Could not find any chat content to export.');
            return;
        }

        // שמירת הנתונים לשימוש מאוחר יותר
        pendingPdfExportData = { win, title, chatHTML };

        // בדיקת הגדרת הייצוא
        const exportFormat = settings.exportFormat || 'ask';

        if (exportFormat === 'md') {
            await exportToMarkdown(win, title, chatHTML);
            pendingPdfExportData = null;
        } else if (exportFormat === 'pdf') {
            openPdfDirectionWindow(win);
        } else {
            openFormatChoiceWindow(win);
        }

    } catch (err) {
        console.error('Failed to prepare chat export:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while preparing the export.');
    }
}

async function handleSelectExportFormat(event, format) {
    if (exportFormatWin) {
        exportFormatWin.close();
    }

    if (!pendingPdfExportData) {
        console.error('No pending export data found');
        return;
    }

    const { win, title, chatHTML } = pendingPdfExportData;
    selectedExportFormat = format;

    try {
        if (format === 'md') {
            await exportToMarkdown(win, title, chatHTML);
            pendingPdfExportData = null;
            selectedExportFormat = null;
        } else if (format === 'pdf') {
            openPdfDirectionWindow(win);
        }
    } catch (err) {
        console.error('Failed to export:', err);
        dialog.showErrorBox('Export Error', 'An unexpected error occurred while exporting.');
        pendingPdfExportData = null;
        selectedExportFormat = null;
    }
}

async function handleSelectPdfDirection(event, direction) {
    if (pdfDirectionWin) {
        pdfDirectionWin.close();
    }

    if (!pendingPdfExportData) {
        console.error('No pending PDF export data found');
        return;
    }

    const { win, title, chatHTML } = pendingPdfExportData;
    selectedPdfDirection = direction;

    await exportToPdf(win, title, chatHTML, direction);
}

function closeExportWindows() {
    if(exportFormatWin) exportFormatWin.close();
    if(pdfDirectionWin) pdfDirectionWin.close();
}

module.exports = {
    initialize,
    registerIpcHandlers,
    openFormatChoiceWindow,
    openPdfDirectionWindow,
    exportToMarkdown,
    exportToPdf,
    handleExportChat,
    setPendingExportData: (data) => { pendingPdfExportData = data; },
    getPendingExportData: () => pendingPdfExportData,
    setSelectedExportFormat: (f) => { selectedExportFormat = f; },
    setSelectedPdfDirection: (d) => { selectedPdfDirection = d; },
    getSelectedExportFormat: () => selectedExportFormat,
    getSelectedPdfDirection: () => selectedPdfDirection,
    getExportFormatWin: () => exportFormatWin,
    getPdfDirectionWin: () => pdfDirectionWin,
    closeExportWindows
};
