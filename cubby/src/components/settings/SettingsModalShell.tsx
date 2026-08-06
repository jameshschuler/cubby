import { X } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import KeyboardDoneBar from '../ui/KeyboardDoneBar';
import { theme } from '../../theme';

interface SettingsModalShellProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function SettingsModalShell({
  visible,
  title,
  onClose,
  children,
}: SettingsModalShellProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <KeyboardDoneBar />
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable
            onPress={onClose}
            style={styles.modalCancel}
            accessibilityRole="button"
            accessibilityLabel={`Close ${title.toLowerCase()} settings`}
            hitSlop={10}
          >
            <X color={theme.textMuted} size={20} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>{children}</ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  modalCancel: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },
});
