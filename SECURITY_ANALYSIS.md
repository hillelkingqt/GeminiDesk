# Security Analysis Report - GeminiDesk

**Date:** December 5, 2025  
**Repository:** hillelkingqt/GeminiDesk  
**Analysis Type:** Comprehensive Security Review

---

## Executive Summary

This security analysis was conducted in response to a question about potential suspicious activity or malware in the GeminiDesk repository. After a thorough examination of the codebase, dependencies, and bundled components, **no malicious code or viruses were detected**. However, several security considerations and concerns have been identified that users should be aware of.

---

## Key Findings

### ✅ No Malware Detected
- No evidence of malicious code, data exfiltration, or virus-like behavior
- No unauthorized network connections to suspicious domains
- No credential stealing or keylogging functionality

### ⚠️ Security Concerns Identified

1. **Third-Party Chrome Extension (0.5.8_0)**
2. **Analytics Data Collection**
3. **Remote Debugging Port**
4. **Dependency Vulnerabilities**

---

## Detailed Analysis

### 1. Bundled Chrome Extension: "MCP SuperAssistant"

**Location:** `0.5.8_0/` directory

#### What is it?
The application bundles a Chrome extension called "MCP SuperAssistant" (version 0.5.8) that provides Model Context Protocol (MCP) functionality. This extension is injected into the Electron app's webview sessions.

#### Key Characteristics:
- **Extension ID:** `saurabh@mcpsuperassistant.ai`
- **Purpose:** Enables MCP (Model Context Protocol) integration with AI assistants
- **Permissions:**
  - `storage` - Access to Chrome storage APIs
  - `clipboardWrite` - Write access to clipboard
- **Content Scripts:** Injected into multiple AI platforms:
  - gemini.google.com
  - aistudio.google.com
  - chat.openai.com / chatgpt.com
  - perplexity.ai, grok.com, deepseek.com
  - github.com / copilot.github.com
  - And others

#### Security Considerations:
- ✅ **Firebase Remote Config is DISABLED** (line 1224 in background.js returns false immediately)
- ⚠️ **Google Analytics tracking is ACTIVE** (sends usage data to Google Analytics)
- ⚠️ The extension is automatically loaded into all sessions without explicit user consent dialog
- ⚠️ Extension has broad permissions across multiple AI platforms
- ⚠️ This is a third-party component not developed by the GeminiDesk author

**User Control:** The extension can be disabled through application settings by toggling the `loadUnpackedExtension` option.

### 2. Analytics and Data Collection

**Service:** Google Analytics 4 (GA4)  
**Measurement ID:** G-6ENY3Y3H9X  
**API Secret:** I0PHa_CWTbuTlXSb3T-kXg (Note: This is already public in the bundled extension code)

#### Data Collected by Extension:

The extension tracks the following events:

1. **Extension Lifecycle:**
   - `extension_loaded` - When extension initializes
   - `extension_installed` - First install or update
   - `browser_startup` - Browser/app startup

2. **MCP Usage:**
   - `mcp_tool_executed` - When MCP tools are used
   - `mcp_connection_changed` - Connection status changes
   - `adapter_activated` - When adapter switches

3. **Errors:**
   - `extension_error` - Error tracking with error messages
   - Connection and tool errors

4. **Session Data:**
   - `session_summary` - Periodic session statistics
   - `user_properties_initialized` - User property setup

#### Data Points Tracked:
- Client ID (unique identifier)
- Session ID
- Browser type and version
- Operating system
- Language
- Tool execution counts
- Connection status
- Adapter usage
- Error messages (may contain sensitive context)

**Privacy Concern:** While this is standard usage analytics, users may not be explicitly aware that their MCP tool usage patterns are being tracked and sent to Google Analytics.

### 3. Remote Debugging Port

**Finding:** The application enables Chrome's remote debugging port on port 9222 (line 5 in main.js):

```javascript
app.commandLine.appendSwitch('remote-debugging-port', '9222');
```

**Security Implications:**
- ✅ This is a standard Electron development feature
- ✅ Allows inspection/debugging of the app
- ⚠️ If exposed, could allow local network access to debug the application
- ⚠️ Could potentially be used to inspect user data if malicious software gains local access

**Recommendation:** This should ideally be disabled in production builds or require explicit user opt-in.

### 4. Dependency Vulnerabilities

**NPM Audit Results:** 3 vulnerabilities detected:

1. **glob** (HIGH severity)
   - Command injection vulnerability
   - Affects version range: 10.2.0 - 10.4.5
   - CVE: GHSA-5j98-mcp5-4vw2
   - **Impact:** Indirect dependency via config-file-ts
   - **Fix Available:** Yes

2. **js-yaml** (MODERATE severity)
   - Prototype pollution vulnerability
   - Affects version range: 4.0.0 - 4.1.0
   - CVE: GHSA-mh29-5h37-fv8m
   - **Fix Available:** Yes

3. **tmp** (LOW severity)
   - Arbitrary file/directory write via symlink
   - Affects version: ≤0.2.3
   - CVE: GHSA-52f5-9888-hmc6
   - **Fix Available:** Yes

**Recommendation:** Run `npm audit fix` to update vulnerable dependencies.

### 5. Other Security Observations

#### Positive Security Practices:
- ✅ Uses `electron-store` for secure local storage
- ✅ Has a dedicated SecureStore module for sensitive data
- ✅ Implements proxy support for network routing
- ✅ Uses `electron-updater` for secure auto-updates
- ✅ MIT License (open source)
- ✅ No obfuscated or minified source code (main app)

#### Areas of Concern:
- ⚠️ The bundled extension code is minified/bundled (harder to audit)
- ⚠️ Child process spawning capabilities (`spawn`, `fork` imported)
- ⚠️ Uses `executeJavaScript` to inject code into webviews (necessary for functionality but powerful)
- ⚠️ No explicit mention of analytics in README or privacy policy

---

## Recommendations

### For Users:

1. **Review Analytics:** Be aware that usage data is collected through the bundled extension
2. **Disable Extension:** If you don't need MCP features, disable the extension in settings:
   - Settings → Advanced → Uncheck "Load Unpacked Extension"
3. **Update Dependencies:** Ensure you're using the latest version for security patches
4. **Network Monitoring:** If concerned, monitor network traffic to verify no unexpected connections
5. **Review Permissions:** Consider running in a sandboxed environment if highly sensitive work is involved

### For Developers/Maintainer:

1. **Fix Vulnerabilities:**
   ```bash
   npm audit fix
   ```

2. **Add Privacy Policy:**
   - Document data collection practices
   - Explain what analytics data is collected and why
   - Provide opt-out instructions

3. **Extension Transparency:**
   - Add clear documentation about the bundled extension
   - Provide source code or link to the original extension repository
   - Consider making the extension loading opt-in rather than opt-out
   - Attribute the extension author properly

4. **Security Hardening:**
   - Consider disabling remote debugging port in production builds
   - Add a setting to toggle analytics
   - Implement Content Security Policy (CSP)
   - Consider code signing certificates for all platforms

5. **Audit the Extension:**
   - Verify the extension source and author
   - Consider whether bundling a third-party extension is necessary
   - If bundled, provide clear attribution and license compliance

6. **Documentation:**
   - Add a SECURITY.md file with security practices
   - Document all network connections made by the app
   - Explain data collection and privacy practices

---

## Conclusion

**Is there a virus or something suspicious?** 

**No.** GeminiDesk is not malware and does not contain a virus. However:

1. The application bundles a **third-party Chrome extension** that provides MCP functionality and collects **usage analytics** via Google Analytics
2. Some **dependency vulnerabilities** exist that should be fixed
3. The **remote debugging port** is enabled by default
4. Users should be more explicitly informed about data collection practices

The application appears to be a legitimate desktop wrapper for Google Gemini with enhanced features. The security concerns identified are related to **transparency**, **privacy**, and **dependency management** rather than malicious intent.

### Trust Level: **MODERATE**
- The main application code is open source and auditable
- No evidence of malicious behavior
- Some concerns about bundled third-party components and analytics
- Recommended to fix vulnerabilities and improve transparency

---

## Technical Details

### Files Analyzed:
- `main.js` - Main Electron application (265 KB)
- `package.json` - Dependencies and build configuration
- `0.5.8_0/` - Bundled Chrome extension
  - `manifest.json` - Extension manifest
  - `background.js` - Extension background script (469 KB, minified)
  - `content/index.iife.js` - Content script (4,058 lines)

### Analysis Methods:
- Static code analysis
- Pattern matching for suspicious code (eval, exec, spawn, fetch, etc.)
- Network endpoint identification
- Dependency vulnerability scanning
- Extension manifest review
- Analytics tracking code examination

---

## Questions & Contact

If you have concerns about any findings in this report or need clarification, please:
1. Open an issue in the repository
2. Contact the maintainer at: geminidesksupport@proton.me
3. Review the source code yourself (it's open source!)

---

**Report Generated:** December 5, 2025  
**Analyst:** Automated Security Review  
**Tool:** GitHub Copilot Security Analysis
