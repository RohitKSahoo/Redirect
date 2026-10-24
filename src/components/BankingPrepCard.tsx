import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface BankingPrepCardProps {
  onOpenDevOptions: () => void;
  onOpenAccessibility: () => void;
}

export const BankingPrepCard: React.FC<BankingPrepCardProps> = ({
  onOpenDevOptions,
  onOpenAccessibility,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View style={styles.shieldIcon}>
            <MaterialCommunityIcons name="shield-check" size={18} color={Colors.success} />
          </View>
          <Text style={styles.headerTitle}>Banking & Payment Prep</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Quick 2-Step</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Payment apps (Google Pay, PhonePe, Banks) block access if Developer Options or Accessibility tools are active.
      </Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.devButton]}
          onPress={onOpenDevOptions}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="code-tags" size={16} color="#FFAB00" />
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonLabel}>Step 1</Text>
            <Text style={styles.buttonAction}>Dev Options</Text>
          </View>
          <MaterialCommunityIcons name="arrow-top-right" size={14} color="#FFAB00" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.accessibilityButton]}
          onPress={onOpenAccessibility}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="human" size={16} color="#FF5252" />
          <View style={styles.buttonTextWrapper}>
            <Text style={styles.buttonLabel}>Step 2</Text>
            <Text style={styles.buttonAction}>Accessibility</Text>
          </View>
          <MaterialCommunityIcons name="arrow-top-right" size={14} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121829',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#253355',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.successGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusPill: {
    backgroundColor: 'rgba(79, 117, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  devButton: {
    backgroundColor: 'rgba(255, 171, 0, 0.08)',
    borderColor: 'rgba(255, 171, 0, 0.25)',
  },
  accessibilityButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderColor: 'rgba(255, 82, 82, 0.25)',
  },
  buttonTextWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  buttonAction: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
