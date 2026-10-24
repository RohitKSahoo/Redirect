# Product Requirements Document (PRD)

## Project: Redirect (Android Deep Settings & Quick-Access Utility)
**Status:** Approved for Implementation  
**Target Platform:** Android (via Expo Dev Client / React Native)  
**Target Audience:** Android developers, power users, automation tool users, and everyday users who need quick access to nested settings (e.g., turning off Developer Options or Accessibility Services to use banking/payment apps).

---

## 1. Problem Statement
Modern banking, finance, and payment apps (e.g., Google Pay, PhonePe, corporate apps, banking portals) mandate security checks that block access when:
1. **Developer Options / USB Debugging** is turned on.
2. Specific **Accessibility Services** (automation apps, macro tools, screen utilities) are active.

Finding and toggling these settings requires deep navigation across 4 to 6 separate menus inside the Android Settings app. This manual process is repetitive, unintuitive, and causes significant user friction during time-sensitive tasks (e.g., paying at a counter).

---

## 2. Product Objectives & Success Metrics
* **Core Objective:** Provide 1-tap direct navigation to target settings pages (e.g., Developer Options, Accessibility, Draw Over Apps, Special App Access).
* **Speed:** Reduce navigation time from ~20-30 seconds to <2 seconds.
* **Reliability:** 100% intent dispatch reliability with fallback handlers for OEM custom skins (Samsung One UI, Xiaomi HyperOS/MIUI, ColorOS/OxygenOS, etc.).
* **Extensibility:** Foundation structured to allow Quick Settings (QS) Tiles, App Shortcuts, and Shizuku/ADB automated toggles in future phases.

---

## 3. Key User Personas
1. **Developer/Tester:** Regularly toggles USB debugging and needs to pay for meals or check bank balances throughout the day.
2. **Power User:** Uses accessibility-based tools (Bitwarden autofill, Tasker, custom gestures) and needs quick access to disable them temporarily for banking apps.
3. **General User:** Needs quick access to buried permissions like "Install Unknown Apps", "Battery Optimization", or "Notification Access".

---

## 4. Scope & Feature Requirements

### MVP (Phase 1) Scope:
1. **Curated Settings Directory:**
   * **Developer Options** (`Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS`)
   * **Accessibility Settings** (`Settings.ACTION_ACCESSIBILITY_SETTINGS`)
   * **Draw Over Other Apps / Manage Overlay** (`Settings.ACTION_MANAGE_OVERLAY_PERMISSION`)
   * **Install Unknown Apps** (`Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES`)
   * **Special App Access / Battery Optimization** (`Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`)
   * **Notification Listener Access** (`Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS`)
   * **Device Security & Biometrics** (`Settings.ACTION_SECURITY_SETTINGS`)
   * **App Info / Detailed Permissions** (Per-app picker or system list)

2. **"Banking Prep" Quick Action Card:**
   * A hero/featured action module that sequentially highlights the exact 2-3 settings banking apps complain about (Developer Options + Accessibility).

3. **Search & Category Filters:**
   * Instant search across settings names, descriptions, and keywords (e.g., searching "usb" or "gpay" surfaces Developer Options).
   * Category tabs: *All*, *Security & Banking*, *Developer*, *Permissions*, *Device*.

4. **Favorites / Pinned Shortcuts:**
   * Ability to pin frequently used deep links to the top of the dashboard.

5. **Device & OEM Diagnostics:**
   * Displays detected Android version, API level, and OEM Manufacturer (e.g., Samsung, Google, Xiaomi) to apply OEM-specific intent fallbacks when standard Android intents fail.

### Post-MVP (Phase 2+) Out-of-Scope for Now:
* Automatic toggling via Shizuku / ADB (without opening the page).
* Background service monitors.

---

## 5. Non-Functional Requirements
* **Startup Performance:** Cold start in <1.2 seconds.
* **UI/UX Aesthetics:** Modern Material 3 / Glassmorphic dark and light theme with haptic feedback on card tap.
* **Error Resilience:** When an intent fails on custom OEM builds, display a clear diagnostic alert with fallback manual instructions rather than crashing.
* **Offline-Only / Privacy-First:** Zero network dependencies, zero telemetry tracking; all state saved locally in device storage.
