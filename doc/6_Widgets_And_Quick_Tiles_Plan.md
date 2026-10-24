# Implementation Plan: Android Home Screen Widgets & Quick Settings Tiles for Redirect

## Executive Summary
This document specifies the technical architecture and implementation roadmap for bringing **Redirect's** built-in and custom deep settings shortcuts to the Android OS surface:
1. **Quick Settings Notification Panel Tiles (`TileService`)**: Toggleable / actionable tiles directly in the Android pull-down notification shade.
2. **Native App Widgets (`AppWidgetProvider`)**: 1x1 single-action bento tiles and 4x2 multi-slot pinned shortcuts on the Android Home Screen.
3. **Dynamic 1-Tap Home Screen Pinning (`ShortcutManager.requestPinShortcut`)**: Direct programmatic pinning of any setting card from within the app UI to the home screen.

---

## 1. Operating Model & Structured Multi-Agent Review

### Phase 1: Understanding Lock & Architecture Design (Primary Designer)

#### Requirements Understood:
- Users want to access any built-in or custom deep settings intent (e.g. 5G/SIM, Developer Options, Private DNS, Screen Cast, custom captured screens) without having to open the Redirect app first.
- Two specific OS placement targets:
  1. **Notification Panel**: Quick Settings Tiles in the system shade.
  2. **Mobile Home Screen**: Interactive widgets or direct 1-tap pinned desktop shortcuts.

#### Proposed Architectural Pillars:
1. **Module 1: Android Notification Shade Quick Tiles (`RedirectTileService`)**:
   - Declares multi-slot configurable tiles (`RedirectTileService1`, `RedirectTileService2`, `RedirectTileService3`) in `AndroidManifest.xml`.
   - Users can assign any pinned or custom shortcut to Slot 1, Slot 2, or Slot 3 inside the app.
   - On tap: Immediately executes `startActivityAndCollapse` via a `PendingIntent` with explicit intent fallbacks.
2. **Module 2: 1-Tap Home Screen Shortcuts (`ShortcutManager`)**:
   - Uses Android's native `ShortcutManager.requestPinShortcut()` (Android 8.0+ / API 26+).
   - Adds an "Add to Home Screen" action to each setting card.
   - Generates an adaptive launcher icon with the setting's accent color and title.
3. **Module 3: Home Screen RemoteViews Bento Widget (`RedirectAppWidgetProvider`)**:
   - 1x1 Quick Launch Widget: Configured with a single target intent.
   - 4x2 Bento Grid Widget: Displays the user's top 4 pinned items directly on their home screen using `RemoteViews` with custom sharp corners matching the app theme.
4. **Data Sync Layer (`SharedPreferences` Shared Bridge)**:
   - Native Kotlin services (`TileService`, `AppWidgetProvider`, `ShortcutManager`) cannot easily wait for React Native's JS runtime / AsyncStorage to boot up before launching.
   - A lightweight native bridge synchronizes pinned items and shortcut definitions to Android `SharedPreferences` (`"RedirectSettingsPrefs"`).

---

### Phase 2: Structured Review Loop

#### 1️⃣ Skeptic / Challenger Agent Review
> *“Assume this design fails in production. Why?”*

- **Failure Mode 1 (Android 12/14 Trampoline & Background Launch Restrictions)**:
  - Starting with Android 12, Google banned "notification/service trampolines" (services starting background activities). On Android 14 (API 34), `startActivityAndCollapse(Intent)` is deprecated in favor of `PendingIntent` with `FLAG_IMMUTABLE`.
  - *Risk:* If implemented as bare `startActivity()`, the OS silently blocks the launch with `SecurityException` or ignores the click.
- **Failure Mode 2 (Missing React Native Engine Cold-Start Latency)**:
  - If a Quick Tile or Widget tries to execute through React Native's JavaScript thread, cold starts will cause a 2 to 4-second delay or fail if the app process was killed.
- **Failure Mode 3 (OEM Tile Duplication Limits)**:
  - Samsung OneUI, Xiaomi HyperOS, and Google Pixel limit the number of dynamic Quick Settings tiles an app can register. You cannot create 50 tiles dynamically at runtime.

#### 2️⃣ Constraint Guardian Agent Review
> *Focus: Performance, OS limits, Security, Reliability*

- **Constraint 1 (Zero JS Boot Latency)**:
  - Tile clicks and Widget clicks **MUST execute purely in native Kotlin**. The `Intent` must be fired directly from the `TileService` or `BroadcastReceiver` without booting the React engine.
- **Constraint 2 (Safe Storage & Intent Validation)**:
  - Custom intents stored in `SharedPreferences` could theoretically be tampered with. The native receiver must sanitize intent strings to prevent arbitrary command injection.
- **Constraint 3 (Tile Slot Allocation)**:
  - Pre-allocate exactly **3 Quick Setting Tile Services** (`TileService1`, `TileService2`, `TileService3`) in `AndroidManifest.xml`. Users configure which shortcut is mapped to "Redirect Quick Tile 1", "Tile 2", and "Tile 3" inside the app's Settings.

#### 3️⃣ User Advocate Agent Review
> *Focus: Cognitive load, UX friction, Onboarding*

- **Issue 1 (Manual Widget Setup Friction)**:
  - Long-pressing the home screen -> scrolling through widget menus -> placing a widget -> selecting a shortcut is tedious.
  - *Recommendation:* Implement **1-Tap "Add to Home Screen"** (`ShortcutManager.requestPinShortcut`). The user taps an icon directly in the card or modal, Android prompts "Add to home screen?", and it appears instantly.
- **Issue 2 (Visual Feedback & Error States)**:
  - If an OEM skin (e.g. MIUI/ColorOS) blocks an intent when tapped from a Quick Tile, the user needs immediate haptic/toast feedback rather than silent failure.

---

### Phase 3: Integration & Arbitration (Integrator Decision Log)

| Decision Item | Chosen Approach | Rejected Alternative | Rationale |
|---|---|---|---|
| **Quick Tile Execution** | Direct native Kotlin launch via `PendingIntent` | Routing through React Native bridge | Eliminates cold-start latency; launches instantly even if app is terminated. |
| **Tile Quantity** | 3 configurable slot services (`Slot 1`, `Slot 2`, `Slot 3`) | Unlimited dynamic tiles | Android OS limits `TileService` to declared manifest classes. 3 slots covers 99% of user needs. |
| **Home Screen Integration** | Dual approach: Direct `requestPinShortcut` + `RemoteViews` Bento Widget | Widget only | `requestPinShortcut` is a 1-tap zero-friction action; widgets provide rich bento presentation. |
| **State Sharing** | Android `SharedPreferences` sync module | Reading AsyncStorage files on disk | Native services have instant thread-safe access to `SharedPreferences`. |

**Final Disposition**: **APPROVED** (Ready for phased execution).

---

## 2. Technical Implementation Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          React Native Application            │
                  │  (User pins/customizes shortcuts in Bento UI)│
                  └──────────────────────┬───────────────────────┘
                                         │ Native Bridge Sync
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Android SharedPreferences ("Redirect")    │
                  │  (Stores JSON of actions, pkgs, classes)     │
                  └──────┬───────────────────────┬───────────────┘
                         │                       │
         ┌───────────────┴────────┐    ┌─────────┴────────────────┐
         ▼                        ▼    ▼                          ▼
┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────────────┐
│ TileService 1,2,3│ │  ShortcutManager │ │    AppWidgetProvider        │
│ (Quick Settings) │ │ (1-Tap Home Icon)│ │ (Home Screen Bento RemoteViews)│
└──────────────────┘ └──────────────────┘ └─────────────────────────────┘
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Native Storage Bridge (`RedirectPreferencesModule.kt`)
- Create a native bridge module that syncs pinned shortcuts and tile configurations directly to Android's `SharedPreferences`.
- Expose methods: `syncShortcuts(jsonList)`, `setQuickTileSlot(slotIndex, shortcutId)`.

### Phase 2: 1-Tap Home Screen Pinning (`NativeShortcutPinModule.kt`)
- Implement `ShortcutManager.requestPinShortcut()` for Android 8.0+.
- Create adaptive dynamic shortcuts with matching vector icon/accent color and intent target.
- Add an "Add to Home Screen" button in the card menu.

### Phase 3: Quick Settings Notification Panel Tiles (`TileService.kt`)
- Declare 3 configurable `TileService` implementations:
  - `Slot 1: Quick Redirect A`
  - `Slot 2: Quick Redirect B`
  - `Slot 3: Quick Redirect C`
- On `onClick()`: Read target intent from `SharedPreferences`, construct `PendingIntent`, call `startActivityAndCollapse()`.
- Add an in-app "Tile Configuration" modal to assign any shortcut to a specific tile slot.

### Phase 4: Home Screen Bento Widget (`RedirectBentoWidget.kt`)
- Create `res/layout/widget_bento_grid.xml` using sharp corners (`#FFFFFF`, `borderRadius: 4dp`, glass border).
- Register `AppWidgetProvider` in `AndroidManifest.xml`.
- When shortcuts update, send broadcast update to refresh widget `RemoteViews`.
