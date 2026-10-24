import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface CollapsibleCategorySectionProps {
  title: string;
  icon: string;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const CollapsibleCategorySection: React.FC<CollapsibleCategorySectionProps> = ({
  title,
  icon,
  count,
  isCollapsed,
  onToggle,
  children,
}) => {
  return (
    <View style={styles.sectionWrapper}>
      {/* Collapsible Header Bar */}
      <TouchableOpacity
        style={styles.headerBar}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.leftGroup}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={icon as any}
              size={17}
              color={Colors.textPrimary}
            />
          </View>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        <View style={styles.rightGroup}>
          {/* Minimal Number Indicator */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>

          <MaterialCommunityIcons
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Accordion Body */}
      {!isCollapsed && <View style={styles.contentContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrapper: {
    marginBottom: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassCard,
    borderRadius: 4, // Sharp corners
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 1.5,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 3, // Sharp corners
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 2, // Sharp corners
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
});
