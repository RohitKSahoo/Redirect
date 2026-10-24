export type SettingCategory =
  | 'all'
  | 'banking'      // Settings that directly affect banking/UPI apps
  | 'developer'    // Dev options, USB debugging, wireless debugging
  | 'permissions'  // Special app access, draw over apps, notification access
  | 'privacy'      // Location, camera, microphone, security
  | 'system';      // Battery optimization, default apps, storage

export interface IntentConfig {
  action: string;             // Android Intent action string (e.g. "android.settings.APPLICATION_DEVELOPMENT_SETTINGS")
  packageName?: string;       // Optional OEM package
  className?: string;         // Optional OEM specific component activity
  dataUri?: string;           // Optional package URI, e.g. "package:com.example.app"
  fallbackActions?: string[]; // Fallback actions if primary fails
}

export interface SettingItem {
  id: string;                 // Unique identifier, e.g. "dev_options"
  title: string;              // "Developer Options"
  shortDescription: string;   // "Disable to pass banking & UPI security checks"
  detailedNote?: string;      // Guidance on what switch to toggle
  category: SettingCategory;
  icon: string;               // MaterialCommunityIcons name, e.g. "code-tags"
  accentColor: string;        // Hex color for icon badge
  intent: IntentConfig;
  keywords: string[];         // Search keywords
  isBankingCritical: boolean; // Flagged for the "Banking Prep" quick flow
  stepOrder?: number;         // Step order in the banking prep wizard (1, 2, ...)
}

export interface UserPreferences {
  pinnedSettingIds: string[];
  frequentlyUsed: Record<string, number>;
  themeMode: 'dark' | 'light' | 'system';
  enableHaptics: boolean;
  hasSeenBankingOnboarding: boolean;
  lastOpenedTimestamp?: number;
}

export interface DeviceContext {
  brand: string;           // e.g. "Samsung", "Xiaomi", "Google", "OnePlus"
  modelName: string;       // e.g. "Pixel 8 Pro"
  osVersion: string;       // e.g. "14"
  apiLevel: number;        // e.g. 34
  isSupportedOem: boolean;
}
