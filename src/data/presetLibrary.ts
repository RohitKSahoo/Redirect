import { SettingItem } from '../types';

export const PRESET_LIBRARY: Omit<SettingItem, 'id'>[] = [
  {
    title: 'Notification History',
    shortDescription: 'View recently received or accidentally dismissed notifications and OTPs.',
    category: 'system',
    icon: 'bell-history',
    accentColor: '#3A86FF',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.NOTIFICATION_HISTORY',
      fallbackActions: ['android.settings.NOTIFICATION_SETTINGS'],
    },
    keywords: ['notification', 'history', 'log', 'otp', 'dismissed', 'messages'],
  },
  {
    title: 'NFC & Contactless Payment',
    shortDescription: 'Configure tap-to-pay, contactless transit cards, and NFC antennas.',
    category: 'banking',
    icon: 'nfc',
    accentColor: '#1DB954',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.NFC_SETTINGS',
      fallbackActions: ['android.settings.WIRELESS_SETTINGS'],
    },
    keywords: ['nfc', 'contactless', 'tap', 'pay', 'google', 'wallet'],
  },
  {
    title: 'Usage Access & Screen Time',
    shortDescription: 'Apps with permission to track screen time, app launches, and battery usage.',
    category: 'privacy',
    icon: 'chart-timeline-variant',
    accentColor: '#FF8A00',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.USAGE_ACCESS_SETTINGS',
    },
    keywords: ['usage', 'access', 'screen', 'time', 'digital', 'wellbeing', 'track'],
  },
  {
    title: 'Private DNS Provider',
    shortDescription: 'Configure custom secure DNS (e.g. NextDNS, AdGuard, Cloudflare 1.1.1.1).',
    category: 'privacy',
    icon: 'dns-outline',
    accentColor: '#9B51E0',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.WIRELESS_SETTINGS',
      fallbackActions: ['android.settings.SETTINGS'],
    },
    keywords: ['dns', 'private', 'adguard', 'nextdns', 'cloudflare', 'vpn'],
  },
  {
    title: 'Screen Cast & Wireless Display',
    shortDescription: 'Stream your screen to TVs, Chromecasts, and external monitors.',
    category: 'system',
    icon: 'cast',
    accentColor: '#2EC4B6',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.CAST_SETTINGS',
    },
    keywords: ['cast', 'screen', 'mirror', 'tv', 'chromecast', 'display'],
  },
  {
    title: 'Auto-Rotate & Display Settings',
    shortDescription: 'Resolution, refresh rate (60Hz / 120Hz), and color gamut.',
    category: 'system',
    icon: 'screen-rotation',
    accentColor: '#E63946',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.DISPLAY_SETTINGS',
    },
    keywords: ['display', 'refresh', 'rate', 'hz', 'rotate', 'resolution', 'screen'],
  },
  {
    title: 'Bluetooth Connections',
    shortDescription: 'Paired headphones, smartwatches, and stylus devices.',
    category: 'system',
    icon: 'bluetooth',
    accentColor: '#0077B6',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.BLUETOOTH_SETTINGS',
    },
    keywords: ['bluetooth', 'audio', 'headphones', 'pair', 'tws'],
  },
  {
    title: 'Wi-Fi & Hotspot Settings',
    shortDescription: 'Wi-Fi network selection, IP configuration, and tethering.',
    category: 'system',
    icon: 'wifi',
    accentColor: '#023E8A',
    isBankingCritical: false,
    intent: {
      action: 'android.settings.WIFI_SETTINGS',
    },
    keywords: ['wifi', 'network', 'internet', 'hotspot', 'tethering'],
  },
];
