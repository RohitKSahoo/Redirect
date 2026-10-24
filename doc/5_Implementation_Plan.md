# Phased Implementation Plan

## Project: Redirect (Android Deep Settings Utility via Expo Dev Client)
**Status:** Ready to execute

---

## Phase Overview

| Phase | Title | Objectives | Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Project Scaffolding & Setup** | Initialize Expo project with TypeScript, configure Expo Dev Client dependencies, and set up project folder structure. | Clean initialized Expo template, `package.json`, configured `app.json`. |
| **Phase 2** | **Core Service Layer & Intent Engine** | Build the settings registry database, intent launcher service (`expo-intent-launcher`), OEM detector, and error fallback handlers. | `src/services/intentService.ts`, `src/data/settingsRegistry.ts`, `src/services/deviceService.ts`. |
| **Phase 3** | **Local State & Persistence** | Implement storage repository for pinned shortcuts, recent/frequent items, and user preferences using AsyncStorage. | `src/services/storageService.ts`, custom hooks `useSettingsStore.ts`. |
| **Phase 4** | **UI Design System & Components** | Build reusable components (Search bar, category chips, setting action cards, pinned carousel, hero banking prep card, and OEM diagnostic badges) according to the frontend guidelines. | `src/components/*` with full theme styling and haptics. |
| **Phase 5** | **Screens & Navigation Assembly** | Assemble the `HomeScreen`, `BankingPrepModal`, and `DiagnosticsModal` into a seamless, high-performance interface. | Complete end-to-end interactive mobile app viewable in Expo. |
| **Phase 6** | **Dev Client Configuration & Verification** | Generate Android native project (`npx expo prebuild` / dev client config), verify Android intents on device/emulator, and document run steps. | Fully working Expo Dev Client build config + README with execution commands. |

---

## Detailed Step-by-Step Task Breakdown

### Phase 1: Project Scaffolding
- [ ] Initialize modern Expo project in `./` with blank TypeScript template.
- [ ] Install core dependencies:
  - `expo-intent-launcher` (Android deep link launcher)
  - `expo-haptics` (Tactile feedback)
  - `expo-device` (Device/OEM detection)
  - `@react-native-async-storage/async-storage` (State persistence)
  - `lucide-react-native` or `@expo/vector-icons` (Iconography)
  - `expo-dev-client` (Development build runner)
- [ ] Establish directory structure (`src/components`, `src/data`, `src/services`, `src/types`, `src/screens`, `src/theme`).

### Phase 2: Intent Engine & Settings Registry
- [ ] Define comprehensive TypeScript interfaces (`SettingItem`, `IntentConfig`, `DeviceContext`).
- [ ] Populate `settingsRegistry.ts` with verified Android action intents:
  - Developer Options (`APPLICATION_DEVELOPMENT_SETTINGS`)
  - Accessibility (`ACCESSIBILITY_SETTINGS`)
  - Draw Over Apps (`MANAGE_OVERLAY_PERMISSION`)
  - Unknown Apps (`MANAGE_UNKNOWN_APP_SOURCES`)
  - Battery Optimization (`IGNORE_BATTERY_OPTIMIZATION_SETTINGS`)
  - Notification Access (`NOTIFICATION_LISTENER_SETTINGS`)
  - App Details / Permissions
  - Security / Screen Lock
- [ ] Build `intentService.ts` to wrap `startActivityAsync` with `try/catch` and OEM fallback logic.

### Phase 3: Storage & State Management
- [ ] Implement `storageService.ts` for saving:
  - `pinnedSettingIds`
  - `usageCounts`
  - Preferences (theme, haptics)
- [ ] Build reactive state hook (`useSettingsStore`) to handle pinning/unpinning, searching, and filtering without unnecessary re-renders.

### Phase 4: UI Components & Aesthetics
- [ ] Define theme tokens (`src/theme/colors.ts`, `typography.ts`).
- [ ] Build `Header.tsx` with dynamic OEM badge (e.g., `Samsung • Android 14`).
- [ ] Build `BankingPrepCard.tsx` (Hero action card with quick 2-step buttons for GPay/PhonePe readiness).
- [ ] Build `SettingActionCard.tsx` (Icon, Title, Description, Pin Star, Launch chevron).
- [ ] Build `SearchBar.tsx` & `CategoryPills.tsx` (Fuzzy keyword search).

### Phase 5: Screen Integration
- [ ] Integrate into `HomeScreen.tsx`:
  - Quick Pinned row (if items pinned).
  - Banking Prep banner.
  - Search & Category tabs.
  - Complete scrollable list.
- [ ] Add `IntentErrorModal.tsx` for gracefully handling unsupported OEM screens.

### Phase 6: Build Verification & Documentation
- [ ] Validate hot-reloading with Expo.
- [ ] Test intent dispatching.
- [ ] Write clear run instructions in `README.md` for both Expo Dev Client and standard development.
