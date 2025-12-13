# Linux Testing Guide for Bug Fixes

This document describes how to test the three Linux-specific bug fixes.

## Prerequisites
- Linux system (Ubuntu, Debian, Fedora, etc.)
- AppImage build of GeminiDesk v8.1.3+

## Issue 1: Tray Icon Context Menu (Right-Click)

### Before Fix:
- Right-clicking the tray icon showed nothing or an empty menu
- Only left-click worked to show/hide the app

### After Fix:
Right-clicking should show a full context menu with options:
- Open GeminiDesk
- New Window
- Accounts submenu
- Settings
- Quit

### How to Test:
1. Start GeminiDesk AppImage
2. Look for the GeminiDesk icon in your system tray
3. **Right-click** the tray icon
4. ✅ **Expected:** Full context menu appears with all options
5. ❌ **Fail:** Empty menu or no menu appears

## Issue 2: Right-Click Copy on Text

### Before Fix:
- Right-clicking on text showed "Copy" option
- Option disappeared immediately when mouse button was released
- Had to hold mouse button down while clicking "Copy"

### After Fix:
Menu should stay visible after releasing right-click button

### How to Test:
1. Open GeminiDesk
2. Find any text in the Gemini response
3. **Right-click** on the text
4. **Release the mouse button immediately**
5. ✅ **Expected:** Copy menu stays visible, can be clicked
6. ❌ **Fail:** Menu disappears when button is released

## Issue 3: AppImage Startup Time

### Before Fix:
- AppImage took ~60 seconds to open
- Window appeared but was slow to become interactive
- Long delay with blank screen or frozen UI

### After Fix:
- Startup should be ~5-10 seconds
- Window appears quickly
- UI is responsive immediately

### How to Test:
1. Close GeminiDesk completely
2. Use a stopwatch or timer
3. Double-click the AppImage file
4. Start timer when you click
5. Stop timer when the main window appears and is interactive
6. ✅ **Expected:** Opens in 5-15 seconds
7. ❌ **Fail:** Takes more than 30 seconds

### Detailed Timing Test:
```bash
# Command line test with timing
time ./GeminiDesk-8.1.3-linux-x86_64.AppImage
```

## Technical Details

### Changes Made:

1. **Tray Menu** (`modules/tray.js`):
   - Added `tray.on('right-click')` event handler
   - Calls `updateTrayContextMenu()` on right-click

2. **Context Menu** (`modules/utils.js`):
   - Used `setImmediate()` on Linux to defer menu popup
   - Prevents menu from closing on button release

3. **Startup Performance** (`main.js`):
   - Enabled hardware acceleration on Linux (was disabled)
   - Deferred extension loading by 2 seconds
   - Made extension loading non-blocking

## Reporting Results

Please test all three issues and report:
- ✅ Working as expected
- ⚠️ Partially working (specify what works/doesn't)
- ❌ Not working (provide details)

Include:
- Linux distribution and version
- Desktop environment (GNOME, KDE, XFCE, etc.)
- GeminiDesk version
- Any error messages in console

## Known Limitations

- Hardware acceleration auto-detection depends on DISPLAY or WAYLAND_DISPLAY environment variables
- Extension loading delay is fixed at 2 seconds (may need adjustment)
- Right-click timing fix specific to Linux platform

## Troubleshooting

### If startup is still slow:
Check console output for messages about hardware acceleration and extension loading:
```bash
./GeminiDesk-8.1.3-linux-x86_64.AppImage 2>&1 | grep -i "hardware\|extension\|loading"
```

### If tray menu not working:
- Verify your desktop environment has a system tray
- Some minimal window managers may not support tray icons
- Try both left-click and right-click

### If copy menu disappears:
- This fix is specific to Linux
- Ensure you're running the updated version (8.1.3+)
- Check that the app was built with these changes
