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
        <MaterialCommunityIcons name="star" size={16} color={Colors.pinActive} />
        <Text style={styles.headerTitle}>Pinned Quick Access</Text>
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
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconWrapper, { backgroundColor: `${item.accentColor}22` }]}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={item.accentColor}
                />
              </View>
              <TouchableOpacity
                onPress={() => onUnpin(item.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <MaterialCommunityIcons name="close" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.categoryBadge}>
              {item.category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    width: 140,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
