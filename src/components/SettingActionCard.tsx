import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingItem } from '../types';

interface SettingActionCardProps {
  item: SettingItem;
  isPinned: boolean;
  onPress: () => void;
  onTogglePin: () => void;
}

export const SettingActionCard: React.FC<SettingActionCardProps> = ({
  item,
  isPinned,
  onPress,
  onTogglePin,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${item.accentColor}22` }]}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={24}
          color={item.accentColor}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.isBankingCritical && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>Banking</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.shortDescription}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onTogglePin}
          style={styles.pinButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={isPinned ? 'star' : 'star-outline'}
            size={22}
            color={isPinned ? Colors.pinActive : Colors.pinInactive}
          />
        </TouchableOpacity>

        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={Colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  criticalBadge: {
    backgroundColor: Colors.dangerGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  criticalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinButton: {
    padding: 4,
  },
});
