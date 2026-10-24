import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SettingCategory, SettingItem } from '../types';
import { PRESET_LIBRARY } from '../data/presetLibrary';
import { searchIntentDictionary, IntentSuggestion } from '../data/intentDictionary';
import { launchSettingsIntent } from '../services/intentService';
import { ScreenDetector, CapturedScreen } from '../services/screenDetectorService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddCustomSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCustomItem: (item: SettingItem) => void;
  existingIds: string[];
}

const CATEGORIES: { id: SettingCategory; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'developer', label: 'Developer' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'banking', label: 'Banking' },
];

const ACCENT_COLORS = ['#3A86FF', '#1DB954', '#FF8A00', '#9B51E0', '#E63946', '#2EC4B6'];

export const AddCustomSettingModal: React.FC<AddCustomSettingModalProps> = ({
  visible,
  onClose,
  onAddCustomItem,
  existingIds,
}) => {
  const [tab, setTab] = useState<'custom' | 'sniffer' | 'presets'>('custom');

  // Form states - simplified
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [action, setAction] = useState('android.settings.SETTINGS');
  const [packageName, setPackageName] = useState('');
  const [className, setClassName] = useState('');
  const [category, setCategory] = useState<SettingCategory>('system');
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [selectedIntentTitle, setSelectedIntentTitle] = useState('');

  // Sniffer states
  const [capturedScreen, setCapturedScreen] = useState<CapturedScreen | null>(null);
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);

  // Animations: Popup spring/fade and Keyboard upward shift
  const [popupAnim] = useState(() => new Animated.Value(0));
  const [keyboardShiftAnim] = useState(() => new Animated.Value(0));

  // Keyboard appearance listeners - smoothly move popup upward and downward
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      const kh = e.endCoordinates.height;
      Animated.timing(keyboardShiftAnim, {
        toValue: kh,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, e => {
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e ? e.duration : 200) : 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardShiftAnim]);

  // Modal open sequence: Popup springs into view directly with no background dimming
  useEffect(() => {
    if (visible) {
      popupAnim.setValue(0);
      keyboardShiftAnim.setValue(0);

      Animated.spring(popupAnim, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }).start();

      ScreenDetector.isServiceEnabled().then(enabled => {
        setIsServiceEnabled(enabled);
      });
      ScreenDetector.getLastCapturedScreen().then(screen => {
        if (screen) setCapturedScreen(screen);
      });
    } else {
      popupAnim.setValue(0);
      keyboardShiftAnim.setValue(0);
    }
  }, [visible, keyboardShiftAnim, popupAnim]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    const sub = ScreenDetector.subscribe(screen => {
      setCapturedScreen(screen);
    });
    return () => sub.remove();
  }, []);

  // Live Smart Intent Suggestions based on user's title input
  const suggestions = useMemo(() => {
    return searchIntentDictionary(title);
  }, [title]);

  // Readjust scrollable area height so popup is never blocked
  const scrollMaxHeight = useMemo(() => {
    return Math.min(480, SCREEN_HEIGHT - 220);
  }, []);

  const handleApplySuggestion = (s: IntentSuggestion) => {
    setTitle(s.title);
    setShortDescription(s.shortDescription);
    setAction(s.action);
    setCategory(s.category);
    setSelectedIntentTitle(s.title);
    if (s.packageName) setPackageName(s.packageName);
    if (s.className) setClassName(s.className);
  };

  const handleApplyCapturedScreen = () => {
    if (!capturedScreen) return;
    const cleanClassName = capturedScreen.className.split('.').pop() || 'Custom Screen';
    const cleanTitle = cleanClassName.replace(/([A-Z])/g, ' $1').trim();
    setTitle(cleanTitle);
    setShortDescription(`Direct shortcut to ${capturedScreen.packageName}`);
    setAction('android.intent.action.MAIN');
    setPackageName(capturedScreen.packageName);
    setClassName(capturedScreen.className);
    setSelectedIntentTitle(cleanTitle);
    setTab('custom');
  };

  const resetForm = () => {
    setTitle('');
    setShortDescription('');
    setAction('android.settings.SETTINGS');
    setPackageName('');
    setClassName('');
    setCategory('system');
    setAccentColor(ACCENT_COLORS[0]);
    setSelectedIntentTitle('');
    setCapturedScreen(null);
  };

  const handleTestIntent = async (testAction: string, pkg?: string, cls?: string) => {
    if (!testAction.trim() && !pkg?.trim()) {
      Alert.alert('Required', 'Please select or test an intent first.');
      return;
    }

    const result = await launchSettingsIntent({
      action: testAction.trim() || 'android.intent.action.MAIN',
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

  const handleSaveCustom = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a shortcut name.');
      return;
    }

    const newItem: SettingItem = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      shortDescription: shortDescription.trim() || 'Custom shortcut',
      category,
      icon: 'cog-outline',
      accentColor,
      isBankingCritical: category === 'banking',
      isCustom: true,
      createdAt: Date.now(),
      intent: {
        action: action.trim() || 'android.intent.action.MAIN',
        packageName: packageName.trim() || undefined,
        className: className.trim() || undefined,
        fallbackActions: ['android.settings.SETTINGS'],
      },
      keywords: [title.toLowerCase(), 'custom'],
    };

    onAddCustomItem(newItem);
    resetForm();
    handleClose();
  };

  const handleAddPreset = (preset: typeof PRESET_LIBRARY[0]) => {
    const newItem: SettingItem = {
      ...preset,
      id: `custom_preset_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddCustomItem(newItem);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // Controlled via custom Animated values for realistic motion
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Transparent tap-to-dismiss overlay without dimming */}
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            handleClose();
          }}
        >
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Responsive wrapper shifts popup upward & downward with keyboard */}
        <Animated.View
          style={[
            styles.popupWrapper,
            {
              marginBottom: keyboardShiftAnim,
            },
          ]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.popupCard,
              {
                opacity: popupAnim,
                transform: [
                  {
                    scale: popupAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                  {
                    translateY: popupAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add Shortcut</Text>
                <Text style={styles.modalSubtitle}>Auto-resolve intents or browse presets</Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 3-Tab Segmented Switcher */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, tab === 'custom' && styles.segmentBtnActive]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTab('custom');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={15}
                  color={tab === 'custom' ? Colors.textPrimary : Colors.textMuted}
                />
                <Text style={[styles.segmentText, tab === 'custom' && styles.segmentTextActive]}>
                  Smart Intent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, tab === 'sniffer' && styles.segmentBtnActive]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTab('sniffer');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="radar"
                  size={15}
                  color={tab === 'sniffer' ? Colors.textPrimary : Colors.textMuted}
                />
                <Text style={[styles.segmentText, tab === 'sniffer' && styles.segmentTextActive]}>
                  Screen Detect
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, tab === 'presets' && styles.segmentBtnActive]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTab('presets');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="view-grid-plus-outline"
                  size={15}
                  color={tab === 'presets' ? Colors.textPrimary : Colors.textMuted}
                />
                <Text style={[styles.segmentText, tab === 'presets' && styles.segmentTextActive]}>
                  Presets
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: Clean Smart Intent Creator */}
            {tab === 'custom' && (
              <ScrollView
                style={[styles.sheetScroll, { maxHeight: scrollMaxHeight }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <Text style={styles.fieldLabel}>Shortcut Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Volume, 5G, Battery, APN, Hotspot..."
                  placeholderTextColor={Colors.textMuted}
                  value={title}
                  onChangeText={text => {
                    setTitle(text);
                    if (selectedIntentTitle && text !== selectedIntentTitle) {
                      setSelectedIntentTitle('');
                    }
                  }}
                />

                {/* Suggestions with Test Now Button directly beside Apply */}
                {suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <View style={styles.suggestionHeaderRow}>
                      <MaterialCommunityIcons name="lightning-bolt" size={14} color={Colors.emerald} />
                      <Text style={styles.suggestionHeaderText}>Suggested Intents:</Text>
                    </View>

                    {suggestions.map((s, idx) => {
                      const isCurrentApplied = action === s.action;
                      return (
                        <View key={idx} style={[styles.suggestionCard, isCurrentApplied && styles.suggestionCardSelected]}>
                          <View style={styles.suggestionDetails}>
                            <Text style={styles.suggestionTitle}>{s.title}</Text>
                            <Text style={styles.suggestionDesc}>{s.shortDescription}</Text>
                          </View>

                          {/* Test Now & Apply action buttons */}
                          <View style={styles.inlineActionButtons}>
                            <TouchableOpacity
                              style={styles.inlineTestBtn}
                              onPress={() => handleTestIntent(s.action, s.packageName, s.className)}
                              activeOpacity={0.7}
                            >
                              <MaterialCommunityIcons name="play-circle-outline" size={14} color={Colors.emerald} />
                              <Text style={styles.inlineTestBtnText}>Test</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.inlineApplyBtn, isCurrentApplied && styles.inlineAppliedBtn]}
                              onPress={() => handleApplySuggestion(s)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.inlineApplyBtnText}>
                                {isCurrentApplied ? 'Applied ✓' : 'Apply'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Selected / Configured intent feedback chip */}
                {selectedIntentTitle.length > 0 && (
                  <View style={styles.selectedPillBadge}>
                    <MaterialCommunityIcons name="check-circle" size={14} color="#15803D" />
                    <Text style={styles.selectedPillText}>
                      Target: <Text style={styles.selectedPillBold}>{selectedIntentTitle}</Text>
                    </Text>
                  </View>
                )}

                {/* Category Picker */}
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.categoryPillsRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChoice,
                        category === cat.id && styles.categoryChoiceActive,
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryChoiceText,
                          category === cat.id && styles.categoryChoiceTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Accent Color Picker */}
                <Text style={styles.fieldLabel}>Accent Color</Text>
                <View style={styles.colorsRow}>
                  {ACCENT_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        accentColor === c && styles.colorCircleActive,
                      ]}
                      onPress={() => setAccentColor(c)}
                    />
                  ))}
                </View>

                {/* Save Shortcut Primary Button */}
                <TouchableOpacity
                  style={styles.formSaveButton}
                  onPress={handleSaveCustom}
                  activeOpacity={0.85}
                >
                  <Text style={styles.formSaveButtonText}>Save Shortcut</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Tab 2: Screen Detect */}
            {tab === 'sniffer' && (
              <ScrollView
                style={[styles.sheetScroll, { maxHeight: scrollMaxHeight }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <View style={styles.snifferGuideCard}>
                  <MaterialCommunityIcons name="radar" size={30} color={Colors.emerald} />
                  <Text style={styles.snifferGuideTitle}>Live Screen Detection</Text>
                  <Text style={styles.snifferGuideText}>
                    Navigate to any settings screen on your phone, then return to Redirect to automatically capture its exact package and activity class.
                  </Text>
                </View>

                {/* Service Status */}
                <View style={styles.statusBox}>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Detector Status:</Text>
                    <View style={[styles.statusPill, isServiceEnabled ? styles.statusPillOn : styles.statusPillOff]}>
                      <Text style={styles.statusPillText}>{isServiceEnabled ? 'READY' : 'SETUP REQUIRED'}</Text>
                    </View>
                  </View>

                  {!isServiceEnabled && (
                    <TouchableOpacity
                      style={styles.enableServiceBtn}
                      onPress={() => launchSettingsIntent({ action: 'android.settings.ACCESSIBILITY_SETTINGS' })}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="shield-lock-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.enableServiceBtnText}>Enable &quot;Redirect Screen Detector&quot; in Accessibility</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Live Captured Screen Box */}
                {capturedScreen ? (
                  <View style={styles.capturedResultCard}>
                    <View style={styles.capturedHeaderRow}>
                      <MaterialCommunityIcons name="check-decagram" size={18} color={Colors.emerald} />
                      <Text style={styles.capturedHeaderTitle}>Target Screen Detected!</Text>
                    </View>

                    <View style={styles.resultField}>
                      <Text style={styles.resultLabel}>Package:</Text>
                      <Text style={styles.resultValue}>{capturedScreen.packageName}</Text>
                    </View>

                    <View style={styles.resultField}>
                      <Text style={styles.resultLabel}>Activity Class:</Text>
                      <Text style={styles.resultValue}>{capturedScreen.className}</Text>
                    </View>

                    <View style={styles.capturedActionsRow}>
                      <TouchableOpacity
                        style={styles.testCapturedBtn}
                        onPress={() => handleTestIntent('android.intent.action.MAIN', capturedScreen.packageName, capturedScreen.className)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.testCapturedBtnText}>Test Screen</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.applyCapturedBtn}
                        onPress={handleApplyCapturedScreen}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.applyCapturedBtnText}>Use This Shortcut</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.waitingCard}>
                    <MaterialCommunityIcons name="cellphone-sound" size={28} color={Colors.textMuted} />
                    <Text style={styles.waitingText}>
                      Navigate to any settings page right now, then return here.
                    </Text>
                    <TouchableOpacity
                      style={styles.refreshBtn}
                      onPress={async () => {
                        const screen = await ScreenDetector.getLastCapturedScreen();
                        if (screen) setCapturedScreen(screen);
                        else Alert.alert('Listening...', 'No external settings screen detected yet. Open your Settings app first.');
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="refresh" size={16} color={Colors.textPrimary} />
                      <Text style={styles.refreshBtnText}>Check Latest Screen</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Tab 3: Presets Library */}
            {tab === 'presets' && (
              <ScrollView
                style={[styles.sheetScroll, { maxHeight: scrollMaxHeight }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 36 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <Text style={styles.sectionSubtitle}>
                  Add hidden system settings with verified intent paths:
                </Text>

                {PRESET_LIBRARY.map((preset, index) => (
                  <View key={index} style={styles.presetRow}>
                    <View style={[styles.presetIcon, { backgroundColor: `${preset.accentColor}18` }]}>
                      <MaterialCommunityIcons
                        name={preset.icon as any}
                        size={20}
                        color={preset.accentColor}
                      />
                    </View>

                    <View style={styles.presetDetails}>
                      <Text style={styles.presetTitle}>{preset.title}</Text>
                      <Text style={styles.presetDesc} numberOfLines={1}>
                        {preset.shortDescription}
                      </Text>
                    </View>

                    <View style={styles.presetActions}>
                      <TouchableOpacity
                        style={styles.testBtn}
                        onPress={() => handleTestIntent(preset.intent.action)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.testBtnText}>Test</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddPreset(preset)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  popupCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 4, // Sharp corners matching Bento grid theme
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
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 2,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sheetScroll: {
    maxHeight: 460,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(235, 243, 255, 0.7)',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.25)',
  },
  suggestionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  suggestionHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.2)',
  },
  suggestionCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F7FF',
  },
  suggestionDetails: {
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  suggestionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  inlineActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  inlineTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
    backgroundColor: Colors.emeraldLight,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.25)',
  },
  inlineTestBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  inlineApplyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  inlineAppliedBtn: {
    backgroundColor: '#15803D',
  },
  inlineApplyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(235, 248, 240, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.3)',
    marginTop: 6,
  },
  selectedPillText: {
    fontSize: 12,
    color: '#15803D',
  },
  selectedPillBold: {
    fontWeight: '800',
    color: '#15803D',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChoice: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryChoiceActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  categoryChoiceText: {
    fontSize: 12,
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
    marginTop: 4,
    marginBottom: 16,
  },
  colorCircle: {
    width: 26,
    height: 26,
    borderRadius: 4,
  },
  colorCircleActive: {
    borderWidth: 2.5,
    borderColor: Colors.textPrimary,
  },
  formSaveButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 13,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  formSaveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  snifferGuideCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  snifferGuideTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  snifferGuideText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  statusBox: {
    backgroundColor: Colors.glassCard,
    borderRadius: 4,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  statusPillOn: {
    backgroundColor: Colors.emeraldLight,
  },
  statusPillOff: {
    backgroundColor: Colors.orangeLight,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  enableServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 10,
    borderRadius: 2,
    marginTop: 10,
  },
  enableServiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  capturedResultCard: {
    backgroundColor: 'rgba(235, 248, 240, 0.85)',
    borderRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.emerald,
    marginBottom: 14,
  },
  capturedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  capturedHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  resultField: {
    marginBottom: 6,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  capturedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  testCapturedBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 2,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  testCapturedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  applyCapturedBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 2,
    backgroundColor: Colors.emerald,
  },
  applyCapturedBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  waitingCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  waitingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 10,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.glassShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  presetIcon: {
    width: 38,
    height: 38,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  presetDetails: {
    flex: 1,
    marginRight: 8,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  presetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 2,
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
