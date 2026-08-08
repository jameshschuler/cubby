import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../core/theme';
import { OptionPickerProps } from './types';

export default function OptionPicker({
  value,
  onValueChange,
  options,
  monthOptions,
  dayOptions,
  mode = 'single',
  style,
  textStyle,
  placeholder = 'Select an option',
}: OptionPickerProps) {
  const [visible, setVisible] = useState(false);
  const [draftMonth, setDraftMonth] = useState(() => {
    if (mode !== 'month-day') {
      return '01';
    }

    const [monthPart = '01'] = value.split('-');
    return monthPart;
  });
  const [draftDay, setDraftDay] = useState(() => {
    if (mode !== 'month-day') {
      return '01';
    }

    const [, dayPart = '01'] = value.split('-');
    return dayPart;
  });
  const selectedOption = options?.find((option) => option.value === value) ?? options?.[0];
  const selectedMonthOption = monthOptions?.find((option) => option.value === draftMonth);
  const selectedDayOption = dayOptions?.find((option) => option.value === draftDay);

  const displayValue =
    mode === 'month-day'
      ? `${selectedMonthOption?.label ?? placeholder} ${selectedDayOption?.label ?? ''}`.trim()
      : (selectedOption?.label ?? placeholder);

  const openModal = () => {
    if (mode === 'month-day') {
      const [monthPart = '01', dayPart = '01'] = value.split('-');
      setDraftMonth(monthPart);
      setDraftDay(dayPart);
    }

    setVisible(true);
  };

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setVisible(false);
  };

  return (
    <>
      <Pressable style={style} onPress={openModal}>
        <Text style={textStyle}>{displayValue}</Text>
      </Pressable>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {mode === 'month-day' ? 'Pick month and day' : 'Select an option'}
            </Text>
            {mode === 'month-day' ? (
              <View style={styles.dualPickerRow}>
                <View style={styles.dualPickerColumn}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <Picker
                    selectedValue={draftMonth}
                    onValueChange={(nextValue) => setDraftMonth(String(nextValue))}
                    style={styles.nativePicker}
                    itemStyle={styles.pickerItem}
                  >
                    {monthOptions?.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.dualPickerColumn}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <Picker
                    selectedValue={draftDay}
                    onValueChange={(nextValue) => setDraftDay(String(nextValue))}
                    style={styles.nativePicker}
                    itemStyle={styles.pickerItem}
                  >
                    {dayOptions?.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            ) : (
              <Picker
                selectedValue={value}
                onValueChange={(nextValue) => handleSelect(String(nextValue))}
                style={styles.nativePicker}
                itemStyle={styles.pickerItem}
              >
                {options?.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            )}
            <View style={styles.actionsRow}>
              <Pressable style={styles.cancelButton} onPress={() => setVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.doneButton}
                onPress={() => {
                  if (mode === 'month-day') {
                    handleSelect(`${draftMonth}-${draftDay}`);
                    return;
                  }

                  setVisible(false);
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(79, 46, 32, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
    maxHeight: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  dualPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  dualPickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  nativePicker: {
    height: 170,
    color: theme.text,
  },
  pickerItem: {
    fontSize: 15,
    height: 160,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.backgroundAlt,
  },
  cancelButtonText: {
    color: theme.text,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.accent,
  },
  doneButtonText: {
    color: theme.textOnAccent,
    fontWeight: '600',
  },
});
