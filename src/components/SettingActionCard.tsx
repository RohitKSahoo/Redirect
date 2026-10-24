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
  onDelete?: () => void;
  onOptionsPress?: () => void;
  isFeatured?: boolean;
}

export const SettingActionCard: React.FC<SettingActionCardProps> = ({
  item,
  isPinned,
  onPress,
  onTogglePin,
  onOptionsPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.bentoTile}
      onPress={onPress}
      onLongPress={onOptionsPress}
      activeOpacity={0.75}
    >
      {/* Top Header of Bento Tile: Icon & Actions */}
      <View style={styles.tileTopRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name={item.icon as any}
            size={20}
            color={Colors.textPrimary}
          />
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            onPress={onTogglePin}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={isPinned ? 'star' : 'star-outline'}
              size={18}
              color={isPinned ? Colors.starActive : Colors.starInactive}
            />
          </TouchableOpacity>

          {onOptionsPress && (
            <TouchableOpacity
              onPress={onOptionsPress}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Middle: Title (Heading only - description removed) */}
      <View style={styles.tileContent}>
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
      </View>

      {/* Bottom Footer: Direct Launch Indicator */}
      <View style={styles.tileFooter}>
        <View style={styles.badgeRow}>
          {item.isBankingCritical && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>CRITICAL</Text>
            </View>
          )}
          {item.isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>CUSTOM</Text>
            </View>
          )}
        </View>
        <View style={styles.arrowBox}>
          <MaterialCommunityIcons name="arrow-top-right" size={12} color={Colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bentoTile: {
    backgroundColor: Colors.glassCard,
    borderRadius: 4, // Sharp corners
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 110,
    margin: 4,
    flex: 1,
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 4, // Sharp corners
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    padding: 4,
  },
  tileContent: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  titleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  criticalBadge: {
    backgroundColor: 'rgba(255, 235, 235, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 2, // Sharp corners
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 100, 0.3)',
  },
  criticalBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#D32F2F',
    letterSpacing: 0.5,
  },
  customBadge: {
    backgroundColor: 'rgba(235, 225, 255, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(126, 87, 194, 0.3)',
  },
  customBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  arrowBox: {
    width: 20,
    height: 20,
    borderRadius: 2, // Sharp corners
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});
