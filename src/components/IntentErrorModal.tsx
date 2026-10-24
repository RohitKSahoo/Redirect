import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface IntentErrorModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  errorMessage?: string;
  onOpenRootSettings: () => void;
}

export const IntentErrorModal: React.FC<IntentErrorModalProps> = ({
  visible,
  onClose,
  title,
  errorMessage,
  onOpenRootSettings,
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
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={Colors.warning} />
          </View>

          <Text style={styles.modalTitle}>OEM Custom Screen</Text>
          <Text style={styles.modalBody}>
            Your device's custom skin (One UI / MIUI / ColorOS) may have moved "{title}" to a proprietary location.
          </Text>

          {errorMessage && (
            <View style={styles.errorLog}>
              <Text style={styles.errorLogText}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onOpenRootSettings}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cog" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Open Main Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.warningGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  errorLog: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  errorLogText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
