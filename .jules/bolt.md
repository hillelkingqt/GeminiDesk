# Bolt's Journal

## 2024-05-23 - Settings Optimization & Cloning Overhead
**Learning:** The application's `getSettings()` function defaults to deep cloning the settings object using `JSON.parse(JSON.stringify(obj))` on every call to prevent mutation. This is a significant bottleneck in high-frequency paths (like IPC handlers or startup checks).
**Action:** When only read access is needed, always pass `false` to `getSettings()` (e.g., `getSettings(false)`) to return the cached object directly without cloning. Be careful to ensure the returned object is not mutated.

## 2024-05-23 - Synchronous File I/O
**Learning:** `saveSettings` uses `fs.writeFileSync`, which blocks the main thread. While `debouncedSaveSettings` mitigates this for frequent updates like window resizing, the underlying operation is still synchronous and can cause jank.
**Action:** In future refactoring, convert `saveSettings` to use `fs.promises.writeFile`, but ensure synchronous callers (like `updateAccountMetadata` in `modules/accounts.js`) are updated to handle promises correctly.
