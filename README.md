<p align="center">
  <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/icon.ico" alt="GeminiDesk Logo" width="128">
</p>

<h1 align="center">GeminiDesk</h1>

<p align="center">
  <strong>A feature-packed, sleek, and powerful desktop client for Google's Gemini.</strong>
  <br />
  Packed with power-user features designed for maximum productivity and seamless workflow integration.
</p>

<p align="center">
    <a href="https://github.com/hillelkingqt/GeminiDesk/releases/latest">
    <img src="https://img.shields.io/github/v/release/hillelkingqt/GeminiDesk?style=for-the-badge&logo=github&label=Latest%20Release" alt="Latest Release">
  </a>
  <a href="https://github.com/hillelkingqt/GeminiDesk/releases">
    <img src="https://img.shields.io/github/downloads/hillelkingqt/GeminiDesk/total?style=for-the-badge&logo=github" alt="Total Downloads">
  </a>
    <a href="https://github.com/hillelkingqt/GeminiDesk/issues">
    <img src="https://img.shields.io/github/issues/hillelkingqt/GeminiDesk?style=for-the-badge&logo=github" alt="Issues">
  </a>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=for-the-badge&logo=windows" alt="Platform: Windows">
</p>

<p align="center">
  <em>GeminiDesk elevates Google's AI from a browser tab into a native desktop powerhouse. No more browser clutter—just pure, focused productivity.</em>
</p>

<p align="center">
  <img src="https://i.imgur.com/your-gif-url.gif" alt="GeminiDesk Demo">
</p>

## 📸 Screenshots

<p align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot1.png" alt="Main Chat Interface" width="260">
        <br>
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot2.png" alt="Settings Window" width="260">
        <br>
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot3.png" alt="Onboarding Screen" width="260">
        <br>
      </td>
            <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot4.png" alt="Onboarding Screen" width="260">
        <br>
      </td>
            <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot5.png" alt="Onboarding Screen" width="260">
        <br>
      </td>
            <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot6.png" alt="Onboarding Screen" width="260">
        <br>
      </td>
            <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot7.png" alt="Onboarding Screen" width="260">
        <br>
      </td>
            <td align="center">
        <img src="https://raw.githubusercontent.com/hillelkingqt/GeminiDesk/main/screenshots/screenshot8.png" alt="Onboarding Screen" width="260">
        <br>
      </td>
    </tr>
  </table>
</p>

---

## ✨ Features

GeminiDesk is more than just a web wrapper. It's a carefully crafted desktop experience loaded with features to supercharge your workflow.

* **📌 Always-On-Top Mode**: Keep Gemini visible over all other windows. Perfect for referencing, coding, or multitasking without losing context.

* **📸 Screenshot to Chat**: Instantly capture any part of your screen. The image is copied to your clipboard and automatically pasted into the chat, ready to be analyzed by Gemini.

* **⚡ On-the-Fly Model Switching**: Use global hotkeys to start a new chat with the exact Gemini model you need, instantly. No more manual switching.

* **⚙️ Full Customization**: Open the settings panel (`⚙️`) to tailor GeminiDesk to your needs.
    * Toggle "Run on Startup" and "Always on Top".
    * Customize every global keyboard shortcut to match your workflow.
    * Manually check for updates or reset the app to its default settings.

* **🧠 Dynamic Header**: The custom draggable header bar displays the title of your current conversation, helping you keep track of different chats.

* **🚀 Smart Updates**: The app checks for new versions once a day in the background. If an update is found, it notifies you with a simple dialog—no automatic downloads. You get a direct link to the latest GitHub release.

* **🎤 Persistent Microphone Permissions**: Grant microphone access once, and the app remembers your choice for seamless voice-to-text input.

* **🔒 Persistent Login**: Sign in to your Google account once, and GeminiDesk keeps you logged in across sessions.

* **💼 Lightweight & Focused**: Enjoy a dedicated environment for Gemini without the memory and CPU overhead of a full web browser.

### ⌨️ Keyboard Shortcuts

Access GeminiDesk's core features from anywhere in your OS with these default global hotkeys (fully customizable in Settings):

| Shortcut                | Action                                  |
| ----------------------- | --------------------------------------- |
| `Alt` + `G`             | Toggle App Visibility (Show / Hide)     |
| `Alt` + `Q`             | Quit Application                        |
| `Ctrl` + `Alt` + `S`    | **Capture Screenshot** to Clipboard & Chat |
| `Alt`  + `F` | **New Chat** with **Flash** Model       |
| `Alt` + `P` | **New Chat** with **Pro** Model         |
| `Alt` + `I`             | Show Instructions/Onboarding Screen     |

---

## 💾 Installation

Getting started with GeminiDesk is simple.

1.  Navigate to the [**Latest Release**](https://github.com/hillelkingqt/GeminiDesk/releases/latest) page.
2.  Download the `GeminiApp-Setup-x.x.x.exe` file.
3.  Run the installer and follow the on-screen instructions. You can choose to run the app at startup during installation.

That's it! GeminiDesk is now installed and ready to use.

---

## 🛠️ For Developers: Building From Source

Interested in contributing or running the development version?

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* [Git](https://git-scm.com/)

### Get Started

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/hillelkingqt/GeminiDesk.git
    cd GeminiDesk
    ```

2.  **Install project dependencies:**
    ```sh
    npm install
    ```

3.  **Run the app in development mode:**
    This will launch the application window.
    ```sh
    npm start
    ```

4.  **Build the distributable installer:**
    The final installer will be located in the `dist/` directory.
    ```sh
    npm run build
    ```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See the `LICENSE` file for more information.
