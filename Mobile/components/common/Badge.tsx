import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = '#818CF8',
  backgroundColor = 'rgba(99, 102, 241, 0.15)',
  size = 'md',
  style,
}) => {
  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, size === 'sm' ? styles.smText : styles.mdText, { color }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  smText: {
    fontSize: 11,
  },
  mdText: {
    fontSize: 12,
  },
});
