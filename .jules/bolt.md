## 2025-12-29 - [Async Settings Storage]
**Learning:** The application was using synchronous `fs.writeFileSync` to save settings, even in the debounced handler. This blocks the main thread, especially during rapid updates like window resizing or moving, which can cause jank.
**Action:** Implemented `saveSettingsAsync` using `fs.promises.writeFile` and updated `debouncedSaveSettings` in `main.js` to use it. This offloads the I/O operation to the thread pool, keeping the main thread responsive.
