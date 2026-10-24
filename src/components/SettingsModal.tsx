import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Alert,
  StatusBar as RNStatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { DeviceContext, SettingItem } from '../types';
import { NativeBridge, QuickTileSlotState } from '../services/nativeBridgeService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  deviceContext: DeviceContext;
  allAvailableSettings: SettingItem[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  deviceContext,
  allAvailableSettings,
}) => {
  const topInset = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) + 8 : 44;

  // Quick Settings Tiles state
  const [isTilesDropdownOpen, setIsTilesDropdownOpen] = useState(true);
  const [activeSlotPicker, setActiveSlotPicker] = useState<1 | 2 | 3 | null>(null);
  const [slotPickerSearch, setSlotPickerSearch] = useState('');
  const [slots, setSlots] = useState<QuickTileSlotState>({
    slot1: null,
    slot2: null,
    slot3: null,
  });

  const triggerHaptic = useCallback(async () => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Ignore haptics errors
      }
    }
  }, []);

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

  const handleLinkSlot = async (slotNum: 1 | 2 | 3, item: SettingItem) => {
    await triggerHaptic();
    const success = await NativeBridge.setQuickTileSlot(slotNum, item);
    if (success) {
      setSlots(prev => ({
        ...prev,
        [`slot${slotNum}`]: item,
      }));
      setActiveSlotPicker(null);
      setSlotPickerSearch('');
      Alert.alert(
        'Quick Tile Linked!',
        `"${item.title}" is now linked to Tile ${slotNum}.\n\nWhen added to your notification pull-down shade, it will display this shortcut's icon and label.`
      );
    } else {
      Alert.alert('Error', 'Could not link Quick Tile on this device.');
    }
  };

  const handleClearSlot = async (slotNum: 1 | 2 | 3) => {
    await triggerHaptic();
    await NativeBridge.setQuickTileSlot(slotNum, null);
    setSlots(prev => ({
      ...prev,
      [`slot${slotNum}`]: null,
    }));
    if (activeSlotPicker === slotNum) {
      setActiveSlotPicker(null);
    }
  };

  const handleOpenGithub = async () => {
    const url = 'https://github.com/RohitKSahoo';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Ignore link error
    }
  };

  // Filtered settings for the inline slot picker dropdown
  const filteredPickerShortcuts = useMemo(() => {
    const q = slotPickerSearch.trim().toLowerCase();
    if (!q) return allAvailableSettings;
    return allAvailableSettings.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [allAvailableSettings, slotPickerSearch]);

  const renderSlotRow = (slotNum: 1 | 2 | 3, item: SettingItem | null) => {
    const isPickerOpen = activeSlotPicker === slotNum;

    return (
      <View key={slotNum} style={styles.slotRowWrapper}>
        <View style={styles.slotMainRow}>
          <View style={styles.slotBadge}>
            <Text style={styles.slotBadgeText}>TILE {slotNum}</Text>
          </View>

          {/* Icon Box: If linked, show shortcut icon from Redirect; if empty, show generic gear icon */}
          <View
            style={[
              styles.slotIconBox,
              item
                ? {
                    backgroundColor: `${item.accentColor || '#3A86FF'}18`,
                    borderColor: `${item.accentColor || '#3A86FF'}40`,
                  }
                : styles.emptySlotIconBox,
            ]}
          >
            <MaterialCommunityIcons
              name={(item ? item.icon : 'cog-outline') as any}
              size={18}
              color={item ? item.accentColor || Colors.textPrimary : Colors.textMuted}
            />
          </View>

          {/* Details */}
          <View style={styles.slotInfo}>
            <Text style={styles.slotTitle} numberOfLines={1}>
              {item ? item.title : 'Empty Slot'}
            </Text>
            <Text style={styles.slotSubtitle} numberOfLines={1}>
              {item ? 'Linked • Tap Change to swap' : 'Generic Gear Icon • Unlinked'}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.slotActions}>
            {item ? (
              <>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={() => {
                    triggerHaptic();
                    setActiveSlotPicker(isPickerOpen ? null : slotNum);
                    setSlotPickerSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeBtnText}>{isPickerOpen ? 'Close' : 'Change'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => handleClearSlot(slotNum)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => {
                  triggerHaptic();
                  setActiveSlotPicker(isPickerOpen ? null : slotNum);
                  setSlotPickerSearch('');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.linkBtnText}>{isPickerOpen ? 'Close' : 'Link'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* INLINE SHORTCUT PICKER DROPDOWN */}
        {isPickerOpen && (
          <View style={styles.inlinePickerCard}>
            <View style={styles.pickerSearchRow}>
              <MaterialCommunityIcons name="magnify" size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Search shortcuts to link..."
                placeholderTextColor={Colors.textMuted}
                value={slotPickerSearch}
                onChangeText={setSlotPickerSearch}
                autoCapitalize="none"
              />
              {slotPickerSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSlotPickerSearch('')}>
                  <MaterialCommunityIcons name="close" size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.pickerScrollList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredPickerShortcuts.map(sc => (
                <TouchableOpacity
                  key={sc.id}
                  style={styles.pickerItemRow}
                  onPress={() => handleLinkSlot(slotNum, sc)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.pickerItemIconBox, { backgroundColor: `${sc.accentColor}18` }]}>
                    <MaterialCommunityIcons name={sc.icon as any} size={16} color={sc.accentColor} />
                  </View>
                  <View style={styles.pickerItemDetails}>
                    <Text style={styles.pickerItemTitle} numberOfLines={1}>
                      {sc.title}
                    </Text>
                    <Text style={styles.pickerItemDesc} numberOfLines={1}>
                      {sc.shortDescription}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { paddingTop: topInset }]}>
        {/* Ambient decorative light glow */}
        <View style={styles.ambientGlow} />

        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECTION 1: DEVICE DIAGNOSTICS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="cellphone-information" size={16} color={Colors.textSecondary} />
              <Text style={styles.sectionTitle}>DEVICE ENVIRONMENT</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Manufacturer</Text>
                <Text style={styles.dataValue}>{deviceContext.brand}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Device Model</Text>
                <Text style={styles.dataValue}>{deviceContext.modelName}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Android Version</Text>
                <Text style={styles.dataValue}>Android {deviceContext.osVersion}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>API Level</Text>
                <Text style={styles.dataValue}>API {deviceContext.apiLevel}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>OEM Intent Engine</Text>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>
                    {deviceContext.isSupportedOem ? 'NATIVE OEM PROFILE' : 'AOSP STANDARD'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 2: QUICK SETTINGS TILES (INLINE DROPDOWN) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="view-dashboard-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.sectionTitle}>QUICK SETTINGS TILES</Text>
            </View>

            <View style={styles.card}>
              {/* Collapsible Header */}
              <TouchableOpacity
                style={styles.tileDropdownHeader}
                onPress={() => {
                  triggerHaptic();
                  setIsTilesDropdownOpen(prev => !prev);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.tileDropdownHeaderLeft}>
                  <View style={styles.tileSettingIconBox}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={Colors.textPrimary} />
                  </View>
                  <View style={styles.tileSettingTextGroup}>
                    <Text style={styles.tileSettingTitle}>Notification Panel Tiles</Text>
                    <Text style={styles.tileSettingSubtitle}>
                      {isTilesDropdownOpen ? 'Configure 3 pulldown tiles below' : 'Tap to expand & link shortcuts'}
                    </Text>
                  </View>
                </View>

                <MaterialCommunityIcons
                  name={isTilesDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Expanded Dropdown Content */}
              {isTilesDropdownOpen && (
                <View style={styles.tileDropdownContent}>
                  <Text style={styles.tileInstructionText}>
                    When unlinked, a tile shows the generic gear icon. Linking a shortcut updates the tile with that shortcut&apos;s icon and label.
                  </Text>

                  {renderSlotRow(1, slots.slot1)}
                  {renderSlotRow(2, slots.slot2)}
                  {renderSlotRow(3, slots.slot3)}
                </View>
              )}
            </View>
          </View>

          {/* SECTION 3: COMING SOON FEATURES */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="rocket-launch-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.sectionTitle}>COMING SOON</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.upcomingItem}>
                <View style={styles.upcomingIconBox}>
                  <MaterialCommunityIcons name="radar" size={20} color={Colors.textPrimary} />
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>Live Screen Detect</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 4: DEVELOPER & GITHUB PROFILE */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="code-tags" size={16} color={Colors.textSecondary} />
              <Text style={styles.sectionTitle}>DEVELOPER & GITHUB</Text>
            </View>

            <TouchableOpacity
              style={[styles.card, styles.githubCard]}
              onPress={handleOpenGithub}
              activeOpacity={0.75}
            >
              <View style={styles.githubLeftRow}>
                <View style={styles.githubIconBox}>
                  <MaterialCommunityIcons name="github" size={26} color="#FFFFFF" />
                </View>
                <View style={styles.githubTextGroup}>
                  <Text style={styles.githubHandle}>RohitKSahoo</Text>
                  <Text style={styles.githubUrl}>github.com/RohitKSahoo</Text>
                  <Text style={styles.githubRole}>Creator & Developer of Redirect</Text>
                </View>
              </View>
              <View style={styles.openLinkIconBox}>
                <MaterialCommunityIcons name="open-in-new" size={18} color={Colors.textPrimary} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: Colors.glassCard,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    padding: 14,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 2,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginVertical: 2,
  },
  pillBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  // Quick Settings Tiles Dropdown Card
  tileDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileDropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tileSettingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 4,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSettingTextGroup: {
    flex: 1,
  },
  tileSettingTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tileSettingSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  tileDropdownContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  tileInstructionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  slotRowWrapper: {
    marginBottom: 8,
  },
  slotMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 4,
    padding: 10,
    gap: 10,
  },
  slotBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  slotBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  slotIconBox: {
    width: 32,
    height: 32,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotIconBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  slotInfo: {
    flex: 1,
  },
  slotTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  slotSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    gap: 4,
  },
  linkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeBtn: {
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3A86FF',
  },
  clearBtn: {
    padding: 2,
  },

  // Inline Picker dropdown
  inlinePickerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  pickerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 6,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    padding: 0,
  },
  pickerScrollList: {
    maxHeight: 160,
  },
  pickerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
    gap: 8,
  },
  pickerItemIconBox: {
    width: 26,
    height: 26,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemDetails: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pickerItemDesc: {
    fontSize: 10,
    color: Colors.textMuted,
  },

  // Coming Soon Card
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 243, 205, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  comingSoonBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  githubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  githubLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  githubIconBox: {
    width: 42,
    height: 42,
    borderRadius: 4,
    backgroundColor: '#0A0D14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  githubTextGroup: {
    flex: 1,
  },
  githubHandle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  githubUrl: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.emerald,
    marginTop: 1,
  },
  githubRole: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  openLinkIconBox: {
    width: 28,
    height: 28,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginLeft: 8,
  },
});
