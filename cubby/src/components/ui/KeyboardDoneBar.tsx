import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../../theme';
import { KEYBOARD_DONE_BAR_ID } from './constants';

export { KEYBOARD_DONE_BAR_ID } from './constants';

export default function KeyboardDoneBar() {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_BAR_ID}>
      <View style={styles.bar}>
        <Pressable onPress={() => Keyboard.dismiss()} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: theme.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  doneText: {
    color: theme.accent,
    fontWeight: '700',
    fontSize: 15,
  },
});
