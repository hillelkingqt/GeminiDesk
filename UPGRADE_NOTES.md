# Electron Upgrade Notes

## Why Electron Was Not Upgraded in This PR

This PR focuses on documentation and fixing non-breaking dependency vulnerabilities. The Electron upgrade was intentionally **not included** for the following reasons:

### 1. Breaking Change
Upgrading from Electron 28.x to 35.7.5+ (or 39.x) is a **major version change** that could introduce breaking changes:
- API changes between versions
- Potential behavior differences
- Compatibility issues with existing code
- Build process modifications required

### 2. Requires Extensive Testing
An Electron upgrade requires comprehensive testing across:
- All three platforms (Windows, macOS, Linux)
- All application features
- Extension loading mechanism
- Auto-updater functionality
- Build and packaging process
- Distribution workflows

### 3. Should Be a Separate PR
Given the scope of changes required and testing needed, the Electron upgrade should be:
- A dedicated PR with its own testing cycle
- Reviewed independently
- Tested on all platforms before merging
- Potentially released as a beta first

### 4. Risk vs. Benefit
The current vulnerability (GHSA-vmqv-hx8q-j7mg) is:
- **Severity:** Moderate (not critical)
- **Attack Vector:** Requires local file system access to modify ASAR archives
- **Mitigation:** Application integrity checks and proper file permissions

The risk is **manageable** while planning a proper upgrade.

## Recommended Upgrade Path

### Step 1: Preparation (Before Starting)
1. Review Electron changelog from v28 to target version
2. Check electron-builder compatibility
3. Identify deprecated APIs in use
4. Plan testing strategy

### Step 2: Development Branch
```bash
git checkout -b upgrade/electron-39
npm install electron@^39.0.0 --save-dev
npm install electron-builder@latest --save-dev
```

### Step 3: Code Updates
1. Update deprecated API calls
2. Test extension loading
3. Verify auto-updater configuration
4. Check session/cookie handling
5. Test proxy configuration

### Step 4: Testing Checklist
- [ ] Application launches successfully
- [ ] Main window displays correctly
- [ ] BrowserView loads Gemini properly
- [ ] Extension loads without errors
- [ ] Settings persist correctly
- [ ] Shortcuts work on all platforms
- [ ] Screenshot functionality works
- [ ] PDF export works
- [ ] Auto-updater functions (test update flow)
- [ ] Deep research scheduler works
- [ ] MCP proxy functionality intact
- [ ] Multi-account switching works
- [ ] Tray icon and notifications work

### Step 5: Platform-Specific Testing

**Windows:**
- [ ] NSIS installer builds
- [ ] Application runs on Windows 10
- [ ] Application runs on Windows 11
- [ ] Shortcuts work correctly
- [ ] Auto-launch works

**macOS:**
- [ ] DMG builds successfully
- [ ] Runs on Intel Mac
- [ ] Runs on Apple Silicon (M1/M2)
- [ ] Gatekeeper doesn't block
- [ ] Shortcuts use correct modifiers

**Linux:**
- [ ] AppImage builds
- [ ] DEB package builds
- [ ] Runs on Ubuntu/Debian
- [ ] Runs on Fedora/RHEL
- [ ] Desktop integration works

### Step 6: Build Testing
```bash
npm run build
# Test the built application on all platforms
```

### Step 7: Beta Release
1. Release as beta version (e.g., v8.2.0-beta.1)
2. Gather feedback from users
3. Fix any issues found
4. Release stable version

## Current Status

**Status:** Upgrade planned but not implemented  
**Current Version:** Electron 28.3.3  
**Target Version:** Electron 39.x (latest stable)  
**Priority:** High (but should not block this security documentation PR)

## Additional Resources

- [Electron Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes)
- [Electron Releases](https://github.com/electron/electron/releases)
- [electron-builder Changelog](https://github.com/electron-userland/electron-builder/releases)

---

**Note for Maintainer:**

This upgrade is important for security but should be done carefully and separately. The documentation provided in this PR gives you the roadmap and rationale. Consider creating a dedicated issue to track the upgrade progress.

You might also want to:
1. Set up a test/staging build pipeline
2. Recruit beta testers
3. Plan for potential rollback if issues arise
4. Document any breaking changes for users

---

**Last Updated:** December 5, 2025  
**PR:** Security analysis and vulnerability fixes  
**Issue:** Electron upgrade should be tracked separately
