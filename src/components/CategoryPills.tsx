import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { SettingCategory } from '../types';

interface CategoryPillsProps {
  selectedCategory: SettingCategory;
  onSelectCategory: (category: SettingCategory) => void;
}

const CATEGORIES: { id: SettingCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'banking', label: '🏦 Banking Prep' },
  { id: 'developer', label: '💻 Developer' },
  { id: 'permissions', label: '🛡️ Permissions' },
  { id: 'privacy', label: '🔒 Privacy' },
  { id: 'system', label: '⚙️ System' },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      {CATEGORIES.map(cat => {
        const isActive = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelectCategory(cat.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.chipInactiveBg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pillActive: {
    backgroundColor: Colors.chipActiveBg,
    borderColor: Colors.primaryLight,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.chipInactiveText,
  },
  pillTextActive: {
    color: Colors.chipActiveText,
    fontWeight: '600',
  },
});
