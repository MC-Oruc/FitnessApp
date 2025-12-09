# 🏋️‍♂️ FitnessApp

![Expo](https://img.shields.io/badge/Expo-SDK_51-000.svg?style=flat&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.74-blue.svg?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg?style=flat&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)

> **Open-source Expo fitness companion.** Built for lifters who value data privacy and performance.

FitnessApp is a local-first, lightweight workout tracker and anatomy explorer. It helps users discover exercises by muscle group, plan sessions, and track progress without bloated cloud dependencies or complex registrations.

## ✨ Features

* **🧬 Anatomy Explorer:** Interactive SVG-based body map (Front/Back). Click a muscle to see relevant exercises.
* **📚 Rich Exercise Library:** Deep filtering by equipment, muscle zones (e.g., Back > Lats), and CNS fatigue levels.
* **📊 Profile & Progress:** Log sets, track body metrics, and manage programs. All data is stored locally on-device.
* **🌍 Bilingual & Themeable:** Native support for English/Turkish (`en/tr`) and System/Light/Dark modes.
* **⚡ Performance First:** Built with `Reanimated v3` and `FlashList` for 60fps interactions.

## 🏗 Architecture & Philosophy

This project follows **KISS (Keep It Simple, Stupid)** and **YAGNI** principles explicitly.

* **State Management:** Deliberately avoids global store libraries (Redux/Zustand). Uses **React Context** for static config (Theme/I18n) and **Local State/Route Params** for data flow to minimize bundle size and complexity.
* **Local-First:** User data is persisted via `expo-file-system` as JSON. No backend latency, total privacy, offline-first.
* **Strict Typing:** TypeScript is set to `strict` mode with no implicit any, ensuring robust and maintainable code.
* **Component Structure:**
    * **Loose Coupling:** UI components are decoupled from logic hooks.
    * **Tokens:** Design system relies on `src/theme/tokens.ts` for consistency.

## 🛠 Tech Stack

- **Core:** Expo SDK 51, React Native 0.74, React 18
- **Language:** TypeScript
- **Navigation:** React Navigation (Material Top Tabs positioned bottom)
- **UI/UX:** React Native SVG, Reanimated v3, Gesture Handler
- **Storage:** Expo File System

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (use `npm` strictly to respect `package-lock.json`)

### Installation

1.  **Clone & Install:**
    ```bash
    git clone [https://github.com/yourusername/fitness-app.git](https://github.com/yourusername/fitness-app.git)
    cd fitness-app
    npm install
    ```

2.  **Run the App:**
    ```bash
    npm start
    ```
    *Press `a` for Android Emulator, `i` for iOS Simulator, or scan with Expo Go.*

### Useful scripts
- `npm run android` — start Metro and open Android
- `npm run ios` — start Metro and open iOS
- `npm run web` — run on web
- `npm run typecheck` — TypeScript no-emit check
- `npm run build:android:apk` — EAS preview APK
- `npm run build:android:release` / `npm run build:ios:release` — EAS production builds

## 📂 Project Structure

```text
src/
├── components/    # Shared UI (Cards, Buttons, Atoms)
├── data/          # Static Data (exercises.json) & Helpers
├── hooks/         # Logic & Custom Hooks
├── i18n/          # Translations (en/tr)
├── navigation/    # Tab & Stack Navigators
├── screens/       # Page-level Components
├── theme/         # Design Tokens & Theme Provider
└── utils/         # Helper functions
```

## 🤝 Contributing

Contributions are welcome\! Please follow these rules:

1. Fork and create a feature branch.
2. Run `npm run typecheck` before opening a PR.
3. Keep screens lean; extract reusable UI to `src/components/` and logic to hooks.
4. Follow alias imports (`@/...`) instead of deep relatives.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
