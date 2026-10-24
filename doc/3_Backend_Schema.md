# Backend & Data Schema (Client-Side State & Storage Architecture)

## Project: Redirect (Android Deep Settings Utility)
**Architecture:** 100% Client-Side Local State & Persistence (Privacy-First, Offline-First, Zero Remote Backend Dependency).

---

## 1. Overview
The application operates entirely on-device to ensure maximum security, instant launch time, and zero telemetry overhead. Data persistence is managed via **AsyncStorage** (or React Native MMKV for sub-millisecond I/O).

---

## 2. Core Data Models

### 2.1 Setting Item Entity (`SettingItem`)
Defines the deep link action, Android intent parameters, metadata, and keywords for search.

```typescript
export type SettingCategory = 
  | 'banking'      // Settings that directly affect banking/UPI apps
  | 'developer'    // Dev options, USB debugging, wireless debugging
  | 'permissions'  // Special app access, draw over apps, notification access
  | 'privacy'      // Location, camera, microphone, security
  | 'system';      // Battery optimization, default apps, storage

export interface IntentConfig {
  action: string;             // e.g. "android.settings.APPLICATION_DEVELOPMENT_SETTINGS"
  packageName?: string;       // Optional OEM package
  className?: string;         // Optional OEM specific component activity
  dataUri?: string;           // Optional package URI, e.g. "package:com.example.app"
  fallbackActions?: string[]; // Fallback actions if primary fails
}

export interface SettingItem {
  id: string;                 // Unique identifier, e.g. "dev_options"
  title: string;              // "Developer Options"
  shortDescription: string;   // "Disable to allow banking & UPI transactions"
  category: SettingCategory;
  icon: string;               // MaterialCommunityIcons name, e.g. "code-tags"
  accentColor: string;        // Hex color for the icon badge
  intent: IntentConfig;
  keywords: string[];         // ["usb", "debugging", "developer", "gpay", "phonepe", "bank"]
  isBankingCritical: boolean; // Flagged for the "Banking Prep" wizard
  minApiLevel?: number;       // Android API level required (e.g. 26 for Android 8.0)
}
```

---

### 2.2 User Preferences State (`UserPreferences`)
Persisted in local device storage under the key `@redirect_user_preferences`.

```typescript
export interface UserPreferences {
  pinnedSettingIds: string[];  // Ordered array of pinned SettingItem IDs
  frequentlyUsed: Record<string, number>; // Map of settingId -> tap count
  themeMode: 'dark' | 'light' | 'system';
  enableHaptics: boolean;
  hasSeenBankingOnboarding: boolean;
  lastOpenedTimestamp?: number;
}
```

---

### 2.3 OEM & Device Info State (`DeviceContext`)
Computed once at startup via `expo-device` and cached in memory.

```typescript
export interface DeviceContext {
  brand: string;           // "Samsung", "Xiaomi", "Google", "OnePlus"
  modelName: string;       // "Pixel 8 Pro", "Galaxy S24"
  osVersion: string;       // "14"
  apiLevel: number;        // 34
  isSupportedOem: boolean; // true if OEM fallback mappings are registered
}
```

---

## 3. Storage Schema & Storage Keys

| Key | Type | Description |
| :--- | :--- | :--- |
| `@redirect_pinned_ids` | `string[]` (JSON) | Array of IDs currently pinned to the top of the home screen |
| `@redirect_preferences`| `UserPreferences` (JSON) | User settings such as haptic feedback toggle, theme, etc. |
| `@redirect_usage_stats`| `Record<string, number>` | Click counts to populate the "Frequently Used" dynamic list |

---

## 4. Default Seed Data (Sample Registry Entries)

1. **Developer Options:**
   * ID: `dev_options`
   * Action: `android.settings.APPLICATION_DEVELOPMENT_SETTINGS`
   * Category: `developer` | `isBankingCritical: true`
2. **Accessibility Settings:**
   * ID: `accessibility_settings`
   * Action: `android.settings.ACCESSIBILITY_SETTINGS`
   * Category: `banking` | `isBankingCritical: true`
3. **Manage Overlay / Draw Over Apps:**
   * ID: `overlay_permission`
   * Action: `android.settings.action.MANAGE_OVERLAY_PERMISSION`
   * Category: `permissions`
4. **Install Unknown Apps:**
   * ID: `unknown_sources`
   * Action: `android.settings.MANAGE_UNKNOWN_APP_SOURCES`
   * Category: `permissions`
5. **Ignore Battery Optimization:**
   * ID: `battery_optimization`
   * Action: `android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS`
   * Category: `system`
