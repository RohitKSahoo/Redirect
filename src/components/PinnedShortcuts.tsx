import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingItem } from '../types';

interface PinnedShortcutsProps {
  items: SettingItem[];
  onPressItem: (item: SettingItem) => void;
  onUnpin: (id: string) => void;
}

export const PinnedShortcuts: React.FC<PinnedShortcutsProps> = ({
  items,
  onPressItem,
  onUnpin,
}) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pinned Quick Access</Text>
        <Text style={styles.countBadge}>{items.length} starred</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => onPressItem(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconWrapper, { backgroundColor: `${item.accentColor}18` }]}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={item.accentColor}
                />
              </View>

              <TouchableOpacity
                onPress={() => onUnpin(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.unpinCircle}
              >
                <MaterialCommunityIcons name="star" size={16} color={Colors.starActive} />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {item.shortDescription}
            </Text>

            <View style={styles.cardBottomRow}>
              <Text style={styles.openText}>Tap to open</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  scrollContainer: {
    paddingHorizontal: 22,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    width: 170,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: Colors.surfaceShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unpinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 14,
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceSubtle,
    paddingTop: 8,
  },
  openText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
