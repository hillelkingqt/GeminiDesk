## 2025-02-14 - Synchronous File I/O in Electron Main Process
**Learning:** `fs.writeFileSync` in Electron's main process blocks the entire event loop, causing UI freezes (jank) during high-frequency operations like window resizing or settings updates.
**Action:** Use `fs.promises.writeFile` for runtime file operations. Implement an asynchronous `saveSettingsAsync` function and update debounce handlers to use it, preventing main thread blocking while preserving data integrity.
