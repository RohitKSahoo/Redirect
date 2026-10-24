import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { IntentConfig } from '../types';

export interface LaunchResult {
  success: boolean;
  actionUsed: string;
  error?: string;
}

export const launchSettingsIntent = async (config: IntentConfig): Promise<LaunchResult> => {
  if (Platform.OS !== 'android') {
    return {
      success: false,
      actionUsed: config.action,
      error: 'Direct settings intents are only supported on Android devices.',
    };
  }

  // 1. Try Primary Action
  try {
    await IntentLauncher.startActivityAsync(config.action, {
      packageName: config.packageName,
      className: config.className,
      data: config.dataUri,
    });
    return { success: true, actionUsed: config.action };
  } catch (primaryError: any) {
    console.warn(`[IntentService] Primary action ${config.action} failed:`, primaryError?.message);

    // 2. Try Fallbacks if provided
    if (config.fallbackActions && config.fallbackActions.length > 0) {
      for (const fallbackAction of config.fallbackActions) {
        try {
          await IntentLauncher.startActivityAsync(fallbackAction);
          return { success: true, actionUsed: fallbackAction };
        } catch (fallbackError) {
          console.warn(`[IntentService] Fallback ${fallbackAction} failed:`, fallbackError);
        }
      }
    }

    // 3. Ultimate Fallback: Open Main Settings
    try {
      await IntentLauncher.startActivityAsync('android.settings.SETTINGS');
      return {
        success: true,
        actionUsed: 'android.settings.SETTINGS',
        error: 'Target sub-page not found on your device. Opened main Settings instead.',
      };
    } catch (finalError: any) {
      return {
        success: false,
        actionUsed: config.action,
        error: finalError?.message || 'Failed to open settings.',
      };
    }
  }
};
