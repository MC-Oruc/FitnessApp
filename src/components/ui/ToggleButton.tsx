import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useThemedStyles } from '../../theme/styles';

type Position = 'left' | 'middle' | 'right';

type ToggleButtonProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  position?: Position;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function ToggleButton({
  label,
  active = false,
  onPress,
  position,
  style,
  textStyle,
}: ToggleButtonProps) {
  const themeStyles = useThemedStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        themeStyles.segmented,
        position === 'left' && themeStyles.segmentedLeft,
        position === 'middle' && themeStyles.segmentedMiddle,
        position === 'right' && themeStyles.segmentedRight,
        style,
        active && themeStyles.segmentedActive,
        pressed && themeStyles.pressed,
      ]}
    >
      <Text
        style={[
          themeStyles.segmentedText,
          textStyle,
          active && themeStyles.segmentedTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
