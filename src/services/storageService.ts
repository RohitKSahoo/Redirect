import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: '@redirect_user_preferences',
  PINNED_IDS: '@redirect_pinned_ids',
  USAGE_COUNTS: '@redirect_usage_counts',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  pinnedSettingIds: ['dev_options', 'accessibility_settings'],
  frequentlyUsed: {},
  themeMode: 'dark',
  enableHaptics: true,
  hasSeenBankingOnboarding: false,
};

export const StorageService = {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
      return DEFAULT_PREFERENCES;
    } catch (e) {
      console.warn('[StorageService] Error loading preferences:', e);
      return DEFAULT_PREFERENCES;
    }
  },

  async savePreferences(prefs: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.warn('[StorageService] Error saving preferences:', e);
    }
  },

  async togglePin(settingId: string): Promise<string[]> {
    try {
      const prefs = await this.getPreferences();
      const isPinned = prefs.pinnedSettingIds.includes(settingId);
      const updatedPinned = isPinned
        ? prefs.pinnedSettingIds.filter(id => id !== settingId)
        : [...prefs.pinnedSettingIds, settingId];

      const newPrefs: UserPreferences = {
        ...prefs,
        pinnedSettingIds: updatedPinned,
      };

      await this.savePreferences(newPrefs);
      return updatedPinned;
    } catch (e) {
      console.warn('[StorageService] Error toggling pin:', e);
      return [];
    }
  },

  async recordUsage(settingId: string): Promise<void> {
    try {
      const prefs = await this.getPreferences();
      const currentCount = prefs.frequentlyUsed[settingId] || 0;
      const updatedFreq = {
        ...prefs.frequentlyUsed,
        [settingId]: currentCount + 1,
      };

      await this.savePreferences({
        ...prefs,
        frequentlyUsed: updatedFreq,
        lastOpenedTimestamp: Date.now(),
      });
    } catch (e) {
      console.warn('[StorageService] Error recording usage:', e);
    }
  },

  async getCustomSettings(): Promise<import('../types').SettingItem[]> {
    try {
      const data = await AsyncStorage.getItem('@redirect_custom_settings');
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      console.warn('[StorageService] Error loading custom settings:', e);
      return [];
    }
  },

  async addCustomSetting(item: import('../types').SettingItem): Promise<import('../types').SettingItem[]> {
    try {
      const current = await this.getCustomSettings();
      const updated = [item, ...current];
      await AsyncStorage.setItem('@redirect_custom_settings', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('[StorageService] Error adding custom setting:', e);
      return [];
    }
  },

  async deleteCustomSetting(id: string): Promise<import('../types').SettingItem[]> {
    try {
      const current = await this.getCustomSettings();
      const updated = current.filter(item => item.id !== id);
      await AsyncStorage.setItem('@redirect_custom_settings', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('[StorageService] Error deleting custom setting:', e);
      return [];
    }
  },
};
