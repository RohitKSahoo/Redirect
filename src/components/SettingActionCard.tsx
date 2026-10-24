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
  isFeatured?: boolean; // Bento variation for full-width featured tiles
}

export const SettingActionCard: React.FC<SettingActionCardProps> = ({
  item,
  isPinned,
  onPress,
  onTogglePin,
  onDelete,
  onOptionsPress,
  isFeatured = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.bentoTile,
        isFeatured ? styles.featuredTile : styles.standardTile,
      ]}
      onPress={onPress}
      onLongPress={onOptionsPress}
      activeOpacity={0.8}
    >
      {/* Top Header of Bento Tile: Icon & Actions */}
      <View style={styles.tileTopRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name={item.icon as any}
            size={isFeatured ? 24 : 20}
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

      {/* Middle: Title & Tags */}
      <View style={styles.tileContent}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.titleText, isFeatured && styles.featuredTitleText]}
            numberOfLines={isFeatured ? 2 : 1}
          >
            {item.title}
          </Text>
        </View>

        <Text
          style={[styles.descText, isFeatured && styles.featuredDescText]}
          numberOfLines={isFeatured ? 2 : 2}
        >
          {item.shortDescription}
        </Text>
      </View>

      {/* Bottom Footer: Badge Tag & Direct Arrow */}
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
          {!item.isBankingCritical && !item.isCustom && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.arrowBox}>
          <MaterialCommunityIcons name="arrow-top-right" size={14} color={Colors.textPrimary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bentoTile: {
    backgroundColor: Colors.glassCard,
    borderRadius: 4, // Sharp corners
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  standardTile: {
    flex: 1,
    minHeight: 145,
    margin: 4,
  },
  featuredTile: {
    width: '100%',
    minHeight: 125,
    marginHorizontal: 0,
    marginVertical: 4,
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
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
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
  tileContent: {
    flex: 1,
    marginVertical: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  featuredTitleText: {
    fontSize: 15,
  },
  descText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 14,
    fontWeight: '500',
  },
  featuredDescText: {
    fontSize: 12,
    lineHeight: 16,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  criticalBadge: {
    backgroundColor: 'rgba(215, 222, 232, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2, // Sharp corners
  },
  criticalBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  customBadge: {
    backgroundColor: 'rgba(235, 225, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  customBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 2, // Sharp corners
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});
