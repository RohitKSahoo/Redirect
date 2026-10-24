import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { DeviceContext } from '../types';

interface HeaderProps {
  deviceContext: DeviceContext;
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({ deviceContext, onOpenDiagnostics }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoPill}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Redirect</Text>
        </View>

        <TouchableOpacity
          style={styles.oemBadge}
          onPress={onOpenDiagnostics}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cellphone" size={14} color={Colors.textSecondary} />
          <Text style={styles.oemText}>
            {deviceContext.brand ? `${deviceContext.brand} • A${deviceContext.osVersion}` : 'Android'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Quick 1-tap shortcuts into deep system settings pages
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  oemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  oemText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
});
