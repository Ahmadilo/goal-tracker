# 🎯 Goal Tracker v0.1.0

A high-performance, lightweight desktop application for tracking personal goals, built with the power of **Rust** and the elegance of **Tauri 2.0**.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Built with Rust](https://img.shields.io/badge/built%20with-Rust-orange.svg)
![UI Tailwind](https://img.shields.io/badge/UI-Tailwind_CSS_v4-38bdf8.svg)

## ✨ Features
- **Blazing Fast:** Minimal resource usage thanks to the Rust backend.
- **Privacy First:** All data is stored locally in a `data.json` file. No cloud, no tracking.
- **Modern UI:** Clean and responsive interface built with Tailwind CSS v4.
- **Native Experience:** Custom window decorations, transparent effects, and professional MSI installer.

## 🛠️ Tech Stack
- **Backend:** [Rust](https://www.rust-lang.org/) & [Tauri 2.0](https://tauri.app/)
- **Frontend:** TypeScript & [Tailwind CSS v4](https://tailwindcss.com/)
- **Build System:** Vite
- **Installer:** WiX Toolset (MSI)

## 📁 Project Structure
The project structure was managed and visualized using my custom-built tool `ptree`.

```text
src-tauri
├── src/
│   ├── lib.rs        # Core logic & State management
│   └── main.rs       # App entry point
├── icons/            # Custom branded icons
└── tauri.conf.json   # App configuration