import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingCategory } from '../types';

interface FilterDropdownProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: SettingCategory;
  onSelectCategory: (category: SettingCategory) => void;
  anchorPosition?: { x: number; y: number; width: number; height: number };
}

const CATEGORIES: { id: SettingCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Settings', icon: 'view-grid-outline' },
  { id: 'banking', label: 'Safe Banking', icon: 'shield-check-outline' },
  { id: 'developer', label: 'Developer', icon: 'code-tags' },
  { id: 'permissions', label: 'Permissions', icon: 'layers-outline' },
  { id: 'privacy', label: 'Privacy', icon: 'lock-outline' },
  { id: 'system', label: 'System', icon: 'cog-outline' },
];

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
  anchorPosition,
}) => {
  if (!visible) return null;

  // Calculate top & right positioning from the measured filter button
  const topOffset = anchorPosition ? anchorPosition.y + anchorPosition.height + 4 : 110;
  const rightOffset = 16;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.dropdownContainer, { top: topOffset, right: rightOffset }]}>
              {/* Dropdown Options */}
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                    onPress={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={18}
                      color={isSelected ? Colors.textPrimary : Colors.textSecondary}
                    />
                    <Text style={[styles.itemText, isSelected && styles.itemTextActive]}>
                      {cat.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={16} color={Colors.textPrimary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent dismiss layer
  },
  dropdownContainer: {
    position: 'absolute',
    width: 190,
    backgroundColor: Colors.glassCardElevated,
    borderRadius: 4, // Sharp corners
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  itemTextActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
});
