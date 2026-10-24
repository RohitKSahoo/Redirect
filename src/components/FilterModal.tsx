import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingCategory } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: SettingCategory;
  onSelectCategory: (category: SettingCategory) => void;
}

const CATEGORIES: { id: SettingCategory; label: string; icon: string; desc: string }[] = [
  { id: 'all', label: 'All Settings', icon: 'view-grid-outline', desc: 'Display all available system and custom deep links' },
  { id: 'banking', label: 'Safe Banking', icon: 'shield-check-outline', desc: 'Settings required to pass UPI and banking checks' },
  { id: 'developer', label: 'Developer Options', icon: 'code-tags', desc: 'USB debugging, wireless ADB, mock location' },
  { id: 'permissions', label: 'Permissions & Access', icon: 'layers-outline', desc: 'Overlay apps, unknown sources, notification listeners' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'lock-outline', desc: 'Biometrics, screen lock, location permissions' },
  { id: 'system', label: 'System & Apps', icon: 'cog-outline', desc: 'Battery optimization, default apps, all apps manager' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="tune-variant" size={20} color={Colors.textPrimary} />
              <Text style={styles.modalTitle}>Filter by Category</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryRow, isSelected && styles.categoryRowActive]}
                  onPress={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={20}
                      color={isSelected ? '#FFFFFF' : Colors.textPrimary}
                    />
                  </View>

                  <View style={styles.detailsCol}>
                    <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.categoryDesc} numberOfLines={1}>
                      {cat.desc}
                    </Text>
                  </View>

                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={18} color={Colors.textPrimary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.glassCardElevated,
    borderRadius: 4, // Sharp corners
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  optionsList: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4, // Sharp corners
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryRowActive: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.textPrimary,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 4, // Sharp corners
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxActive: {
    backgroundColor: Colors.textPrimary,
  },
  detailsCol: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  categoryLabelActive: {
    fontWeight: '800',
  },
  categoryDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
