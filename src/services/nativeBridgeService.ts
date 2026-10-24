import { NativeModules, Platform } from 'react-native';
import { SettingItem } from '../types';

const { RedirectBridgeModule } = NativeModules;

export interface QuickTileSlotState {
  slot1: SettingItem | null;
  slot2: SettingItem | null;
  slot3: SettingItem | null;
}

export const NativeBridge = {
  /**
   * Synchronize the user's pinned shortcuts list to Android SharedPreferences
   * for the Bento Grid and Single Shortcut Home Screen Widgets.
   */
  async syncShortcutsToNative(pinnedItems: SettingItem[]): Promise<boolean> {
    if (Platform.OS !== 'android' || !RedirectBridgeModule) return false;
    try {
      const payload = pinnedItems.map(item => ({
        id: item.id,
        title: item.title,
        action: item.intent.action,
        packageName: item.intent.packageName || '',
        className: item.intent.className || '',
        fallbackAction: item.intent.fallbackActions?.[0] || 'android.settings.SETTINGS',
        accentColor: item.accentColor,
        icon: item.icon,
      }));

      return await RedirectBridgeModule.syncShortcuts(JSON.stringify(payload));
    } catch (e) {
      console.warn('NativeBridge syncShortcuts failed:', e);
      return false;
    }
  },

  /**
   * Pin a specific shortcut directly to the Android Home Screen (ShortcutManager).
   */
  async pinToHomeScreen(item: SettingItem): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS !== 'android' || !RedirectBridgeModule) {
      return { success: false, error: 'Home Screen pinning is only supported on Android' };
    }
    try {
      const payload = {
        id: item.id,
        title: item.title,
        action: item.intent.action,
        packageName: item.intent.packageName || '',
        className: item.intent.className || '',
        fallbackAction: item.intent.fallbackActions?.[0] || 'android.settings.SETTINGS',
        accentColor: item.accentColor,
        icon: item.icon,
      };

      const success = await RedirectBridgeModule.pinShortcutToHomeScreen(JSON.stringify(payload));
      return { success: !!success };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to pin shortcut' };
    }
  },

  /**
   * Check if the device launcher supports programmatic home screen pinning.
   */
  async isPinShortcutSupported(): Promise<boolean> {
    if (Platform.OS !== 'android' || !RedirectBridgeModule) return false;
    try {
      return await RedirectBridgeModule.isPinShortcutSupported();
    } catch {
      return false;
    }
  },

  /**
   * Assign or clear a shortcut in one of the 3 Quick Settings Notification Shade slots.
   */
  async setQuickTileSlot(slot: 1 | 2 | 3, item: SettingItem | null): Promise<boolean> {
    if (Platform.OS !== 'android' || !RedirectBridgeModule) return false;
    try {
      const payload = item
        ? JSON.stringify({
            id: item.id,
            title: item.title,
            icon: item.icon,
            action: item.intent.action,
            packageName: item.intent.packageName || '',
            className: item.intent.className || '',
            fallbackAction: item.intent.fallbackActions?.[0] || 'android.settings.SETTINGS',
            accentColor: item.accentColor,
          })
        : '';

      return await RedirectBridgeModule.setTileSlot(slot, payload);
    } catch (e) {
      console.warn('NativeBridge setQuickTileSlot failed:', e);
      return false;
    }
  },

  /**
   * Read the shortcuts currently mapped to Tile Slot 1, 2, and 3.
   */
  async getQuickTileSlots(): Promise<QuickTileSlotState> {
    if (Platform.OS !== 'android' || !RedirectBridgeModule) {
      return { slot1: null, slot2: null, slot3: null };
    }
    try {
      const res = await RedirectBridgeModule.getTileSlots();
      const parseSlot = (str?: string | null): SettingItem | null => {
        if (!str) return null;
        try {
          const json = JSON.parse(str);
          return {
            id: json.id || 'tile_item',
            title: json.title,
            shortDescription: 'Quick Settings Tile',
            category: 'system',
            icon: json.icon || 'view-dashboard-outline',
            accentColor: json.accentColor || '#3A86FF',
            intent: {
              action: json.action,
              packageName: json.packageName || undefined,
              className: json.className || undefined,
              fallbackActions: [json.fallbackAction || 'android.settings.SETTINGS'],
            },
            keywords: [],
            isBankingCritical: false,
          };
        } catch {
          return null;
        }
      };

      return {
        slot1: parseSlot(res?.slot1),
        slot2: parseSlot(res?.slot2),
        slot3: parseSlot(res?.slot3),
      };
    } catch {
      return { slot1: null, slot2: null, slot3: null };
    }
  },
};
