import { SettingItem } from '../types';

export const SETTINGS_REGISTRY: SettingItem[] = [
  // 1. BANKING CRITICAL SETTINGS
  {
    id: 'dev_options',
    title: 'Developer Options',
    shortDescription: 'Disable to bypass banking & UPI root/tamper checks.',
    detailedNote: 'Toggle the master switch at the top to OFF before opening Google Pay / PhonePe / Banking apps.',
    category: 'banking',
    icon: 'developer-board',
    accentColor: '#FFAB00',
    isBankingCritical: true,
    stepOrder: 1,
    intent: {
      action: 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS',
      fallbackActions: ['android.settings.SETTINGS'],
    },
    keywords: ['usb', 'debugging', 'developer', 'adb', 'gpay', 'phonepe', 'bank', 'bhim', 'paytm'],
  },
  {
    id: 'accessibility_settings',
    title: 'Accessibility Services',
    shortDescription: 'Disable automated tools/macros flagged by finance apps.',
    detailedNote: 'Check "Downloaded apps / services" and turn OFF any active automation or screen reading tools.',
    category: 'banking',
    icon: 'human',
    accentColor: '#FF5252',
    isBankingCritical: true,
    stepOrder: 2,
    intent: {
      action: 'android.settings.ACCESSIBILITY_SETTINGS',
      fallbackActions: ['android.settings.SETTINGS'],
    },
    keywords: ['accessibility', 'screen', 'reader', 'macro', 'tasker', 'bitwarden', 'autofill', 'banking', 'gpay'],
  },

  // 2. DEVELOPER & DEBUGGING
  {
    id: 'wireless_debugging',
    title: 'Wireless Debugging & Network',
    shortDescription: 'Direct access to wireless pairing and network settings.',
    detailedNote: 'Requires Android 11+ with Wi-Fi connected to pair with Shizuku or PC.',
    category: 'developer',
    icon: 'wifi-cog',
    accentColor: '#4F75FF',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS',
    },
    keywords: ['wireless', 'wifi', 'port', 'pairing', 'shizuku', 'adb'],
  },

  // 3. PERMISSIONS & SPECIAL APP ACCESS
  {
    id: 'overlay_permission',
    title: 'Display Over Other Apps',
    shortDescription: 'Manage apps allowed to show floating widgets or windows.',
    detailedNote: 'Banking apps often block logins if screen overlay apps are detected.',
    category: 'permissions',
    icon: 'layers-outline',
    accentColor: '#00E676',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.action.MANAGE_OVERLAY_PERMISSION',
      fallbackActions: ['android.settings.MANAGE_APPLICATIONS_SETTINGS'],
    },
    keywords: ['overlay', 'floating', 'bubble', 'draw', 'screen', 'pip'],
  },
  {
    id: 'unknown_sources',
    title: 'Install Unknown Apps',
    shortDescription: 'Grant or revoke APK sideloading permissions per browser/app.',
    detailedNote: 'Choose which browser or file manager can install APKs.',
    category: 'permissions',
    icon: 'package-down',
    accentColor: '#AB47BC',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.MANAGE_UNKNOWN_APP_SOURCES',
      fallbackActions: ['android.settings.SECURITY_SETTINGS'],
    },
    keywords: ['apk', 'sideload', 'unknown', 'sources', 'install'],
  },
  {
    id: 'notification_access',
    title: 'Device & App Notifications',
    shortDescription: 'Manage apps permitted to read notification feeds and OTPs.',
    detailedNote: 'Revoke notification listener rights for unverified utilities.',
    category: 'permissions',
    icon: 'bell-badge-outline',
    accentColor: '#29B6F6',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS',
      fallbackActions: ['android.settings.NOTIFICATION_SETTINGS'],
    },
    keywords: ['notification', 'listener', 'otp', 'smartwatch', 'band', 'read'],
  },

  // 4. PRIVACY & SECURITY
  {
    id: 'security_settings',
    title: 'Security & Biometrics',
    shortDescription: 'Fingerprint, Face Unlock, and Screen Lock configuration.',
    detailedNote: 'Ensure device encryption and lock screen pins are active.',
    category: 'privacy',
    icon: 'shield-lock-outline',
    accentColor: '#26A69A',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.SECURITY_SETTINGS',
    },
    keywords: ['biometrics', 'fingerprint', 'face', 'lock', 'pin', 'password', 'encryption'],
  },
  {
    id: 'location_settings',
    title: 'Location Services',
    shortDescription: 'Manage GPS accuracy and per-app location permissions.',
    detailedNote: 'Some payment apps require high-accuracy GPS for verification.',
    category: 'privacy',
    icon: 'crosshairs-gps',
    accentColor: '#FFA726',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.LOCATION_SOURCE_SETTINGS',
    },
    keywords: ['location', 'gps', 'geo', 'maps', 'privacy'],
  },

  // 5. SYSTEM & BATTERY
  {
    id: 'battery_optimization',
    title: 'Ignore Battery Optimization',
    shortDescription: 'Exclude critical background apps from aggressive battery killing.',
    detailedNote: 'Prevents Android from killing essential background sync tools.',
    category: 'system',
    icon: 'battery-charging-outline',
    accentColor: '#66BB6A',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
      fallbackActions: ['android.settings.BATTERY_SAVER_SETTINGS'],
    },
    keywords: ['battery', 'optimization', 'sleep', 'doze', 'background', 'kill'],
  },
  {
    id: 'all_apps_settings',
    title: 'Manage All Applications',
    shortDescription: 'Full list of installed apps to clear cache, storage, or permissions.',
    detailedNote: 'Useful for clearing corrupt cache of banking or system apps.',
    category: 'system',
    icon: 'apps',
    accentColor: '#7E57C2',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS',
      fallbackActions: ['android.settings.APPLICATION_SETTINGS'],
    },
    keywords: ['apps', 'clear', 'cache', 'storage', 'data', 'uninstall'],
  },
  {
    id: 'default_apps',
    title: 'Default Apps Settings',
    shortDescription: 'Configure default browser, phone dialer, and assistant.',
    detailedNote: 'Set default payment or browser handler.',
    category: 'system',
    icon: 'cellphone-cog',
    accentColor: '#EC407A',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.MANAGE_DEFAULT_APPS_SETTINGS',
      fallbackActions: ['android.settings.SETTINGS'],
    },
    keywords: ['default', 'browser', 'assistant', 'sms', 'dialer', 'handler'],
  },
];
