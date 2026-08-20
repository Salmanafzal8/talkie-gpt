import { StyleSheet, Text, type TextProps } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
  defaultSemiBold: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
    fontWeight: '600',
  },
  title: {
    fontSize: RFValue(32),
    fontWeight: 'bold',
    lineHeight: RFValue(32),
  },
  subtitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
  },
  link: {
    lineHeight: RFValue(30),
    fontSize: RFValue(16),
    color: '#0a7ea4',
  },
});
