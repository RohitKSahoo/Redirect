import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Colors } from './src/theme/colors';
import { SETTINGS_REGISTRY } from './src/data/settingsRegistry';
import { SettingCategory, SettingItem, DeviceContext, UserPreferences } from './src/types';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { CategoryPills } from './src/components/CategoryPills';
import { SettingActionCard } from './src/components/SettingActionCard';
import { BankingPrepCard } from './src/components/BankingPrepCard';
import { PinnedShortcuts } from './src/components/PinnedShortcuts';
import { DiagnosticsModal } from './src/components/DiagnosticsModal';
import { IntentErrorModal } from './src/components/IntentErrorModal';
import { launchSettingsIntent } from './src/services/intentService';
import { getDeviceContext } from './src/services/deviceService';
import { StorageService } from './src/services/storageService';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SettingCategory>('all');
  const [pinnedIds, setPinnedIds] = useState<string[]>(['dev_options', 'accessibility_settings']);
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTarget, setErrorModalTarget] = useState<{ title: string; message?: string }>({
    title: '',
  });

  const deviceContext: DeviceContext = useMemo(() => getDeviceContext(), []);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    StorageService.getPreferences().then((prefs: UserPreferences) => {
      if (prefs.pinnedSettingIds) {
        setPinnedIds(prefs.pinnedSettingIds);
      }
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

  // Direct handlers for Banking Prep Card
  const handleOpenDevOptions = useCallback(() => {
    const devItem = SETTINGS_REGISTRY.find(i => i.id === 'dev_options');
    if (devItem) handleLaunchItem(devItem);
  }, [handleLaunchItem]);

  const handleOpenAccessibility = useCallback(() => {
    const accItem = SETTINGS_REGISTRY.find(i => i.id === 'accessibility_settings');
    if (accItem) handleLaunchItem(accItem);
  }, [handleLaunchItem]);

  // Filtered settings
  const filteredSettings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SETTINGS_REGISTRY.filter(item => {
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
  }, [searchQuery, selectedCategory]);

  // Pinned items
  const pinnedItems = useMemo(() => {
    return SETTINGS_REGISTRY.filter(i => pinnedIds.includes(i.id));
  }, [pinnedIds]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <FlatList
        data={filteredSettings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SettingActionCard
            item={item}
            isPinned={pinnedIds.includes(item.id)}
            onPress={() => handleLaunchItem(item)}
            onTogglePin={() => handleTogglePin(item.id)}
          />
        )}
        ListHeaderComponent={
          <>
            <Header
              deviceContext={deviceContext}
              onOpenDiagnostics={() => setDiagnosticsVisible(true)}
            />

            <BankingPrepCard
              onOpenDevOptions={handleOpenDevOptions}
              onOpenAccessibility={handleOpenAccessibility}
            />

            <PinnedShortcuts
              items={pinnedItems}
              onPressItem={handleLaunchItem}
              onUnpin={handleTogglePin}
            />

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />

            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all'
                  ? 'All Deep Settings'
                  : `${selectedCategory.toUpperCase()} SETTINGS`}
              </Text>
              <Text style={styles.sectionCount}>
                {filteredSettings.length} available
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching settings</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "usb", "overlay", "gpay", or switch categories.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
