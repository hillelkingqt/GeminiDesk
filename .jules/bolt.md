## 2024-05-24 - Optimized Settings Access
**Learning:** Returning a deep copy of a large settings object for every IPC read request is unnecessary because Electron's IPC mechanism inherently serializes data, effectively creating a copy.
**Action:** Implemented `shouldClone` parameter in `getSettings` to allow `getSettings(false)` for IPC handlers, avoiding double cloning and reducing overhead.
