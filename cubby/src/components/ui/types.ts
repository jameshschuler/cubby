import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type PickerOption = {
  label: string;
  value: string;
};

export interface OptionPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: readonly PickerOption[];
  monthOptions?: readonly PickerOption[];
  dayOptions?: readonly PickerOption[];
  mode?: 'single' | 'month-day';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  placeholder?: string;
}
