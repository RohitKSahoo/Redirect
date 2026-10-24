import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { DeviceContext } from '../types';

interface HeaderProps {
  deviceContext: DeviceContext;
  onOpenDiagnostics: () => void;
  onOpenAddModal: () => void;
  onOpenTilesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  deviceContext,
  onOpenDiagnostics,
  onOpenAddModal,
  onOpenTilesModal,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Action Row with App Title and Right Action Buttons */}
      <View style={styles.topRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.appTitle}>Redirect</Text>
          <Text style={styles.appSubtitle}>System Deep Links</Text>
        </View>

        <View style={styles.rightActionsRow}>
          <TouchableOpacity
            style={styles.sharpPillButton}
            onPress={onOpenAddModal}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={16} color={Colors.textPrimary} />
            <Text style={styles.sharpPillText}>Add</Text>
          </TouchableOpacity>

          {onOpenTilesModal && (
            <TouchableOpacity
              style={styles.sharpIconButton}
              onPress={onOpenTilesModal}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="view-dashboard-outline" size={19} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.sharpIconButton}
            onPress={onOpenDiagnostics}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWrapper: {
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    marginTop: -2,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sharpPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.glassCard,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 4, // Sharp corners
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  sharpPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sharpIconButton: {
    width: 40,
    height: 40,
    borderRadius: 4, // Sharp corners
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
});
