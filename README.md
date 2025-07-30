# GeminiDesk 🚀

<p align="center">
  <strong>A sleek, feature-rich, always-on-top desktop wrapper for Google's Gemini.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=for-the-badge&logo=windows" alt="Platform: Windows">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License: MIT">
</p>

<p align="center">
  <em>(Suggestion: Add a screenshot of the app in action here!)</em>
  <br>
  </p>

## About The Project

GeminiDesk provides a seamless and integrated way to access Google's Gemini AI directly from your desktop. No more searching through browser tabs! This lightweight wrapper is designed for productivity, keeping Gemini always within reach with a minimal and clean interface.

Built with Electron, it offers a native-app experience with powerful features that a standard browser tab can't match.

## ✨ Key Features

* **📌 Always on Top:** Pin GeminiDesk to stay on top of all other windows, making it perfect for multitasking.
* **🎨 Minimalist Borderless UI:** A clean, beautiful interface with a custom 30px draggable header. No unnecessary browser clutter.
* **⚡ Global Hotkey:** Instantly show or hide the app from anywhere in the OS with a global hotkey (**Ctrl+G**).
* **🔒 Persistent Session:** Stay logged in to your Google account. No need to sign in every time you launch the app.
* **🚀 Run at Startup:** The installer gives you the option to launch GeminiDesk automatically when your computer starts.
* **🤫 Hide, Don't Close:** The app runs quietly in the background. Hide it when you don't need it and bring it back instantly.
* **💼 Lightweight:** A focused, lightweight wrapper without the overhead of a full browser.

## 💾 Installation

For most users, the easiest way to install GeminiDesk is to use the official installer.

1.  Go to the [**Releases**](https://github.com/YOUR_USERNAME/GeminiDesk/releases) page of this repository.
2.  Download the latest `GeminiApp-Setup-x.x.x.exe` file.
3.  Run the installer and follow the on-screen instructions.

That's it! You can now launch GeminiDesk from your Start Menu or Desktop.

## ⌨️ How to Use

| Shortcut      | Action                               |
|---------------|--------------------------------------|
| **`Ctrl + G`** | Toggles the visibility (Show / Hide) |
| **`Ctrl + Q`** | Quits the application completely     |

To move the window, simply click and drag the dark grey bar at the top of the application.

## 🛠️ For Developers: Building from Source

If you want to contribute or build the application yourself, follow these steps.

### Prerequisites

* [Node.js](https://nodejs.org/) (which includes npm)

### Steps

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/YOUR_USERNAME/GeminiDesk.git](https://github.com/YOUR_USERNAME/GeminiDesk.git)
    cd GeminiDesk
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the app in development mode:**
    ```sh
    npm start
    ```

4.  **Build the distributable installer:**
    The installer will be created in the `dist/` directory.
    ```sh
    npm run build
    ```

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.
