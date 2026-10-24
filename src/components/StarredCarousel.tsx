import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingItem } from '../types';

interface StarredCarouselProps {
  starredItems: SettingItem[];
  onLaunchItem: (item: SettingItem) => void;
  onTogglePin: (id: string) => void;
  onOptionsPress?: (item: SettingItem) => void;
}

export const StarredCarousel: React.FC<StarredCarouselProps> = ({
  starredItems,
  onLaunchItem,
  onTogglePin,
  onOptionsPress,
}) => {
  if (starredItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <MaterialCommunityIcons name="star-outline" size={16} color={Colors.starActive} />
            <Text style={styles.sectionTitle}>STARRED SHORTCUTS</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>0</Text>
          </View>
        </View>
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="star-shooting-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.emptyText}>
            Star any setting to keep it pinned here for quick access
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <MaterialCommunityIcons name="star" size={16} color={Colors.starActive} />
          <Text style={styles.sectionTitle}>STARRED SHORTCUTS</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{starredItems.length}</Text>
        </View>
      </View>

      {/* Horizontal Scrollable Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {starredItems.map((item) => (
          <TouchableOpacity
            key={`starred-${item.id}`}
            style={styles.starredTile}
            onPress={() => onLaunchItem(item)}
            onLongPress={() => onOptionsPress?.(item)}
            activeOpacity={0.75}
          >
            <View style={styles.tileTopRow}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={18}
                  color={Colors.textPrimary}
                />
              </View>
              <TouchableOpacity
                onPress={() => onTogglePin(item.id)}
                style={styles.starBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="star" size={16} color={Colors.starActive} />
              </TouchableOpacity>
            </View>

            <View style={styles.tileBottom}>
              <Text style={styles.titleText} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 2, // Sharp corners
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  starredTile: {
    width: 126,
    height: 94,
    backgroundColor: Colors.glassCard,
    borderRadius: 4, // Sharp corners
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  tileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 4, // Sharp corners
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  starBtn: {
    padding: 2,
  },
  tileBottom: {
    marginTop: 4,
  },
  titleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 14.5,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 4, // Sharp corners
    borderWidth: 1,
    borderColor: Colors.glassBorderSubtle,
    borderStyle: 'dashed',
  },
  emptyText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 15,
  },
});
