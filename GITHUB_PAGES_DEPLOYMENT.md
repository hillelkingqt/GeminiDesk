# GitHub Pages Deployment for Test Builds

## Overview

This repository uses GitHub Pages to distribute test builds instead of uploading large files directly to Telegram (which has a 50MB limit for bots).

## How It Works

1. **Build Phase**: The workflow builds the application for Windows, Linux, and macOS platforms.

2. **Rename for Consistency**: Build artifacts are renamed to consistent filenames:
   - `GeminiDesk-Setup.exe` (Windows)
   - `GeminiDesk.dmg` (macOS)
   - `GeminiDesk.AppImage` (Linux AppImage)
   - `GeminiDesk.deb` (Linux DEB)

3. **Deploy to GitHub Pages**: Files are deployed to the `gh-pages` branch, which overwrites previous builds.

4. **Send Links via Telegram**: Instead of uploading files, download links are sent to Telegram.

## Benefits

✅ **No Size Limit**: Can share files larger than 50MB (up to 2GB with GitHub Pages)  
✅ **Auto-Overwrite**: Each build overwrites the previous one - no clutter  
✅ **Public Access**: Anyone can download builds from the GitHub Pages URL  
✅ **No Release Spam**: Doesn't create GitHub releases or confuse users  
✅ **Fast Sharing**: Telegram receives links instantly

## Access URLs

After the workflow runs, builds are available at:

- **Base URL**: `https://hillelkingqt.github.io/GeminiDesk/`
- **Windows**: `https://hillelkingqt.github.io/GeminiDesk/GeminiDesk-Setup.exe`
- **macOS**: `https://hillelkingqt.github.io/GeminiDesk/GeminiDesk.dmg`
- **Linux AppImage**: `https://hillelkingqt.github.io/GeminiDesk/GeminiDesk.AppImage`
- **Linux DEB**: `https://hillelkingqt.github.io/GeminiDesk/GeminiDesk.deb`

## Workflow Changes

The `telegram-upload` job has been replaced with `github-pages-deploy` which:

1. Downloads artifacts from all build jobs
2. Renames them to consistent names
3. Creates an `index.html` for easy web access
4. Deploys everything to GitHub Pages using `peaceiris/actions-gh-pages@v4`
5. Sends download links to Telegram

## Important Notes

⚠️ **Test Builds Only**: These are test builds, not official releases  
⚠️ **Overwritten**: Each new build overwrites the previous one  
⚠️ **Public**: All builds are publicly accessible via GitHub Pages  
⚠️ **Enable GitHub Pages**: Ensure GitHub Pages is enabled in repository settings for the `gh-pages` branch

## Setup Instructions

### 1. Configure Telegram Bot (if not already done)

1. Create a Telegram bot with [@BotFather](https://t.me/botfather)
2. Get your bot token (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
3. Get your chat ID:
   - Send a message to your bot
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

### 2. Add GitHub Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:
   - **Name**: `TELEGRAM_BOT_TOKEN`, **Value**: Your bot token
   - **Name**: `TELEGRAM_CHAT_ID`, **Value**: Your chat ID
3. `GITHUB_TOKEN` is automatically provided by GitHub Actions (no setup needed)

### 3. Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section in the left sidebar
3. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

⚠️ **Note**: The `gh-pages` branch will be created automatically by the workflow on the first run. After the first deployment, come back and enable GitHub Pages.

## Configuration

Required secrets in GitHub Actions:
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `TELEGRAM_CHAT_ID`: Your Telegram chat ID
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## URLs After Setup

GitHub Pages will be available at `https://hillelkingqt.github.io/GeminiDesk/` after the first deployment.
