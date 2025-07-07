const tintColorLight = "#FF0B55";  // Main accent
const tintColorDark = "#CF0F47";   // Slightly muted version for dark theme
const primary = "#FF0B55";         // Main brand color
const secondary = "#000000";       // Black as secondary

export const Colors = {
  light: {
    text: "#000000",         // Primary text color
    background: "#FFDEDE",   // Soft pink background
    tint: tintColorLight,    // Accent color
    icon: "#CF0F47",         // Muted red for icons
    tabIconDefault: "#CF0F47",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#FFDEDE",         // Light pink text for contrast
    background: "#000000",   // Black background
    tint: tintColorDark,     // Accent for dark theme
    icon: "#FF0B55",         // Bright icon color
    tabIconDefault: "#CF0F47",
    tabIconSelected: tintColorDark,
  },
  PRIMARY: primary,
  SECONDARY: secondary,
};
