# Frontend Guidelines & UI/UX Standards

## Project: Redirect (Android Deep Settings Utility)
**Tech Stack:** React Native (Expo Dev Client) + TypeScript  
**Styling Philosophy:** High-performance, tokenized styling using `StyleSheet.create` with an opinionated Design System (inspired by Material You / Glassmorphic Dark UI).

---

## 1. Visual Identity & Theme Tokens

### 1.1 Color Palette (Dark-First Theme with OLED Support)
* **Background Primary:** `#0F1117` (Deep Obsidian)
* **Background Secondary / Surface:** `#181B24` (Elevated Card)
* **Surface Highlight / Border:** `#282D3D` (Subtle 1px border)
* **Primary Accent:** `#4F75FF` (Vibrant Electric Blue - Interactive buttons & icons)
* **Warning / Alert:** `#FFAB00` (Amber - Developer Options & Sensitive settings)
* **Success / Safe:** `#00C853` (Emerald - Ready for Banking)
* **Text Primary:** `#F8FAFC` (Clean white high emphasis)
* **Text Secondary:** `#94A3B8` (Slate medium emphasis)
* **Text Tertiary / Muted:** `#64748B` (Low emphasis meta-info)

### 1.2 Typography
* **Header / Hero:** 24px - 28px, Bold / SemiBold (`700`), letter-spacing: `-0.5px`
* **Card Titles:** 16px - 18px, SemiBold (`600`)
* **Body / Description:** 13px - 14px, Regular (`400`), line-height: `20px`
* **Badges / Tags:** 11px - 12px, Medium (`500`), uppercase or capitalized with pill radius

---

## 2. Component Architecture

### 2.1 Core Component Tree
```text
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx           # Search bar + OEM status pill
│   │   ├── SearchBar.tsx        # High-response fuzzy search input
│   │   ├── CategoryPills.tsx    # Horizontal scrolling chip filters
│   │   ├── Badge.tsx            # Tag badges (e.g., "Critical", "OEM Custom")
│   │   └── Toast.tsx            # Custom non-intrusive feedback toast
│   ├── cards/
│   │   ├── SettingActionCard.tsx # Main clickable card with icon, title, desc, and pin button
│   │   └── BankingPrepCard.tsx   # Hero card with sequential action prompts
│   └── modals/
│       └── IntentErrorModal.tsx  # Fallback modal if an OEM refuses an intent
├── screens/
│   ├── HomeScreen.tsx           # Pinned shortcuts + All settings
│   ├── BankingGuideScreen.tsx   # Step-by-step banking prep flow
│   └── DeviceInfoScreen.tsx     # OEM details & diagnostics
```

---

## 3. UI/UX Interaction Principles

1. **Instant Feedback & Haptics:**
   * Every tap on an action card triggers light haptic feedback (`expo-haptics`).
   * Visual active opacity changes instantly (`activeOpacity={0.7}`).

2. **Zero-Latency Search:**
   * Search queries index `title`, `description`, and `keywords` (e.g., typing "gpay" matches Developer Options and Accessibility).
   * Search results filter in-memory with debounce or immediate string normalization.

3. **Pinning & Reordering:**
   * Single tap on the bookmark/star icon pins the card to the "Quick Access" header section.
   * Pinned state updates immediately and syncs with AsyncStorage.

4. **Error Handling UX:**
   * If an intent fails to launch (e.g., on custom modified OEM ROMs), the card must not silently crash.
   * Trigger a gentle modal with step-by-step navigation instructions for the detected device manufacturer.
