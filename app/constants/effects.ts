import { colors, glossyEffect } from './colors';
import { StyleSheet } from 'react-native';

export const buttonEffects = StyleSheet.create({
  // Base button styles
  button: {
    ...glossyEffect,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Primary button variations
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary + '80',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  // Secondary button variations
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary + '80',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  // Error/Danger button variations
  errorButton: {
    backgroundColor: colors.error,
    borderColor: colors.error + '80',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  // Success button variations
  successButton: {
    backgroundColor: colors.success,
    borderColor: colors.success + '80',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  // Pressed state effects
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Text styles
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Icon styles
  buttonIcon: {
    marginRight: 8,
  },

  // Small button variation
  smallButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Disabled state
  buttonDisabled: {
    opacity: 0.5,
  },
});

// Ripple effect config for Android
export const rippleConfig = {
  color: colors.primary + '40',
  borderless: false,
  foreground: true,
}; 