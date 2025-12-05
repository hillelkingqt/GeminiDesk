# Security Recommendations for GeminiDesk

This document provides actionable security recommendations for the GeminiDesk maintainer and users.

## Critical Actions Required

### 1. Upgrade Electron (Breaking Change)

**Current Version:** 28.3.3  
**Vulnerable to:** ASAR Integrity Bypass via resource modification (CVE: GHSA-vmqv-hx8q-j7mg)  
**Recommended Version:** 35.7.5 or later (latest stable: 39.x)

**Impact:** Moderate severity - An attacker could modify ASAR archives to bypass integrity checks.

**Action Required:**
```bash
npm install electron@^39.0.0 --save-dev
npm audit fix
```

**Note:** This is a major version upgrade and may require code changes. Test thoroughly before releasing.

**Testing Checklist:**
- [ ] Application starts correctly
- [ ] All features work as expected
- [ ] Extension loading works
- [ ] Auto-updater functions properly
- [ ] Build process completes successfully
- [ ] Test on all target platforms (Windows, macOS, Linux)

---

## Immediate Actions (Can be done now)

### 2. Add Privacy Policy and Transparency

Create `PRIVACY.md` with:
- What data is collected (analytics via GA4)
- Why it's collected (improving user experience)
- How to opt-out
- What third-party services are used (Google Analytics, Firebase)
- Data retention policies

### 3. Document the Bundled Extension

Add to `README.md`:

```markdown
## Third-Party Components

### MCP SuperAssistant Extension

GeminiDesk bundles the "MCP SuperAssistant" Chrome extension (v0.5.8) to provide Model Context Protocol functionality.

**Extension Details:**
- **Author:** saurabh@mcpsuperassistant.ai
- **Purpose:** Enables MCP integration with AI platforms
- **Permissions:** storage, clipboardWrite
- **Analytics:** Sends usage data to Google Analytics (G-6ENY3Y3H9X)

**Disabling the Extension:**
If you don't need MCP features, you can disable the extension:
1. Open Settings
2. Navigate to Advanced settings
3. Uncheck "Load Unpacked Extension"
4. Restart the application

**Source Code:** [Link to original extension repository if available]
**License:** [Extension license]
```

### 4. Add Analytics Opt-Out

Implement a settings toggle to disable analytics:

**In Settings UI:**
```javascript
// Add to settings module
const analyticsEnabled = store.get('analyticsEnabled', true);
```

**In Extension:**
Modify the extension to respect this setting and skip analytics calls if disabled.

### 5. Create SECURITY.md

GitHub-standard security policy file:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 8.1.x   | :white_check_mark: |
| < 8.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to:
- Email: geminidesksupport@proton.me
- Subject: [SECURITY] Brief description

Please do not disclose security vulnerabilities publicly until they have been addressed.

## Known Security Considerations

1. **Remote Debugging Port:** The application enables Chrome's remote debugging on port 9222
2. **Third-Party Extension:** Bundles MCP SuperAssistant extension with analytics
3. **Analytics Collection:** Usage data is sent to Google Analytics

See SECURITY_ANALYSIS.md for detailed information.
```

### 6. Improve Extension Loading Transparency

**Add to first-run experience:**
```javascript
// Show dialog on first launch explaining the extension
if (!store.get('extensionConsentShown')) {
    // Show dialog explaining:
    // - What the extension does
    // - What data it collects
    // - How to disable it
    store.set('extensionConsentShown', true);
}
```

---

## Medium Priority Actions

### 7. Disable Remote Debugging in Production

**Current Code (main.js:5):**
```javascript
app.commandLine.appendSwitch('remote-debugging-port', '9222');
```

**Recommended:**
```javascript
// Only enable in development
if (process.env.NODE_ENV === 'development' || app.commandLine.hasSwitch('debug')) {
    app.commandLine.appendSwitch('remote-debugging-port', '9222');
}
```

### 8. Implement Content Security Policy

Add CSP headers to restrict what content can be loaded:

```javascript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
        responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://gemini.google.com",
                "style-src 'self' 'unsafe-inline'",
                "connect-src 'self' https://gemini.google.com https://aistudio.google.com"
            ]
        }
    });
});
```

### 9. Code Signing

Implement proper code signing for all platforms:

**Windows:** 
- Get a code signing certificate
- Sign .exe installers

**macOS:**
- Apple Developer ID
- Sign .app and .dmg
- Notarize with Apple

**Linux:**
- GPG sign releases

### 10. Dependency Pinning

Use exact versions instead of ranges to prevent unexpected updates:

```json
{
  "dependencies": {
    "electron": "28.3.3",
    "electron-store": "8.2.0"
  }
}
```

Run `npm shrinkwrap` to lock all dependency versions.

---

## Long-term Improvements

### 11. Security Audit Schedule

- Monthly: `npm audit` check
- Quarterly: Manual security review
- Yearly: Third-party security audit

### 12. Automated Security Scanning

Implement in CI/CD:
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      - name: Run Snyk scan
        uses: snyk/actions/node@master
```

### 13. Vulnerability Disclosure Program

- Create a security contact
- Consider bug bounty program
- Clear disclosure timeline

### 14. Regular Dependency Updates

Create automated PRs for dependency updates:
- Use Dependabot or Renovate
- Review and test updates weekly

### 15. Extension Verification

- Verify the MCP SuperAssistant extension source
- Consider building from source instead of bundling pre-built
- Or develop an in-house MCP solution
- Regular audits of bundled extensions

---

## User Recommendations

### For General Users:

1. **Keep Updated:** Always use the latest version
2. **Review Settings:** Understand what features are enabled
3. **Monitor Network:** Use tools like Wireshark if concerned about data collection
4. **Check Permissions:** Review what system permissions the app requests

### For Security-Conscious Users:

1. **Disable Extension:** Turn off MCP extension if not needed
2. **Use Firewall:** Configure firewall rules to monitor/block unexpected connections
3. **Sandbox:** Run in a VM or container if handling sensitive data
4. **Review Code:** Audit the source code yourself
5. **Monitor Logs:** Check application logs regularly

### For Enterprise Users:

1. **Internal Audit:** Conduct thorough security review
2. **Network Policy:** Configure network restrictions
3. **Disable Analytics:** Implement company-wide analytics opt-out
4. **Custom Build:** Consider building from source with modifications
5. **Isolated Environment:** Run in isolated/sandboxed environments

---

## Testing Security Improvements

After implementing changes:

1. **Static Analysis:**
   ```bash
   npm audit
   npm run build
   ```

2. **Runtime Testing:**
   - Test all features work correctly
   - Verify analytics can be disabled
   - Check extension behavior when disabled
   - Test on all platforms

3. **Network Analysis:**
   - Monitor outbound connections
   - Verify only expected domains are contacted
   - Check for data leaks

4. **Permission Review:**
   - Audit system permissions requested
   - Verify minimal privilege principle

---

## Resources

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)

---

## Timeline

**Immediate (This Week):**
- ✅ Fix npm audit vulnerabilities (glob, js-yaml, tmp)
- [ ] Add PRIVACY.md
- [ ] Update README with extension information
- [ ] Add SECURITY.md

**Short-term (This Month):**
- [ ] Implement analytics opt-out
- [ ] Add extension consent dialog
- [ ] Disable remote debugging in production

**Medium-term (3 Months):**
- [ ] Upgrade to Electron 35.7.5+
- [ ] Implement Content Security Policy
- [ ] Set up automated security scanning

**Long-term (6+ Months):**
- [ ] Code signing for all platforms
- [ ] Third-party security audit
- [ ] Consider in-house MCP implementation

---

**Last Updated:** December 5, 2025  
**Maintainer:** See repository maintainer  
**Status:** Recommendations provided
