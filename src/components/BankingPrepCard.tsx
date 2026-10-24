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
    <View style={styles.cardContainer}>
      {/* Frosted Glass Hero Card */}
      <View style={styles.heroGlassCard}>
        <View style={styles.contentLeft}>
          <View style={styles.tagPill}>
            <MaterialCommunityIcons name="shield-check" size={14} color={Colors.textSecondary} />
            <Text style={styles.tagText}>SAFE BANKING MODE</Text>
          </View>

          <Text style={styles.heroTitle}>Bypass UPI & Bank Checks</Text>
          <Text style={styles.heroSubtitle}>
            Disable Developer Options & Accessibility to use GPay & PhonePe.
          </Text>
        </View>

        {/* Right Glass Badge with Phone Lock icon and chevron */}
        <View style={styles.graphicBadge}>
          <MaterialCommunityIcons name="cellphone-lock" size={26} color={Colors.textPrimary} />
          <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
        </View>
      </View>

      {/* Step 01 and Step 02 Frosted Glass Pills */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={onOpenDevOptions}
          activeOpacity={0.8}
        >
          <View style={styles.stepIconBox}>
            <MaterialCommunityIcons name="code-tags" size={18} color={Colors.textPrimary} />
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepNumber}>STEP 01</Text>
            <Text style={styles.stepName}>Dev Options</Text>
          </View>
          <View style={styles.stepChevronCircle}>
            <MaterialCommunityIcons name="chevron-right" size={14} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stepButton}
          onPress={onOpenAccessibility}
          activeOpacity={0.8}
        >
          <View style={styles.stepIconBox}>
            <MaterialCommunityIcons name="human" size={20} color={Colors.textPrimary} />
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepNumber}>STEP 02</Text>
            <Text style={styles.stepName}>Accessibility</Text>
          </View>
          <View style={styles.stepChevronCircle}>
            <MaterialCommunityIcons name="chevron-right" size={14} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3-Dot Slider Indicator */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroGlassCard: {
    backgroundColor: Colors.glassCard,
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  contentLeft: {
    flex: 1,
    paddingRight: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(230, 235, 242, 0.7)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
  },
  graphicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  stepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    padding: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  stepIconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  stepName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stepChevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.textPrimary,
  },
});
