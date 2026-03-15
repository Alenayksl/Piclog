import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab({ children, onPress, onPressIn, ...props }: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...props}
      onPress={onPress}
      onPressIn={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressIn?.(e);
      }}>
      {children}
    </Pressable>
  );
}
