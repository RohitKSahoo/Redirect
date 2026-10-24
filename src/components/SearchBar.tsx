import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingCategory } from '../types';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress?: () => void;
  selectedCategory: SettingCategory;
  onLayoutFilterButton?: (layout: { x: number; y: number; width: number; height: number }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  selectedCategory,
  onLayoutFilterButton,
}) => {
  const isFiltered = selectedCategory !== 'all';

  const handlePress = (e: GestureResponderEvent) => {
    if (onLayoutFilterButton) {
      const { pageX, pageY } = e.nativeEvent;
      onLayoutFilterButton({ x: pageX - 48, y: pageY - 24, width: 48, height: 48 });
    }
    if (onFilterPress) {
      onFilterPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Search settings..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.filterButton, isFiltered && styles.filterButtonActive]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="tune-variant"
          size={20}
          color={isFiltered ? '#FFFFFF' : Colors.textPrimary}
        />
        {isFiltered && <View style={styles.filterDot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    borderRadius: 4, // Sharp corners
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 4, // Sharp corners
    backgroundColor: Colors.glassCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
  },
});
