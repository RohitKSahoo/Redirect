import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingItem } from '../types';
import { NativeBridge, QuickTileSlotState } from '../services/nativeBridgeService';

interface QuickTileAssignModalProps {
  visible: boolean;
  targetItem: SettingItem | null; // The setting item to assign (if tapped from a card)
  onClose: () => void;
}

export const QuickTileAssignModal: React.FC<QuickTileAssignModalProps> = ({
  visible,
  targetItem,
  onClose,
}) => {
  const [slots, setSlots] = useState<QuickTileSlotState>({
    slot1: null,
    slot2: null,
    slot3: null,
  });

  const loadSlots = async () => {
    const current = await NativeBridge.getQuickTileSlots();
    setSlots(current);
  };

  useEffect(() => {
    let isMounted = true;
    if (visible) {
      NativeBridge.getQuickTileSlots().then(res => {
        if (isMounted) {
          setSlots(res);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handleAssignToSlot = async (slotNum: 1 | 2 | 3) => {
    if (!targetItem) return;
    const success = await NativeBridge.setQuickTileSlot(slotNum, targetItem);
    if (success) {
      Alert.alert(
        'Quick Tile Assigned!',
        `"${targetItem.title}" is now set to Notification Tile Slot ${slotNum}.\n\nTo use it: Swipe down your notification shade, tap the pencil (edit) icon, and drag "Redirect Slot ${slotNum}" into your active tiles.`
      );
      await loadSlots();
      onClose();
    } else {
      Alert.alert('Error', 'Could not assign Quick Tile on this device.');
    }
  };

  const handleClearSlot = async (slotNum: 1 | 2 | 3) => {
    await NativeBridge.setQuickTileSlot(slotNum, null);
    await loadSlots();
  };

  const renderSlotCard = (slotNum: 1 | 2 | 3, item: SettingItem | null) => {
    const isTargetAssigned = targetItem && item?.id === targetItem.id;

    return (
      <View key={slotNum} style={styles.slotRow}>
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>TILE {slotNum}</Text>
        </View>

        <View style={styles.slotInfo}>
          <Text style={styles.slotTitle} numberOfLines={1}>
            {item ? item.title : 'Empty Slot'}
          </Text>
          <Text style={styles.slotSubtitle} numberOfLines={1}>
            {item ? item.intent.action : 'Not assigned yet'}
          </Text>
        </View>

        <View style={styles.slotActions}>
          {targetItem ? (
            <TouchableOpacity
              style={[styles.assignBtn, isTargetAssigned && styles.assignedBtn]}
              onPress={() => handleAssignToSlot(slotNum)}
              activeOpacity={0.8}
            >
              <Text style={styles.assignBtnText}>
                {isTargetAssigned ? 'Active ✓' : 'Assign'}
              </Text>
            </TouchableOpacity>
          ) : (
            item && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => handleClearSlot(slotNum)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Transparent tap-to-dismiss overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.popupCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Quick Settings Tiles</Text>
              <Text style={styles.modalSubtitle}>
                {targetItem
                  ? `Assign "${targetItem.title}" to a notification shade slot`
                  : 'Manage notification shade quick access tiles'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Slots List */}
          <View style={styles.slotsContainer}>
            {renderSlotCard(1, slots.slot1)}
            {renderSlotCard(2, slots.slot2)}
            {renderSlotCard(3, slots.slot3)}
          </View>

          {/* Instructions Footer */}
          <View style={styles.instructionsBox}>
            <MaterialCommunityIcons name="information-outline" size={16} color={Colors.emerald} />
            <Text style={styles.instructionsText}>
              Pull down notification shade → Tap pencil (edit) → Drag &quot;Redirect Slot&quot; to active quick settings.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  popupCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 4, // Sharp corners matching Bento theme
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotsContainer: {
    gap: 8,
    marginVertical: 10,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  slotBadge: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 2,
    marginRight: 10,
  },
  slotBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  slotInfo: {
    flex: 1,
    marginRight: 8,
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  slotSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
  },
  assignedBtn: {
    backgroundColor: Colors.emerald,
  },
  assignBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clearBtn: {
    padding: 4,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.emeraldLight,
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.25)',
  },
  instructionsText: {
    flex: 1,
    fontSize: 10,
    color: '#15803D',
    lineHeight: 14,
    fontWeight: '600',
  },
});
