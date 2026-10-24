import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { DeviceContext } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  deviceContext: DeviceContext;
  onOpenTilesModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  deviceContext,
  onOpenTilesModal,
}) => {
  const topInset = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) + 8 : 44;

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

          {/* SECTION 2: QUICK SETTINGS TILES */}
          {onOpenTilesModal && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="view-dashboard-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.sectionTitle}>QUICK SETTINGS TILES</Text>
              </View>

              <TouchableOpacity
                style={[styles.card, styles.interactiveCard]}
                onPress={onOpenTilesModal}
                activeOpacity={0.75}
              >
                <View style={styles.tileSettingRow}>
                  <View style={styles.tileSettingIconBox}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={Colors.textPrimary} />
                  </View>
                  <View style={styles.tileSettingTextGroup}>
                    <Text style={styles.tileSettingTitle}>Configure Quick Settings Tiles</Text>
                    <Text style={styles.tileSettingSubtitle}>
                      Assign up to 3 custom shortcuts to your notification pulldown shade
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
            </View>
          )}

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

          {/* SECTION 3: DEVELOPER & GITHUB PROFILE */}
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    borderRadius: 4, // Sharp corners
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
    borderRadius: 4, // Sharp corners
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 4,
  },
  pillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  pillBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  upcomingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
  interactiveCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tileSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tileSettingIconBox: {
    width: 40,
    height: 40,
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
    lineHeight: 15,
  },
});
