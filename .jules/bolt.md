# Bolt's Journal - Critical Learnings

## 2024-05-24 - Async Settings Save
**Learning:** `fs.writeFileSync` in `modules/settings.js` was a potential bottleneck for main thread responsiveness, especially during window resize operations which trigger `debouncedSaveSettings`.
**Action:** Converted `saveSettings` to `async` using `fs.promises.writeFile`. Crucially, I implemented an optimistic synchronous update of `cachedSettings` *before* the async write to ensure data consistency for immediate `getSettings()` calls. I also optimized by reusing the stringified JSON to avoid double-serialization overhead.
