# GeminiDesk - Repository Structure

This document describes the organization of the GeminiDesk repository.

## Directory Structure

```
GeminiDesk/
├── src/                          # Source code
│   ├── main.js                   # Main Electron process entry point
│   ├── preload.js                # Preload script for renderer processes
│   ├── translations.js           # Internationalization translations
│   ├── modules/                  # Core application modules
│   │   ├── accounts.js           # Multi-account management
│   │   ├── constants.js          # Application constants
│   │   ├── deep-research.js      # Deep research automation
│   │   ├── settings.js           # Settings management
│   │   ├── tray.js               # System tray functionality
│   │   └── utils.js              # Utility functions
│   ├── renderer/                 # HTML files for renderer processes
│   │   ├── index.html            # Main application window
│   │   ├── settings.html         # Settings window
│   │   ├── onboarding.html       # First-run onboarding
│   │   ├── notification.html     # Notification window
│   │   ├── drag.html             # Drag and drop interface
│   │   ├── prompt-manager.html   # Prompt management interface
│   │   ├── mcp-setup.html        # MCP setup wizard
│   │   └── ...                   # Other UI windows
│   └── styles/                   # CSS stylesheets
│       └── context-menu.css      # Context menu styling
├── assets/                       # Static assets
│   ├── logos/                    # Application icons and logos
│   │   ├── icon.ico              # Windows icon
│   │   ├── icon1.ico             # Alternative icon
│   │   └── icon1.png             # PNG icon
│   ├── screenshots/              # Application screenshots
│   │   └── ...                   # Various screenshot files
│   └── sounds/                   # Audio files
│       └── ...                   # Notification sounds
├── extension/                    # Chrome extension (MCP SuperAssistant)
│   ├── manifest.json             # Extension manifest
│   ├── background.js             # Extension background script
│   ├── content/                  # Content scripts
│   └── ...                       # Other extension files
├── build/                        # Build configuration files
│   └── EULA.txt                  # End User License Agreement
├── docs/                         # Documentation files
│   └── ...                       # PDF and other documentation
├── .github/                      # GitHub configuration
│   └── ISSUE_TEMPLATE/           # Issue templates
├── package.json                  # Node.js project configuration
├── package-lock.json             # Locked dependencies
├── README.md                     # Project README
├── STRUCTURE.md                  # This file
├── LICENSE                       # MIT License
├── .gitignore                    # Git ignore rules
├── dev-app-update.yml            # Development auto-update config
└── installer.nsh                 # NSIS installer script

```

## Key Files

### Application Entry Points
- **`src/main.js`** - Main Electron process, handles window management, IPC, auto-updates
- **`src/preload.js`** - Preload script that exposes safe APIs to renderer processes
- **`package.json`** - Defines the main entry point as `src/main.js`

### Configuration Files
- **`package.json`** - npm configuration, dependencies, and electron-builder settings
- **`dev-app-update.yml`** - Development auto-update configuration
- **`installer.nsh`** - Custom NSIS installer script
- **`.gitignore`** - Git ignore patterns

### Modules (`src/modules/`)
- **`accounts.js`** - Handles multiple Google account management
- **`constants.js`** - Application-wide constants and configurations
- **`deep-research.js`** - Automated deep research scheduling functionality
- **`settings.js`** - User settings persistence and defaults
- **`tray.js`** - System tray icon and menu management
- **`utils.js`** - Shared utility functions (audio, context menus, etc.)

### UI Files (`src/renderer/`)
All HTML files that serve as windows or dialogs in the application:
- **`index.html`** - Landing/onboarding page
- **`settings.html`** - Settings interface
- **`notification.html`** - Notification popups
- **`drag.html`** - Main Gemini interface with drag-and-drop
- **`prompt-manager.html`** - Prompt management UI
- **`mcp-setup.html`** - MCP configuration wizard
- And more...

### Extension (`extension/`)
The Chrome extension (MCP SuperAssistant) that enhances Gemini's functionality:
- **`manifest.json`** - Extension manifest (version 3)
- **`background.js`** - Service worker for extension
- **`content/`** - Content scripts injected into Gemini pages
- **`_locales/`** - Localization files

## Path References

When updating code, be aware of these common path patterns:

### From `src/main.js`:
```javascript
// Modules
require('./modules/settings')

// HTML files
loadFile('src/renderer/settings.html')

// Preload
path.join(__dirname, 'preload.js')

// Extension (in development)
path.join(__dirname, '..', 'extension')

// Extension (in production)
path.join(process.resourcesPath, 'extension')
```

### From `src/modules/`:
```javascript
// Assets
path.join(__dirname, '..', '..', 'assets', 'logos', 'icon.ico')
path.join(__dirname, '..', '..', 'assets', 'sounds', 'notification.mp3')

// Extension
path.join(__dirname, '..', '..', 'extension')

// Other modules
require('./settings')
```

## Build Process

The build process is configured in `package.json` under the `build` key:

- **Main entry point**: `src/main.js`
- **Extra resources**: `extension/**`, `assets/logos/icon.ico`
- **Icons**: `assets/logos/icon1.png`
- **Build output**: `dist/` directory (gitignored)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for distribution
npm run build
```

## Notes

- All source code is under `src/` for clarity
- Static assets are organized by type in `assets/`
- The extension is in its own directory for modularity
- HTML files for renderer processes are in `src/renderer/`
- Build artifacts go to `dist/` (gitignored)
