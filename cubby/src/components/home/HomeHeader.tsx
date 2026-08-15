import appIcon from '../../../assets/icon.png';
import { SlidersHorizontal } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../core/theme';
import { HomeHeaderProps } from './types';

export default function HomeHeader({ subtitle, onLogoPress, onSettingsPress }: HomeHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View>
        <View style={styles.titleRow}>
          <Pressable
            onPress={onLogoPress}
            accessibilityRole="button"
            accessibilityLabel="App logo"
            hitSlop={8}
          >
            <Image source={appIcon} style={styles.logo} />
          </Pressable>
          <Text style={styles.title}>Cubby</Text>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {onSettingsPress ? (
        <Pressable
          onPress={onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={8}
          style={styles.settingsButton}
        >
          <SlidersHorizontal color={theme.accentDeep} size={20} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.accentDeep,
  },
  subtitle: {
    marginTop: 4,
    color: theme.accent,
    fontSize: 14,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
