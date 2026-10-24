import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DeviceContext } from '../types';

export const getDeviceContext = (): DeviceContext => {
  if (Platform.OS !== 'android') {
    return {
      brand: Device.brand || 'Simulator',
      modelName: Device.modelName || 'Unknown Device',
      osVersion: Device.osVersion || 'N/A',
      apiLevel: 0,
      isSupportedOem: false,
    };
  }

  const brand = Device.brand || 'Android';
  const modelName = Device.modelName || 'Device';
  const osVersion = Device.osVersion || 'Unknown';
  const apiLevel = Platform.Version && typeof Platform.Version === 'number' ? Platform.Version : 30;

  const supportedOems = ['samsung', 'xiaomi', 'redmi', 'poco', 'oneplus', 'oppo', 'vivo', 'google', 'motorola'];
  const isSupportedOem = supportedOems.some(oem => brand.toLowerCase().includes(oem));

  return {
    brand,
    modelName,
    osVersion,
    apiLevel,
    isSupportedOem,
  };
};
