import { SettingCategory } from '../types';

export interface IntentSuggestion {
  title: string;
  shortDescription: string;
  category: SettingCategory;
  action: string;
  packageName?: string;
  className?: string;
  keywords: string[];
}

export const INTENT_DICTIONARY: IntentSuggestion[] = [
  // 1. Cellular / 4G / 5G / SIM / Network
  {
    title: 'Mobile Network & 5G Settings',
    shortDescription: 'Switch between 4G/5G, preferred network type, and SIM data options.',
    category: 'system',
    action: 'android.settings.NETWORK_OPERATOR_SETTINGS',
    keywords: ['5g', '4g', 'lte', 'network', 'sim', 'cellular', 'mobile data', 'carrier', 'operator', 'volte'],
  },
  {
    title: 'Data Roaming Settings',
    shortDescription: 'Configure data roaming and international roaming limits.',
    category: 'system',
    action: 'android.settings.DATA_ROAMING_SETTINGS',
    keywords: ['roaming', 'international', 'travel', 'data roaming'],
  },
  {
    title: 'Data Usage & Limits',
    shortDescription: 'Track monthly data consumption, set billing cycles and data warnings.',
    category: 'system',
    action: 'android.settings.DATA_USAGE_SETTINGS',
    keywords: ['data usage', 'data limit', 'consumption', 'warning', 'mb', 'gb', 'bandwidth'],
  },
  {
    title: 'Hotspot & Tethering',
    shortDescription: 'Portable Wi-Fi hotspot, USB tethering, and Bluetooth sharing.',
    category: 'system',
    action: 'android.settings.TETHER_SETTINGS',
    keywords: ['hotspot', 'tethering', 'usb tethering', 'portable hotspot', 'share internet'],
  },
  {
    title: 'Airplane / Flight Mode',
    shortDescription: 'Quickly toggle radios off and on to reset cell signals.',
    category: 'system',
    action: 'android.settings.AIRPLANE_MODE_SETTINGS',
    keywords: ['airplane', 'flight', 'radio', 'signal reset', 'offline'],
  },
  {
    title: 'APN (Access Point Names)',
    shortDescription: 'Configure carrier APN settings for mobile data and MMS fix.',
    category: 'system',
    action: 'android.settings.APN_SETTINGS',
    keywords: ['apn', 'access point', 'mms', 'carrier data fix'],
  },

  // 2. Battery & Charging
  {
    title: 'Battery Usage & Health',
    shortDescription: 'Battery cycle details, fast charging, and background drain chart.',
    category: 'system',
    action: 'android.intent.action.POWER_USAGE_SUMMARY',
    keywords: ['battery', 'charge', 'charging', 'drain', 'health', 'fast charging', 'power'],
  },
  {
    title: 'Battery Saver',
    shortDescription: 'Configure low-power mode, extreme battery saver, and schedule.',
    category: 'system',
    action: 'android.settings.BATTERY_SAVER_SETTINGS',
    keywords: ['battery saver', 'power saver', 'low power', 'conserve'],
  },

  // 3. Audio & Sounds
  {
    title: 'Sound & Vibration',
    shortDescription: 'Volume sliders, ringtones, haptics, and equalizer presets.',
    category: 'system',
    action: 'android.settings.SOUND_SETTINGS',
    keywords: ['sound', 'volume', 'audio', 'vibration', 'ringtone', 'haptics', 'equalizer'],
  },
  {
    title: 'Do Not Disturb (DND)',
    shortDescription: 'Configure DND schedules, priority callers, and silent rules.',
    category: 'privacy',
    action: 'android.settings.ZEN_MODE_SETTINGS',
    keywords: ['dnd', 'do not disturb', 'silent', 'quiet', 'focus', 'mute'],
  },

  // 4. Display & Visuals
  {
    title: 'Display & Screen Timeout',
    shortDescription: 'Screen sleep timeout, font size, dark mode, and color profiles.',
    category: 'system',
    action: 'android.settings.DISPLAY_SETTINGS',
    keywords: ['display', 'screen', 'brightness', 'sleep', 'timeout', 'font', 'dark mode', '120hz', 'refresh rate'],
  },
  {
    title: 'Night Light / Eye Comfort',
    shortDescription: 'Blue light filter and scheduled sunset-to-sunrise warm tint.',
    category: 'system',
    action: 'android.settings.NIGHT_DISPLAY_SETTINGS',
    keywords: ['night light', 'blue light', 'eye comfort', 'reading mode', 'warm'],
  },

  // 5. Storage & Files
  {
    title: 'Storage & Memory Cleaner',
    shortDescription: 'Internal storage breakdown, trash cleanup, and SD card options.',
    category: 'system',
    action: 'android.settings.INTERNAL_STORAGE_SETTINGS',
    keywords: ['storage', 'memory', 'clean', 'trash', 'ram', 'sd card', 'space', 'disk'],
  },

  // 6. Security, Biometrics & Privacy
  {
    title: 'Fingerprint & Face Unlock',
    shortDescription: 'Enroll or remove biometric credentials and screen lock PIN.',
    category: 'privacy',
    action: 'android.settings.SECURITY_SETTINGS',
    keywords: ['fingerprint', 'face', 'biometric', 'pin', 'password', 'screen lock', 'security'],
  },
  {
    title: 'Location & GPS Accuracy',
    shortDescription: 'Google Location Accuracy, Wi-Fi scanning, and per-app permissions.',
    category: 'privacy',
    action: 'android.settings.LOCATION_SOURCE_SETTINGS',
    keywords: ['location', 'gps', 'accuracy', 'maps', 'tracking', 'geo'],
  },
  {
    title: 'App Permissions Manager',
    shortDescription: 'Camera, Microphone, and Contacts permissions overview.',
    category: 'permissions',
    action: 'android.settings.MANAGE_PERMISSIONS',
    keywords: ['permission', 'camera', 'microphone', 'mic', 'contacts', 'privacy dashboard'],
  },

  // 7. Developer & Wireless
  {
    title: 'Developer Options',
    shortDescription: 'USB debugging, wireless ADB, bug report, and OEM unlocking.',
    category: 'developer',
    action: 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS',
    keywords: ['developer', 'usb debugging', 'adb', 'oem unlock', 'wireless debugging'],
  },
  {
    title: 'Accessibility Services',
    shortDescription: 'Screen readers, magnification, and automation utilities.',
    category: 'banking',
    action: 'android.settings.ACCESSIBILITY_SETTINGS',
    keywords: ['accessibility', 'talkback', 'bitwarden', 'tasker', 'autofill', 'macro'],
  },
  {
    title: 'Default Apps & Handlers',
    shortDescription: 'Choose default browser, assistant, and phone dialer.',
    category: 'system',
    action: 'android.settings.MANAGE_DEFAULT_APPS_SETTINGS',
    keywords: ['default app', 'default browser', 'assistant', 'dialer', 'sms app'],
  },
  {
    title: 'System Update',
    shortDescription: 'Check for new Android OS and security patch updates.',
    category: 'system',
    action: 'android.settings.SYSTEM_UPDATE_SETTINGS',
    keywords: ['update', 'software update', 'patch', 'os update', 'android version'],
  },
];

/**
 * Searches the Intent dictionary by analyzing title, description, and keywords
 */
export const searchIntentDictionary = (query: string): IntentSuggestion[] => {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  return INTENT_DICTIONARY.filter(item => {
    const matchTitle = item.title.toLowerCase().includes(clean);
    const matchDesc = item.shortDescription.toLowerCase().includes(clean);
    const matchAction = item.action.toLowerCase().includes(clean);
    const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(clean) || clean.includes(k.toLowerCase()));

    return matchTitle || matchDesc || matchAction || matchKeywords;
  }).slice(0, 5); // Return top 5 matches
};
