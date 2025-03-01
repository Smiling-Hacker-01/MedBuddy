import React from 'react';
import { 
  Pressable, 
  View, 
  StyleProp, 
  ViewStyle,
  Platform,
} from 'react-native';
import { buttonEffects, rippleConfig } from '../constants/effects';

interface PressableCardProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PressableCard({ onPress, children, style }: PressableCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed && buttonEffects.buttonPressed,
        style,
      ]}
      android_ripple={rippleConfig}
    >
      <View>
        {children}
      </View>
    </Pressable>
  );
} 