## 2024-05-23 - Settings Object Cloning Performance
**Learning:** `JSON.parse(JSON.stringify(obj))` is a significant bottleneck when called frequently for reading configuration in Electron apps.
**Action:** Use `structuredClone` for deep copies where available (Node 17+), as it handles more types and is generally more robust, although performance varies by engine. For immutable read-only access, consider `Object.freeze` to avoid copying altogether if architecture permits. In this case, `structuredClone` is a safe drop-in replacement.
