import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../theme';
import KeyboardDoneBar, { KEYBOARD_DONE_BAR_ID } from '../ui/KeyboardDoneBar';
import { ActualAmountModalProps } from './types';

export default function ActualAmountModal({
  visible,
  amount,
  onAmountChange,
  onCancel,
  onSave,
}: ActualAmountModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Update Contribution</Text>
          <KeyboardDoneBar />
          <TextInput
            value={amount}
            onChangeText={onAmountChange}
            placeholder="Actual amount"
            keyboardType="numeric"
            inputAccessoryViewID={KEYBOARD_DONE_BAR_ID}
            style={styles.modalInput}
          />
          <View style={styles.modalActions}>
            <Pressable onPress={onCancel} style={styles.modalSecondaryButton}>
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} style={styles.modalPrimaryButton}>
              <Text style={styles.modalPrimaryButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(79, 46, 32, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.accentDeep,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalSecondaryButton: {
    backgroundColor: theme.accentSoft,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalSecondaryButtonText: {
    color: theme.text,
    fontWeight: '700',
  },
  modalPrimaryButton: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalPrimaryButtonText: {
    color: theme.textOnAccent,
    fontWeight: '700',
  },
});
