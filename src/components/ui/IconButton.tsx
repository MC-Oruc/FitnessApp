import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useThemedStyles } from '../../theme/styles';

type IconButtonProps = {
  icon: string;
  active?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<TextStyle>;
};

export default function IconButton({
  icon,
  active = false,
  onPress,
  style,
  iconStyle,
}: IconButtonProps) {
  const themeStyles = useThemedStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        themeStyles.iconButton,
        style,
        active && themeStyles.iconButtonActive,
        pressed && themeStyles.pressed,
      ]}
    >
      <Text
        style={[
          themeStyles.iconButtonIcon,
          iconStyle,
          active && themeStyles.iconButtonIconActive,
        ]}
      >
        {icon}
      </Text>
    </Pressable>
  );
}
