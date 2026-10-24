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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  deviceContext,
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
          <View style={styles.titleGroup}>
            <Text style={styles.headerTitle}>Settings & Diagnostics</Text>
            <Text style={styles.headerSubtitle}>Redirect System Framework • v1.0.0</Text>
          </View>
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

          {/* SECTION 2: APP PERMISSIONS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="shield-key-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.sectionTitle}>APP PERMISSIONS & CAPABILITIES</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Overview of Android system capabilities active or utilized in Redirect:
            </Text>

            <View style={styles.card}>
              {/* Permission 1 */}
              <View style={styles.permItem}>
                <View style={[styles.permIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialCommunityIcons name="view-dashboard-outline" size={18} color={Colors.emerald} />
                </View>
                <View style={styles.permContent}>
                  <View style={styles.permTopRow}>
                    <Text style={styles.permName}>Quick Settings Tile Service</Text>
                    <View style={[styles.permBadge, { backgroundColor: '#ECFDF5' }]}>
                      <Text style={[styles.permBadgeText, { color: '#047857' }]}>ACTIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    Controls 3 dynamic quick settings tiles in your notification pulldown shade with live icons.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Permission 2 */}
              <View style={styles.permItem}>
                <View style={[styles.permIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="home-plus-outline" size={18} color="#2563EB" />
                </View>
                <View style={styles.permContent}>
                  <View style={styles.permTopRow}>
                    <Text style={styles.permName}>Home Screen Pinning</Text>
                    <View style={[styles.permBadge, { backgroundColor: '#EFF6FF' }]}>
                      <Text style={[styles.permBadgeText, { color: '#1D4ED8' }]}>SUPPORTED</Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    Pins 1-tap direct launcher shortcuts onto your phone&apos;s home screen.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Permission 3 */}
              <View style={styles.permItem}>
                <View style={[styles.permIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <MaterialCommunityIcons name="swap-horizontal-bold" size={18} color="#7C3AED" />
                </View>
                <View style={styles.permContent}>
                  <View style={styles.permTopRow}>
                    <Text style={styles.permName}>OEM Intent Trampoline</Text>
                    <View style={[styles.permBadge, { backgroundColor: '#FAF5FF' }]}>
                      <Text style={[styles.permBadgeText, { color: '#6D28D9' }]}>NATIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    Launches deep settings activities directly without crashes or redirect blocks.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Permission 4 */}
              <View style={styles.permItem}>
                <View style={[styles.permIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <MaterialCommunityIcons name="human" size={18} color="#D97706" />
                </View>
                <View style={styles.permContent}>
                  <View style={styles.permTopRow}>
                    <Text style={styles.permName}>Accessibility Framework</Text>
                    <View style={[styles.permBadge, { backgroundColor: '#FFFBEB' }]}>
                      <Text style={[styles.permBadgeText, { color: '#B45309' }]}>OPTIONAL</Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    Underlying engine registered for intelligent screen monitoring and automation.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Permission 5 */}
              <View style={styles.permItem}>
                <View style={[styles.permIconBox, { backgroundColor: '#F1F5F9' }]}>
                  <MaterialCommunityIcons name="bell-badge-outline" size={18} color="#475569" />
                </View>
                <View style={styles.permContent}>
                  <View style={styles.permTopRow}>
                    <Text style={styles.permName}>Post Notifications</Text>
                    <View style={[styles.permBadge, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={[styles.permBadgeText, { color: '#334155' }]}>STANDARD</Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    Allows notification panel alerts when widget states or tiles are synchronized.
                  </Text>
                </View>
              </View>
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
                  <MaterialCommunityIcons name="radar" size={24} color={Colors.textPrimary} />
                </View>
                <View style={styles.upcomingContent}>
                  <View style={styles.upcomingTopRow}>
                    <Text style={styles.upcomingTitle}>Live Screen Detect</Text>
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
                    </View>
                  </View>
                  <Text style={styles.upcomingDesc}>
                    Real-time screen detector that senses when banking, UPI, or enterprise apps trigger security warnings and provides an instant 1-tap floating redirect to toggle developer/root settings.
                  </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
  },
  titleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
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
    paddingTop: 14,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  sectionDescription: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
    fontWeight: '500',
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
  permItem: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'flex-start',
    gap: 10,
  },
  permIconBox: {
    width: 32,
    height: 32,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  permContent: {
    flex: 1,
  },
  permTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  permName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  permBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 2,
  },
  permBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  permDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    fontWeight: '500',
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  upcomingIconBox: {
    width: 40,
    height: 40,
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
  upcomingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  upcomingTitle: {
    fontSize: 14,
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
  upcomingDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
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
