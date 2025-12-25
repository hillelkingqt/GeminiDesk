const { dialog, shell, BrowserWindow, app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let settings = null;
let translations = null;
let exportFormatWin = null;
let pdfDirectionWin = null;
let pendingExportData = null;

function initialize(deps) {
  settings = deps.settings;
  translations = deps.translations;

  // Register IPC handlers for export
  ipcMain.on('select-export-format', async (event, format) => {
    if (exportFormatWin) exportFormatWin.close();
    if (!pendingExportData) return;

    if (format === 'md') {
      const { win, title, chatHTML } = pendingExportData;
      await exportToMarkdown(win, title, chatHTML);
      pendingExportData = null;
    } else if (format === 'pdf') {
      openPdfDirectionWindow(pendingExportData.win);
    }
  });

  ipcMain.on('select-pdf-direction', async (event, direction) => {
    if (pdfDirectionWin) pdfDirectionWin.close();
    if (!pendingExportData) return;

    const { win, title, chatHTML } = pendingExportData;
    await exportToPDF(win, title, chatHTML, direction);
    pendingExportData = null;
  });

  ipcMain.on('cancel-pdf-export', () => {
    pendingExportData = null;
  });
}

/**
 * Extract chat content from a view
 */
async function extractChat(view) {
  if (!view || view.webContents.isDestroyed()) return null;

  const title = await view.webContents.executeJavaScript(`
        (() => {
            try {
                const text = (el) => el ? (el.textContent || el.innerText || '').trim() : '';
                if (location.hostname.includes('aistudio.google.com')) {
                    let el = document.querySelector('li.active a.prompt-link')
                          || document.querySelector('[data-test-id="conversation-title"]')
                          || document.querySelector('h1.conversation-title');
                    let t = text(el);
                    if (!t) t = (document.title || '').replace(/\\s*|\\s*Google AI Studio$/i, '').trim();
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

  const chatHTML = await view.webContents.executeJavaScript(`
        (async () => {
            if (document.querySelector('ms-chat-turn') || location.hostname.includes('aistudio.google.com')) {
                const conversation = [];
                const delay = (ms) => new Promise(r => setTimeout(r, ms));
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
                    const contentEl = turn.querySelector('.turn-content');
                    if (!contentEl) return;
                    const clone = contentEl.cloneNode(true);
                    
                    const thoughtSelectors = ['ms-thought-chunk', '.thought-panel', '[class*="thought"]'];
                    thoughtSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));
                    
                    const removeSelectors = ['button', 'ms-chat-turn-options', '.actions', '.author-label'];
                    removeSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

                    conversation.push({
                        type: isUser ? 'user' : 'model',
                        html: clone.innerHTML,
                        text: (clone.textContent || '').trim()
                    });
                });
                return conversation;
            }

            const conversation = [];
            const containers = document.querySelectorAll('.conversation-container');
            containers.forEach(container => {
                const userQuery = container.querySelector('user-query .query-text');
                if (userQuery) {
                    const clone = userQuery.cloneNode(true);
                    clone.querySelectorAll('button, mat-icon').forEach(el => el.remove());
                    conversation.push({ type: 'user', html: clone.innerHTML, text: userQuery.innerText.trim() });
                }
                const modelResponse = container.querySelector('model-response .markdown');
                if (modelResponse) {
                    const clone = modelResponse.cloneNode(true);
                    clone.querySelectorAll('button, .action-button, mat-icon').forEach(el => el.remove());
                    conversation.push({ type: 'model', html: clone.innerHTML, text: modelResponse.innerText.trim() });
                }
            });
            return conversation;
        })();
    `);

  return { title, chatHTML };
}

/**
 * Handle the export chat shared logic
 */
async function handleExportChat(win, view) {
  try {
    const data = await extractChat(view);
    if (!data || !data.chatHTML || data.chatHTML.length === 0) {
      dialog.showErrorBox('Export Failed', 'Could not find any chat content to export.');
      return;
    }

    const { title, chatHTML } = data;
    pendingExportData = { win, title, chatHTML };

    const exportFormat = settings.exportFormat || 'ask';
    if (exportFormat === 'md') {
      await exportToMarkdown(win, title, chatHTML);
      pendingExportData = null;
    } else if (exportFormat === 'pdf') {
      openPdfDirectionWindow(win);
    } else {
      openFormatChoiceWindow(win);
    }
  } catch (err) {
    console.error('Export error:', err);
  }
}

function openFormatChoiceWindow(parentWin) {
  if (exportFormatWin) { exportFormatWin.focus(); return; }
  exportFormatWin = new BrowserWindow({
    width: 550, height: 450, frame: false, resizable: false, show: false,
    parent: parentWin, modal: true,
    webPreferences: { preload: path.join(__dirname, '../../../preload.js'), contextIsolation: true }
  });
  exportFormatWin.loadFile('html/export-format-choice.html');
  exportFormatWin.once('ready-to-show', () => exportFormatWin.show());
  exportFormatWin.on('closed', () => { exportFormatWin = null; });
}

function openPdfDirectionWindow(parentWin) {
  if (pdfDirectionWin) { pdfDirectionWin.focus(); return; }
  pdfDirectionWin = new BrowserWindow({
    width: 550, height: 450, frame: false, resizable: false, show: false,
    parent: parentWin, modal: true,
    webPreferences: { preload: path.join(__dirname, '../../../preload.js'), contextIsolation: true }
  });
  pdfDirectionWin.loadFile('html/pdf-direction-choice.html');
  pdfDirectionWin.once('ready-to-show', () => pdfDirectionWin.show());
  pdfDirectionWin.on('closed', () => { pdfDirectionWin = null; });
}

function htmlToMarkdown(html, userLabel = 'You:', modelLabel = 'Gemini:') {
  let result = html;
  // Basic cleanup for MD
  result = result.replace(/<[^>]+>/g, '').trim();
  return result;
}

async function exportToMarkdown(win, title, chatHTML) {
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Export Chat to Markdown',
    defaultPath: `${(title || 'chat').replace(/[\\\\/:*?"<>|]/g, '')}.md`,
    filters: [{ name: 'Markdown Files', extensions: ['md'] }]
  });
  if (!filePath) return;

  let mdContent = `# ${title}\\n\\n`;
  chatHTML.forEach(msg => {
    mdContent += `## ${msg.type === 'user' ? 'You:' : 'Gemini:'}\\n\\n${msg.text}\\n\\n---\\n\\n`;
  });
  fs.writeFileSync(filePath, mdContent, 'utf-8');
  if (settings.openFileAfterExport) shell.openPath(filePath);
}

async function exportToPDF(win, title, chatHTML, direction) {
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Export Chat to PDF',
    defaultPath: `${(title || 'chat').replace(/[\\\\/:*?"<>|]/g, '')}.pdf`,
    filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
  });
  if (!filePath) return;

  // PDF generation logic (simplified for brevity here, should include the full template)
  const tempHtmlPath = path.join(app.getPath('temp'), `export-${Date.now()}.html`);
  let htmlContent = `<html><body dir="${direction}"><h1>${title}</h1>`;
  chatHTML.forEach(msg => {
    htmlContent += `<div><strong>${msg.type === 'user' ? 'You:' : 'Gemini:'}</strong><br>${msg.html}</div><hr>`;
  });
  htmlContent += `</body></html>`;

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
  const pdfWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await pdfWin.loadFile(tempHtmlPath);
  const pdfData = await pdfWin.webContents.printToPDF({});
  fs.writeFileSync(filePath, pdfData);
  pdfWin.close();
  fs.unlinkSync(tempHtmlPath);
  if (settings.openFileAfterExport) shell.openPath(filePath);
}

module.exports = {
  initialize,
  handleExportChat
};
