import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useThemedStyles } from '../../theme/styles';

type PillProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function Pill({
  label,
  active = false,
  onPress,
  style,
  textStyle,
}: PillProps) {
  const themeStyles = useThemedStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        themeStyles.pill,
        style,
        active && themeStyles.pillActive,
        pressed && themeStyles.pressed,
      ]}
    >
      <Text
        style={[
          themeStyles.pillText,
          textStyle,
          active && themeStyles.pillTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
