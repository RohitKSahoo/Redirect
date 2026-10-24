import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { DeviceContext } from '../types';

interface DiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
  deviceContext: DeviceContext;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  visible,
  onClose,
  deviceContext,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.notchBar} />

          <View style={styles.modalHeader}>
            <View style={styles.iconTitleRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="information" size={20} color={Colors.emerald} />
              </View>
              <Text style={styles.modalTitle}>Device Info</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            OEM detection ensures your device&apos;s customized settings paths are properly resolved.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Manufacturer</Text>
              <Text style={styles.infoValue}>{deviceContext.brand}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Model</Text>
              <Text style={styles.infoValue}>{deviceContext.modelName}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Android Version</Text>
              <Text style={styles.infoValue}>Android {deviceContext.osVersion}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API Level</Text>
              <Text style={styles.infoValue}>API {deviceContext.apiLevel}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    width: '100%',
    paddingBottom: 40,
    shadowColor: Colors.surfaceShadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
  },
  notchBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceBorder,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 18,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  closeButton: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
