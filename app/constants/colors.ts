// Chromatic theme color palette
export const colors = {
  // Base colors with vibrant chromatic scheme
  primary: '#00ffff', // Cyan
  secondary: '#ff00ff', // Magenta
  success: '#00ff00', // Neon Green
  error: '#ff0055', // Hot Pink
  warning: '#ffaa00', // Bright Orange

  // Background and surface colors (keeping dark for contrast)
  background: '#0a0a0f', // Very dark blue-black
  card: '#16161f', // Dark blue-gray
  border: '#2a2a35', // Medium blue-gray

  // Text colors
  text: '#ffffff', // Pure white
  textSecondary: '#c4c4ff', // Light purple-white
  textTertiary: '#8080aa', // Muted purple-gray

  // Interactive elements
  highlight: '#00ffff', // Cyan
  accent: '#ff00ff', // Magenta
  shadow: '#000000',

  // Status indicators
  active: '#00ffff', // Cyan
  inactive: '#404055', // Muted blue-gray
  
  // Gradients (for glossy effects)
  gradientStart: '#16161f',
  gradientEnd: '#0a0a0f',
};

// Enhanced glossy effect for chromatic theme
export const glossyEffect = {
  backgroundColor: colors.card,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 8,
};

export const glassEffect = {
  backgroundColor: colors.card + 'CC', // 80% opacity
  backdropFilter: 'blur(10px)',
  borderColor: colors.border + '40', // 25% opacity
}; 