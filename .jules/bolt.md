## 2024-05-23 - Avoiding Deep Clones of Large Settings Objects
**Learning:** Frequent deep cloning of the global settings object via `JSON.parse(JSON.stringify(obj))` for read-only access is a significant performance anti-pattern in the main process, especially as the settings object grows (with accounts, shortcuts, etc.).
**Action:** When accessing settings for read-only purposes (checking flags, looping arrays), use a flag (e.g., `shouldClone = false`) to retrieve the direct reference or use the already-loaded global variable in `main.js` instead of cloning.
