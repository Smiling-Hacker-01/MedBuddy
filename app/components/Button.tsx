import React from 'react';
import { 
  Pressable, 
  Text, 
  View, 
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { buttonEffects, rippleConfig } from '../constants/effects';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'error' | 'success';
  size?: 'normal' | 'small';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'normal',
  icon,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return buttonEffects.secondaryButton;
      case 'error':
        return buttonEffects.errorButton;
      case 'success':
        return buttonEffects.successButton;
      default:
        return buttonEffects.primaryButton;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        buttonEffects.button,
        getVariantStyle(),
        size === 'small' && buttonEffects.smallButton,
        disabled && buttonEffects.buttonDisabled,
        pressed && buttonEffects.buttonPressed,
        style,
      ]}
      android_ripple={rippleConfig}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && (
          <Ionicons
            name={icon}
            size={size === 'small' ? 16 : 20}
            color="white"
            style={buttonEffects.buttonIcon}
          />
        )}
        <Text style={[buttonEffects.buttonText, textStyle]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
} 