import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from './src/theme/colors';
import { SETTINGS_REGISTRY } from './src/data/settingsRegistry';
import { SettingCategory, SettingItem, DeviceContext, UserPreferences } from './src/types';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { FilterDropdown } from './src/components/FilterDropdown';
import { StarredCarousel } from './src/components/StarredCarousel';
import { CollapsibleCategorySection } from './src/components/CollapsibleCategorySection';
import { SettingActionCard } from './src/components/SettingActionCard';
import { SettingsModal } from './src/components/SettingsModal';
import { IntentErrorModal } from './src/components/IntentErrorModal';
import { AddCustomSettingModal } from './src/components/AddCustomSettingModal';
import { QuickTileAssignModal } from './src/components/QuickTileAssignModal';
import { CardActionsModal } from './src/components/CardActionsModal';
import { launchSettingsIntent } from './src/services/intentService';
import { getDeviceContext } from './src/services/deviceService';
import { StorageService } from './src/services/storageService';
import { NativeBridge } from './src/services/nativeBridgeService';

const CATEGORY_CONFIG: { key: string; title: string; icon: string }[] = [
  { key: 'custom', title: 'Custom Shortcuts', icon: 'tune' },
  { key: 'banking', title: 'Banking & UPI Security', icon: 'shield-check-outline' },
  { key: 'developer', title: 'Developer & Debugging', icon: 'code-tags' },
  { key: 'permissions', title: 'Special App Permissions', icon: 'layers-outline' },
  { key: 'privacy', title: 'Privacy & Sensors', icon: 'shield-lock-outline' },
  { key: 'system', title: 'System & Battery', icon: 'cellphone-cog' },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SettingCategory>('all');
  const [pinnedIds, setPinnedIds] = useState<string[]>(['dev_options', 'accessibility_settings']);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [customSettings, setCustomSettings] = useState<SettingItem[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<{ x: number; y: number; width: number; height: number } | undefined>();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTarget, setErrorModalTarget] = useState<{ title: string; message?: string }>({
    title: '',
  });

  // Home Screen & Quick Settings Tile modal states
  const [quickTileModalVisible, setQuickTileModalVisible] = useState(false);
  const [quickTileTargetItem, setQuickTileTargetItem] = useState<SettingItem | null>(null);
  const [cardActionsModalVisible, setCardActionsModalVisible] = useState(false);
  const [cardActionsTargetItem, setCardActionsTargetItem] = useState<SettingItem | null>(null);

  const deviceContext: DeviceContext = useMemo(() => getDeviceContext(), []);

  // Compute safe top padding directly from native Android StatusBar API
  const topInset = useMemo(() => {
    if (Platform.OS === 'android') {
      return (RNStatusBar.currentHeight || 28) + 12;
    }
    return 44;
  }, []);

  // Load preferences and custom items from AsyncStorage on mount
  useEffect(() => {
    StorageService.getPreferences().then((prefs: UserPreferences) => {
      if (prefs.pinnedSettingIds) {
        setPinnedIds(prefs.pinnedSettingIds);
      }
    });

    StorageService.getCustomSettings().then((items: SettingItem[]) => {
      setCustomSettings(items);
    });
  }, []);

  const triggerHaptic = useCallback(async () => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Ignore haptics errors on unsupported devices
      }
    }
  }, []);

  // Combined setting list: Custom items first, then registry
  const allAvailableSettings = useMemo(() => {
    return [...customSettings, ...SETTINGS_REGISTRY];
  }, [customSettings]);

  const handleLaunchItem = useCallback(async (item: SettingItem) => {
    await triggerHaptic();
    await StorageService.recordUsage(item.id);

    const result = await launchSettingsIntent(item.intent);
    if (!result.success) {
      setErrorModalTarget({
        title: item.title,
        message: result.error,
      });
      setErrorModalVisible(true);
    }
  }, [triggerHaptic]);

  const handleTogglePin = useCallback(async (id: string) => {
    await triggerHaptic();
    const updated = await StorageService.togglePin(id);
    setPinnedIds(updated);
  }, [triggerHaptic]);

  const handleAddCustomItem = useCallback(async (item: SettingItem) => {
    await triggerHaptic();
    const updated = await StorageService.addCustomSetting(item);
    setCustomSettings(updated);
  }, [triggerHaptic]);

  const handleDeleteCustomItem = useCallback((item: SettingItem) => {
    Alert.alert(
      'Delete Shortcut',
      `Are you sure you want to remove "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await triggerHaptic();
            const updated = await StorageService.deleteCustomSetting(item.id);
            setCustomSettings(updated);
            if (pinnedIds.includes(item.id)) {
              handleTogglePin(item.id);
            }
          },
        },
      ]
    );
  }, [pinnedIds, handleTogglePin, triggerHaptic]);

  const handleToggleCategory = useCallback(async (key: string) => {
    await triggerHaptic();
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, [triggerHaptic]);

  // Automatically sync pinned items to Android Native SharedPreferences (for Bento and 1x1 widgets)
  useEffect(() => {
    if (Platform.OS === 'android') {
      const pinnedList = allAvailableSettings.filter(s => pinnedIds.includes(s.id));
      NativeBridge.syncShortcutsToNative(pinnedList);
    }
  }, [pinnedIds, allAvailableSettings]);

  // Filtered settings
  const filteredSettings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allAvailableSettings.filter(item => {
      // Category check
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'banking' && !item.isBankingCritical) return false;
        if (selectedCategory !== 'banking' && item.category !== selectedCategory) return false;
      }

      // Query check
      if (!query) return true;
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.shortDescription.toLowerCase().includes(query);
      const matchKeyword = item.keywords.some(k => k.toLowerCase().includes(query));
      return matchTitle || matchDesc || matchKeyword;
    });
  }, [allAvailableSettings, searchQuery, selectedCategory]);

  // Starred shortcuts list for the carousel
  const starredSettings = useMemo(() => {
    return allAvailableSettings.filter(item => pinnedIds.includes(item.id));
  }, [allAvailableSettings, pinnedIds]);

  // Grouped categories for collapsible accordions (collapsed by default)
  const groupedCategories = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;
    return CATEGORY_CONFIG.map(cat => {
      const items = filteredSettings.filter(item => {
        if (cat.key === 'custom') return !!item.isCustom;
        if (cat.key === 'banking') return !item.isCustom && item.isBankingCritical;
        return !item.isCustom && !item.isBankingCritical && item.category === cat.key;
      });
      return {
        ...cat,
        items,
        count: items.length,
        isCollapsed: isSearching ? false : !expandedCategories[cat.key],
      };
    }).filter(cat => cat.count > 0);
  }, [filteredSettings, searchQuery, expandedCategories]);

  return (
    <View style={[styles.mainContainer, { paddingTop: topInset }]}>
      <StatusBar style="dark" />

      {/* Decorative ambient glass light blobs in background */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowCenter} />

      {/* Header */}
      <Header
        deviceContext={deviceContext}
        onOpenDiagnostics={() => setSettingsVisible(true)}
        onOpenAddModal={() => setAddModalVisible(true)}
        onOpenTilesModal={() => {
          setQuickTileTargetItem(null);
          setQuickTileModalVisible(true);
        }}
      />

      {/* Search Bar with Category Filter Tune Button */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        onFilterPress={() => setFilterDropdownVisible(prev => !prev)}
        onLayoutFilterButton={layout => setFilterAnchor(layout)}
        selectedCategory={selectedCategory}
      />

      {/* Active Category Filter Chip Banner */}
      {selectedCategory !== 'all' && (
        <View style={styles.activeFilterBanner}>
          <Text style={styles.activeFilterText}>
            Showing: <Text style={styles.activeFilterBold}>{selectedCategory.toUpperCase()}</Text>
          </Text>
          <TouchableOpacity onPress={() => setSelectedCategory('all')}>
            <MaterialCommunityIcons name="close-circle" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Vertical Scroll Container */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Starred Carousel - pinned shortcuts right above all categories */}
        <StarredCarousel
          starredItems={starredSettings}
          onLaunchItem={handleLaunchItem}
          onTogglePin={handleTogglePin}
          onOptionsPress={item => {
            setCardActionsTargetItem(item);
            setCardActionsModalVisible(true);
          }}
        />

        {/* Collapsible Category Sections with 2-column Bento Grid */}
        {groupedCategories.length > 0 ? (
          groupedCategories.map(cat => (
            <CollapsibleCategorySection
              key={cat.key}
              title={cat.title}
              icon={cat.icon}
              count={cat.count}
              isCollapsed={cat.isCollapsed}
              onToggle={() => handleToggleCategory(cat.key)}
            >
              <View style={styles.gridRow}>
                {cat.items.map(item => (
                  <View key={item.id} style={styles.gridCol}>
                    <SettingActionCard
                      item={item}
                      isPinned={pinnedIds.includes(item.id)}
                      onPress={() => handleLaunchItem(item)}
                      onTogglePin={() => handleTogglePin(item.id)}
                      onDelete={item.isCustom ? () => handleDeleteCustomItem(item) : undefined}
                      onOptionsPress={() => {
                        setCardActionsTargetItem(item);
                        setCardActionsModalVisible(true);
                      }}
                    />
                  </View>
                ))}
              </View>
            </CollapsibleCategorySection>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching settings</Text>
            <Text style={styles.emptySubtitle}>
              Try searching or tap "+ Add" in the top header to create a custom shortcut.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Anchored Dropdown from Tune Icon */}
      <FilterDropdown
        visible={filterDropdownVisible}
        onClose={() => setFilterDropdownVisible(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        anchorPosition={filterAnchor}
      />

      <AddCustomSettingModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddCustomItem={handleAddCustomItem}
        existingIds={allAvailableSettings.map(s => s.id)}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        deviceContext={deviceContext}
      />

      <IntentErrorModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        title={errorModalTarget.title}
        errorMessage={errorModalTarget.message}
        onOpenRootSettings={() => {
          setErrorModalVisible(false);
          launchSettingsIntent({ action: 'android.settings.SETTINGS' });
        }}
      />

      {/* Quick Action Sheet for 1-Tap Home Screen Pinning, Tile assigning, etc. */}
      <CardActionsModal
        visible={cardActionsModalVisible}
        item={cardActionsTargetItem}
        isPinned={cardActionsTargetItem ? pinnedIds.includes(cardActionsTargetItem.id) : false}
        onClose={() => setCardActionsModalVisible(false)}
        onTogglePin={id => {
          handleTogglePin(id);
        }}
        onOpenTileAssign={item => {
          setQuickTileTargetItem(item);
          setQuickTileModalVisible(true);
        }}
        onDeleteCustom={cardActionsTargetItem?.isCustom ? () => handleDeleteCustomItem(cardActionsTargetItem) : undefined}
      />

      {/* Quick Settings Notification Panel Tile Manager Modal */}
      <QuickTileAssignModal
        visible={quickTileModalVisible}
        targetItem={quickTileTargetItem}
        onClose={() => {
          setQuickTileModalVisible(false);
          setQuickTileTargetItem(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.canvas,
    position: 'relative',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110, // Restored smooth circular glow
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  ambientGlowCenter: {
    position: 'absolute',
    top: 260,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130, // Restored smooth circular glow
    backgroundColor: 'rgba(240, 245, 250, 0.9)',
  },
  activeFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glassCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 2, // Sharp
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  activeFilterText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterBold: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCol: {
    width: '50%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
