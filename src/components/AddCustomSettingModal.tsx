import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingCategory, SettingItem } from '../types';
import { PRESET_LIBRARY } from '../data/presetLibrary';
import { INTENT_DICTIONARY } from '../data/intentDictionary';
import { launchSettingsIntent } from '../services/intentService';

interface AddCustomSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCustomItem: (item: SettingItem) => void;
  existingIds: string[];
}

interface CatalogEntry {
  id: string;
  title: string;
  shortDescription: string;
  category: SettingCategory;
  icon: string;
  accentColor: string;
  action: string;
  packageName?: string;
  className?: string;
  keywords: string[];
  isPreset: boolean;
}

const CATEGORIES: { id: SettingCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'system', label: 'System' },
  { id: 'developer', label: 'Developer' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'banking', label: 'Banking' },
];

const ACCENT_COLORS = ['#3A86FF', '#1DB954', '#FF8A00', '#9B51E0', '#E63946', '#2EC4B6'];

const POPULAR_INTENT_ACTIONS = [
  { label: 'Developer Options', action: 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS' },
  { label: 'Private DNS', action: 'android.settings.WIRELESS_SETTINGS' },
  { label: 'Notification History', action: 'android.settings.NOTIFICATION_HISTORY' },
  { label: 'Battery Saver', action: 'android.settings.BATTERY_SAVER_SETTINGS' },
  { label: 'Special App Access', action: 'android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS' },
];

function getIconForIntent(action: string, title: string, category: SettingCategory): string {
  const t = (title + ' ' + action).toLowerCase();
  if (t.includes('battery') || t.includes('power')) return 'battery-charging';
  if (t.includes('wifi') || t.includes('tether')) return 'wifi';
  if (t.includes('bluetooth')) return 'bluetooth';
  if (t.includes('network') || t.includes('operator') || t.includes('5g') || t.includes('sim')) return 'cellphone-wireless';
  if (t.includes('sound') || t.includes('volume') || t.includes('audio')) return 'volume-high';
  if (t.includes('display') || t.includes('night') || t.includes('screen')) return 'brightness-6';
  if (t.includes('storage') || t.includes('memory')) return 'harddisk';
  if (t.includes('fingerprint') || t.includes('biometric') || t.includes('face')) return 'fingerprint';
  if (t.includes('location') || t.includes('gps')) return 'crosshairs-gps';
  if (t.includes('developer') || t.includes('adb')) return 'code-tags';
  if (t.includes('update')) return 'cellphone-arrow-down';
  if (t.includes('permission')) return 'layers-outline';
  if (t.includes('dns')) return 'dns-outline';
  if (t.includes('nfc') || t.includes('pay')) return 'nfc';
  if (category === 'banking') return 'shield-check-outline';
  if (category === 'privacy') return 'shield-lock-outline';
  return 'cog-outline';
}

function getColorForCategory(category: SettingCategory): string {
  switch (category) {
    case 'banking': return '#1DB954';
    case 'developer': return '#FF8A00';
    case 'privacy': return '#9B51E0';
    case 'permissions': return '#2EC4B6';
    case 'system':
    default:
      return '#3A86FF';
  }
}

export const AddCustomSettingModal: React.FC<AddCustomSettingModalProps> = ({
  visible,
  onClose,
  onAddCustomItem,
}) => {
  const topInset = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) + 8 : 44;

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<SettingCategory>('all');

  // "Enter Raw Intent" Expander State
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customAction, setCustomAction] = useState('android.settings.SETTINGS');
  const [customPackage, setCustomPackage] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [customCategory, setCustomCategory] = useState<SettingCategory>('system');
  const [customAccentColor, setCustomAccentColor] = useState(ACCENT_COLORS[0]);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  const triggerHaptic = useCallback(async () => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Ignore haptics errors
      }
    }
  }, []);

  // Build unified catalog of presets and known system intents
  const catalog: CatalogEntry[] = useMemo(() => {
    const list: CatalogEntry[] = [];
    const seenActions = new Set<string>();

    // 1. Presets from library (highest priority, rich metadata)
    PRESET_LIBRARY.forEach((p, idx) => {
      seenActions.add(p.intent.action);
      list.push({
        id: `preset_${idx}`,
        title: p.title,
        shortDescription: p.shortDescription,
        category: p.category,
        icon: p.icon,
        accentColor: p.accentColor,
        action: p.intent.action,
        keywords: p.keywords,
        isPreset: true,
      });
    });

    // 2. Intents from dictionary
    INTENT_DICTIONARY.forEach((d, idx) => {
      if (!seenActions.has(d.action)) {
        seenActions.add(d.action);
        list.push({
          id: `dict_${idx}`,
          title: d.title,
          shortDescription: d.shortDescription,
          category: d.category,
          icon: getIconForIntent(d.action, d.title, d.category),
          accentColor: getColorForCategory(d.category),
          action: d.action,
          packageName: d.packageName,
          className: d.className,
          keywords: d.keywords,
          isPreset: false,
        });
      }
    });

    return list;
  }, []);

  // Filtered catalog based on query and category chip
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalog.filter(item => {
      if (selectedFilterCategory !== 'all' && item.category !== selectedFilterCategory) {
        return false;
      }
      if (!q) return true;
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.shortDescription.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchAction || matchKeywords;
    });
  }, [catalog, searchQuery, selectedFilterCategory]);

  const handleTestIntent = async (action: string, pkg?: string, cls?: string) => {
    if (!action.trim() && !pkg?.trim()) {
      Alert.alert('Required', 'Please enter or select an intent action to test.');
      return;
    }
    await triggerHaptic();

    const result = await launchSettingsIntent({
      action: action.trim() || 'android.intent.action.MAIN',
      packageName: pkg?.trim() || undefined,
      className: cls?.trim() || undefined,
    });

    if (!result.success) {
      Alert.alert(
        'Intent Test Failed',
        result.error || 'This activity could not be launched on your device skin.'
      );
    }
  };

  const handleQuickAddEntry = async (entry: CatalogEntry) => {
    await triggerHaptic();
    const newItem: SettingItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: entry.title,
      shortDescription: entry.shortDescription,
      category: entry.category,
      icon: entry.icon,
      accentColor: entry.accentColor,
      isBankingCritical: entry.category === 'banking',
      isCustom: true,
      createdAt: Date.now(),
      intent: {
        action: entry.action,
        packageName: entry.packageName,
        className: entry.className,
        fallbackActions: ['android.settings.SETTINGS'],
      },
      keywords: [entry.title.toLowerCase(), 'custom', ...entry.keywords],
    };

    onAddCustomItem(newItem);
    onClose();
  };

  const handleLoadIntoCustomizer = (entry: CatalogEntry) => {
    setCustomTitle(entry.title);
    setCustomDescription(entry.shortDescription);
    setCustomAction(entry.action);
    setCustomPackage(entry.packageName || '');
    setCustomClass(entry.className || '');
    setCustomCategory(entry.category);
    setCustomAccentColor(entry.accentColor);
    setIsRawExpanded(true);
    if (entry.packageName || entry.className) {
      setShowAdvancedFields(true);
    }
  };

  const handleSaveCustom = async () => {
    if (!customTitle.trim()) {
      Alert.alert('Required', 'Please enter a shortcut title.');
      return;
    }
    await triggerHaptic();

    const newItem: SettingItem = {
      id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      shortDescription: customDescription.trim() || 'Custom system shortcut',
      category: customCategory,
      icon: getIconForIntent(customAction, customTitle, customCategory),
      accentColor: customAccentColor,
      isBankingCritical: customCategory === 'banking',
      isCustom: true,
      createdAt: Date.now(),
      intent: {
        action: customAction.trim() || 'android.settings.SETTINGS',
        packageName: customPackage.trim() || undefined,
        className: customClass.trim() || undefined,
        fallbackActions: ['android.settings.SETTINGS'],
      },
      keywords: [customTitle.toLowerCase(), 'custom'],
    };

    onAddCustomItem(newItem);
    // Reset custom inputs
    setCustomTitle('');
    setCustomDescription('');
    setCustomAction('android.settings.SETTINGS');
    setCustomPackage('');
    setCustomClass('');
    setIsRawExpanded(false);
    onClose();
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
        {/* Subtle decorative glow */}
        <View style={styles.ambientGlow} />

        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Add Shortcut</Text>
            <Text style={styles.headerSubtitle}>Preset catalog & custom Android intents</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. SEARCH CATALOG AT THE TOP */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search presets or intents (e.g. DNS, NFC, 5G)..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {CATEGORIES.map(cat => {
                const isActive = selectedFilterCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setSelectedFilterCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 2. CATALOG / PRESETS LIST */}
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="view-grid-plus-outline" size={15} color={Colors.textSecondary} />
              <Text style={styles.sectionTitle}>PRESET & SYSTEM CATALOG</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredCatalog.length}</Text>
              </View>
            </View>

            {filteredCatalog.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="text-search" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No matching preset found</Text>
                <Text style={styles.emptySubtitle}>
                  No preset matches &ldquo;{searchQuery}&rdquo;. You can create a custom intent directly below:
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => {
                    setCustomTitle(searchQuery);
                    setIsRawExpanded(true);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                  <Text style={styles.emptyActionBtnText}>Create &ldquo;{searchQuery}&rdquo; Intent</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.catalogGrid}>
                {filteredCatalog.map(item => (
                  <View key={item.id} style={styles.catalogCard}>
                    <TouchableOpacity
                      style={styles.catalogMainTouch}
                      onPress={() => handleLoadIntoCustomizer(item)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.catalogIconBox, { backgroundColor: `${item.accentColor}16` }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.accentColor} />
                      </View>

                      <View style={styles.catalogTextBox}>
                        <View style={styles.catalogTitleRow}>
                          <Text style={styles.catalogTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          {item.isPreset && (
                            <View style={styles.presetTag}>
                              <Text style={styles.presetTagText}>PRESET</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.catalogDesc} numberOfLines={1}>
                          {item.shortDescription}
                        </Text>
                        <Text style={styles.catalogAction} numberOfLines={1}>
                          {item.action}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Quick Action Buttons */}
                    <View style={styles.catalogActionRow}>
                      <TouchableOpacity
                        style={styles.testBtn}
                        onPress={() => handleTestIntent(item.action, item.packageName, item.className)}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name="play" size={13} color={Colors.emerald} />
                        <Text style={styles.testBtnText}>Test</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleQuickAddEntry(item)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="plus" size={15} color="#FFFFFF" />
                        <Text style={styles.addBtnText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 3. "ENTER RAW INTENT" EXPANDER (POWER USERS) */}
            <View style={styles.expanderContainer}>
              <TouchableOpacity
                style={styles.expanderHeader}
                onPress={() => setIsRawExpanded(prev => !prev)}
                activeOpacity={0.8}
              >
                <View style={styles.expanderHeaderLeft}>
                  <View style={styles.expanderIconBox}>
                    <MaterialCommunityIcons name="code-tags" size={18} color="#FF8A00" />
                  </View>
                  <View>
                    <View style={styles.expanderTitleRow}>
                      <Text style={styles.expanderTitle}>Enter Raw Intent</Text>
                      <View style={styles.powerUserBadge}>
                        <Text style={styles.powerUserBadgeText}>POWER USER</Text>
                      </View>
                    </View>
                    <Text style={styles.expanderSubtitle}>
                      Configure custom Android action, package, class or extras
                    </Text>
                  </View>
                </View>

                <MaterialCommunityIcons
                  name={isRawExpanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>

              {isRawExpanded && (
                <View style={styles.expanderBody}>
                  {/* Shortcut Name */}
                  <Text style={styles.formLabel}>Shortcut Title *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Private DNS, 5G Mode, Wi-Fi..."
                    placeholderTextColor={Colors.textMuted}
                    value={customTitle}
                    onChangeText={setCustomTitle}
                  />

                  {/* Intent Action */}
                  <Text style={styles.formLabel}>Android Intent Action *</Text>
                  <TextInput
                    style={styles.formInputMono}
                    placeholder="e.g. android.settings.SETTINGS"
                    placeholderTextColor={Colors.textMuted}
                    value={customAction}
                    onChangeText={setCustomAction}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {/* Quick Pick Action Chips */}
                  <Text style={styles.formHint}>Popular Actions Quick-Fill:</Text>
                  <View style={styles.quickActionPillsWrap}>
                    {POPULAR_INTENT_ACTIONS.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.quickActionPill}
                        onPress={() => {
                          setCustomAction(item.action);
                          if (!customTitle) setCustomTitle(item.label);
                        }}
                      >
                        <Text style={styles.quickActionPillText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Category Picker */}
                  <Text style={styles.formLabel}>Category</Text>
                  <View style={styles.categoryPillsWrap}>
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChoice,
                          customCategory === cat.id && styles.categoryChoiceActive,
                        ]}
                        onPress={() => setCustomCategory(cat.id)}
                      >
                        <Text
                          style={[
                            styles.categoryChoiceText,
                            customCategory === cat.id && styles.categoryChoiceTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Accent Color Picker */}
                  <Text style={styles.formLabel}>Accent Color</Text>
                  <View style={styles.colorsRow}>
                    {ACCENT_COLORS.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: c },
                          customAccentColor === c && styles.colorCircleActive,
                        ]}
                        onPress={() => setCustomAccentColor(c)}
                      >
                        {customAccentColor === c && (
                          <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Optional Description */}
                  <Text style={styles.formLabel}>Description (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Short summary of this shortcut"
                    placeholderTextColor={Colors.textMuted}
                    value={customDescription}
                    onChangeText={setCustomDescription}
                  />

                  {/* Toggle Advanced Component Fields */}
                  <TouchableOpacity
                    style={styles.advancedToggle}
                    onPress={() => setShowAdvancedFields(prev => !prev)}
                  >
                    <MaterialCommunityIcons
                      name={showAdvancedFields ? 'minus-box-outline' : 'plus-box-outline'}
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.advancedToggleText}>
                      {showAdvancedFields ? 'Hide OEM Component Options' : 'Show OEM Package & Class Name'}
                    </Text>
                  </TouchableOpacity>

                  {showAdvancedFields && (
                    <View style={styles.advancedFieldsBox}>
                      <Text style={styles.formLabel}>Package Name (Optional)</Text>
                      <TextInput
                        style={styles.formInputMono}
                        placeholder="e.g. com.android.settings"
                        placeholderTextColor={Colors.textMuted}
                        value={customPackage}
                        onChangeText={setCustomPackage}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />

                      <Text style={styles.formLabel}>Activity Class (Optional)</Text>
                      <TextInput
                        style={styles.formInputMono}
                        placeholder="e.g. com.android.settings.SubSettings"
                        placeholderTextColor={Colors.textMuted}
                        value={customClass}
                        onChangeText={setCustomClass}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  )}

                  {/* Action Buttons: Test & Save */}
                  <View style={styles.formActionsRow}>
                    <TouchableOpacity
                      style={styles.formTestBtn}
                      onPress={() => handleTestIntent(customAction, customPackage, customClass)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="play-outline" size={16} color={Colors.emerald} />
                      <Text style={styles.formTestBtnText}>Test Intent</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.formSaveBtn}
                      onPress={handleSaveCustom}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                      <Text style={styles.formSaveBtnText}>Save Shortcut</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    marginRight: 10,
    borderRadius: 4,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  flexOne: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
    padding: 0,
  },

  // Filter Chips Row
  filterPillsRow: {
    flexDirection: 'row',
    paddingBottom: 14,
    gap: 6,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
  },
  filterPillActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 6,
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Catalog Cards
  catalogGrid: {
    gap: 8,
    marginBottom: 16,
  },
  catalogCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  catalogMainTouch: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  catalogIconBox: {
    width: 38,
    height: 38,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  catalogTextBox: {
    flex: 1,
  },
  catalogTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  catalogTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  presetTag: {
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  presetTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3A86FF',
  },
  catalogDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 3,
  },
  catalogAction: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.textMuted,
  },
  catalogActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
    paddingTop: 8,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    gap: 4,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.emerald,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 3,
    gap: 4,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Expander for Raw Intent
  expanderContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  expanderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  expanderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  expanderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expanderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expanderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  powerUserBadge: {
    backgroundColor: 'rgba(255, 138, 0, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  powerUserBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF8A00',
  },
  expanderSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  expanderBody: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#FAFAFB',
  },

  // Form Fields
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 5,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  formInputMono: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.textPrimary,
  },
  formHint: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  quickActionPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  quickActionPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChoice: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  categoryChoiceActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  categoryChoiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleActive: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 4,
  },
  advancedToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  advancedFieldsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 10,
    borderRadius: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  formTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderWidth: 1,
    borderColor: Colors.emerald,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 4,
    gap: 6,
  },
  formTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emerald,
  },
  formSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 4,
    gap: 6,
  },
  formSaveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
