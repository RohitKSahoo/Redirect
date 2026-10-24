import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
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
import { SettingActionCard } from './src/components/SettingActionCard';
import { DiagnosticsModal } from './src/components/DiagnosticsModal';
import { IntentErrorModal } from './src/components/IntentErrorModal';
import { AddCustomSettingModal } from './src/components/AddCustomSettingModal';
import { QuickTileAssignModal } from './src/components/QuickTileAssignModal';
import { CardActionsModal } from './src/components/CardActionsModal';
import { launchSettingsIntent } from './src/services/intentService';
import { getDeviceContext } from './src/services/deviceService';
import { StorageService } from './src/services/storageService';
import { NativeBridge } from './src/services/nativeBridgeService';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SettingCategory>('all');
  const [pinnedIds, setPinnedIds] = useState<string[]>(['dev_options', 'accessibility_settings']);
  const [customSettings, setCustomSettings] = useState<SettingItem[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<{ x: number; y: number; width: number; height: number } | undefined>();
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);
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

  return (
    <View style={[styles.mainContainer, { paddingTop: topInset }]}>
      <StatusBar style="dark" />

      {/* Decorative ambient glass light blobs in background */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowCenter} />

      {/* Header */}
      <Header
        deviceContext={deviceContext}
        onOpenDiagnostics={() => setDiagnosticsVisible(true)}
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

      {/* Bento Grid */}
      <FlatList
        data={filteredSettings}
        keyExtractor={item => item.id}
        numColumns={2}
        key="bento-2-col"
        columnWrapperStyle={styles.rowWrapper}
        renderItem={({ item, index }) => {
          // Highlight first banking/critical item as full-width bento hero if on 'all'
          const isFeatured = index === 0 && selectedCategory === 'all' && !searchQuery;
          return (
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
              isFeatured={isFeatured}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching settings</Text>
            <Text style={styles.emptySubtitle}>
              Try searching or tap "+ Add" in the top header to create a custom shortcut.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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

      <DiagnosticsModal
        visible={diagnosticsVisible}
        onClose={() => setDiagnosticsVisible(false)}
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
  rowWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 32,
    paddingTop: 4,
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
