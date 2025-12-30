## 2024-05-23 - Sequential Extension Loading
**Learning:** The application loads extensions (like Lyra/Tampermonkey) sequentially for every account partition. With multiple accounts, this multiplies the startup delay.
**Action:** Use `Promise.all` to load extensions into all partitions in parallel. This significantly reduces the time blocked on extension loading during app startup.
