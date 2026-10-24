# Redirect (Android Deep Settings & Quick-Access Utility)

**Redirect** is an Android utility built with React Native and Expo (supporting Expo Dev Client) that solves the friction of accessing deeply nested Android settings. Specifically, it enables instant access to settings that interfere with banking, payment, and UPI apps (e.g., **Developer Options / USB Debugging** and **Accessibility Services**), as well as power-user permissions like Draw Over Apps and Install Unknown Sources.

---

## 🚀 Features

- 🏦 **Banking & Payment Quick Prep:** 1-tap direct launchers for the 2 critical settings checked by Google Pay, PhonePe, and banking apps.
- ⭐ **Pinned Shortcuts:** Star and unpin your most frequent deep settings for persistent quick access in a horizontal carousel.
- 🔍 **Instant Fuzzy Search:** Search across settings names, descriptions, and keywords (e.g. searching "usb", "gpay", or "sideload").
- 🏷️ **Category Filter Chips:** Instant grouping for *Banking Prep*, *Developer*, *Permissions*, *Privacy*, and *System*.
- 📱 **OEM Diagnostics & Smart Fallbacks:** Automatically detects device manufacturer (Samsung, Xiaomi, Google, OnePlus, etc.) and gracefully handles custom ROM screen reorganizations without crashing.
- 📳 **Haptic Tactile Feedback:** Native tactile response on every interaction.
- 🔒 **Zero Permissions & Offline:** No root required, no telemetry, no network calls.

---

## 📂 Project Structure

```text
Redirect/
├── doc/                        # Architecture & Planning Documentation
│   ├── 1_PRD.md
│   ├── 2_Frontend_Guideline.md
│   ├── 3_Backend_Schema.md
│   ├── 4_App_Flow.md
│   └── 5_Implementation_Plan.md
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── BankingPrepCard.tsx  # Hero 2-step banking prep card
│   │   ├── CategoryPills.tsx    # Filter chips
│   │   ├── DiagnosticsModal.tsx # OEM and device info modal
│   │   ├── Header.tsx           # App brand & OEM status badge
│   │   ├── IntentErrorModal.tsx # Graceful OEM fallback modal
│   │   ├── PinnedShortcuts.tsx  # Starred items carousel
│   │   ├── SearchBar.tsx        # High-response search bar
│   │   └── SettingActionCard.tsx# Clickable setting tile with pin star
│   ├── data/
│   │   └── settingsRegistry.ts # Curated Android intents & keyword map
│   ├── services/
│   │   ├── deviceService.ts    # Hardware & OEM detection
│   │   ├── intentService.ts    # IntentLauncher wrapper with fallbacks
│   │   └── storageService.ts   # AsyncStorage preferences & pin manager
│   ├── theme/
│   │   └── colors.ts           # Dark OLED design system colors
│   └── types/
│       └── index.ts            # TypeScript definitions
├── App.tsx                     # Main dashboard assembly
└── app.json                    # Expo Dev Client configuration
```

---

## 🛠️ How to Run

### Option 1: Standard Development (Expo Go or Dev Client)
Start the Metro development server with instant Hot Reload:

```bash
npm start
```
- Press `a` to open in an Android Emulator or connected device via ADB.
- Or scan the QR code with your phone.

### Option 2: Run with Android Dev Client
If building the native Android debug APK directly on your machine:

```bash
npx expo run:android
```
