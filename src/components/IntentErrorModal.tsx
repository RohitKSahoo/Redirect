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
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={Colors.orange} />
          </View>

          <Text style={styles.modalTitle}>OEM Custom Screen</Text>
          <Text style={styles.modalBody}>
            Your device&apos;s custom skin (One UI / MIUI / ColorOS) may have moved &quot;{title}&quot; to a proprietary location.
          </Text>

          {errorMessage && (
            <View style={styles.errorLog}>
              <Text style={styles.errorLogText}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onOpenRootSettings}
            activeOpacity={0.85}
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: Colors.surfaceShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
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
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 18,
  },
  errorLogText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
