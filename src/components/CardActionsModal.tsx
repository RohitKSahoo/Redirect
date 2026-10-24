import React from 'react';
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
import { NativeBridge } from '../services/nativeBridgeService';

interface CardActionsModalProps {
  visible: boolean;
  item: SettingItem | null;
  isPinned: boolean;
  onClose: () => void;
  onTogglePin: (id: string) => void;
  onOpenTileAssign: (item: SettingItem) => void;
  onDeleteCustom?: (item: SettingItem) => void;
}

export const CardActionsModal: React.FC<CardActionsModalProps> = ({
  visible,
  item,
  isPinned,
  onClose,
  onTogglePin,
  onOpenTileAssign,
  onDeleteCustom,
}) => {
  if (!item) return null;

  const handlePinToHomeScreen = async () => {
    onClose();
    const res = await NativeBridge.pinToHomeScreen(item);
    if (res.success) {
      Alert.alert(
        'Added to Home Screen!',
        `"${item.title}" has been pinned to your home screen launcher. Tap it anytime to open this deep setting directly.`
      );
    } else {
      Alert.alert(
        'Launcher Note',
        res.error || 'Your device launcher did not accept the pin request. Try adding a Redirect Home Widget instead.'
      );
    }
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
            <View style={[styles.iconBox, { backgroundColor: `${item.accentColor}18` }]}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={item.accentColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemSubtitle} numberOfLines={1}>{item.shortDescription}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Action 1: Add to Home Screen (1-Tap Shortcut) */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handlePinToHomeScreen}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EBF4FF' }]}>
              <MaterialCommunityIcons name="home-plus-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>Add to Home Screen</Text>
              <Text style={styles.actionDescription}>
                Pin a 1-tap direct launch icon onto your phone launcher
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Action 2: Add to Notification Shade Tile */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              onClose();
              onOpenTileAssign(item);
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={Colors.emerald} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>Add to Notification Tile</Text>
              <Text style={styles.actionDescription}>
                Assign to Quick Settings Slot 1, 2, or 3 in your shade
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Action 3: Pin/Unpin inside Redirect & Home Widget */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              onTogglePin(item.id);
              onClose();
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFBEB' }]}>
              <MaterialCommunityIcons
                name={isPinned ? 'star-off-outline' : 'star-outline'}
                size={20}
                color="#D97706"
              />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>
                {isPinned ? 'Unpin from Top Bento Grid' : 'Pin to Top Bento Grid'}
              </Text>
              <Text style={styles.actionDescription}>
                Featured at the top of the app and on Home Screen Bento Widgets
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Action 4: Delete Custom Item (if custom) */}
          {item.isCustom && onDeleteCustom && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                onClose();
                onDeleteCustom(item);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#DC2626" />
              </View>
              <View style={styles.actionDetails}>
                <Text style={[styles.actionTitle, { color: '#DC2626' }]}>Delete Custom Shortcut</Text>
                <Text style={styles.actionDescription}>Remove this custom shortcut from your list</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
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
    borderRadius: 4, // Sharp corners
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
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionDetails: {
    flex: 1,
    marginRight: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionDescription: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
});
