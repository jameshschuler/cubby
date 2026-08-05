import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
    backgroundColor: 'rgba(8, 47, 73, 0.45)',
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
    color: '#082f49',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
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
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalSecondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  modalPrimaryButton: {
    backgroundColor: '#0369a1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
