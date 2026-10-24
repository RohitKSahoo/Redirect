import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingCategory } from '../types';

interface CategoryPillsProps {
  selectedCategory: SettingCategory;
  onSelectCategory: (category: SettingCategory) => void;
}

const CATEGORIES: { id: SettingCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'view-grid-outline' },
  { id: 'banking', label: 'Banking', icon: 'shield-check-outline' },
  { id: 'developer', label: 'Developer', icon: 'code-tags' },
  { id: 'permissions', label: 'Permissions', icon: 'layers-outline' },
  { id: 'privacy', label: 'Privacy', icon: 'lock-outline' },
  { id: 'system', label: 'System', icon: 'cog-outline' },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity style={styles.seeAllRow}>
          <Text style={styles.seeAllText}>See All</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={16}
                color={Colors.textPrimary}
              />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.glassCard,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  pillActive: {
    backgroundColor: Colors.activePillBg,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
});
