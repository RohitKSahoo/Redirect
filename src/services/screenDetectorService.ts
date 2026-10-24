import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenDetectorModule } = NativeModules;

export interface CapturedScreen {
  packageName: string;
  className: string;
  timestamp?: number;
}

const eventEmitter = ScreenDetectorModule
  ? new NativeEventEmitter(ScreenDetectorModule)
  : null;

export const ScreenDetector = {
  /**
   * Check if the ScreenDetector accessibility service is enabled by the user
   */
  async isServiceEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ScreenDetectorModule) return false;
    try {
      return await ScreenDetectorModule.isServiceEnabled();
    } catch {
      return false;
    }
  },

  /**
   * Get the last detected external window/activity
   */
  async getLastCapturedScreen(): Promise<CapturedScreen | null> {
    if (Platform.OS !== 'android' || !ScreenDetectorModule) return null;
    try {
      const res = await ScreenDetectorModule.getLastCapturedScreen();
      if (res && res.packageName && res.className) {
        return res;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Clear the last recorded captured screen
   */
  async clearLastCaptured(): Promise<void> {
    if (Platform.OS !== 'android' || !ScreenDetectorModule) return;
    try {
      await ScreenDetectorModule.clearLastCaptured();
    } catch {
      // Ignore
    }
  },

  /**
   * Listen for real-time window state transitions
   */
  subscribe(callback: (screen: CapturedScreen) => void) {
    if (!eventEmitter) return { remove: () => {} };
    return eventEmitter.addListener('onScreenCaptured', (data: any) => {
      callback(data as CapturedScreen);
    });
  },
};
