// const tintColorLight = "#FF0B55";  // Main accent
// const tintColorDark = "#CF0F47";   // Slightly muted version for dark theme
// const primary = "#FF0B55";         // Main brand color
// const secondary = "#28282B";       // Black as secondary

// export const Colors = {
//   light: {
//     text: "#28282B",         // Primary text color
//     background: "#FFDEDE",   // Soft pink background
//     tint: tintColorLight,    // Accent color
//     icon: "#CF0F47",         // Muted red for icons
//     tabIconDefault: "#CF0F47",
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: "#FFDEDE",         // Light pink text for contrast
//     background: "#28282B",   // Black background
//     tint: tintColorDark,     // Accent for dark theme
//     icon: "#FF0B55",         // Bright icon color
//     tabIconDefault: "#CF0F47",
//     tabIconSelected: tintColorDark,
//   },
//   PRIMARY: primary,
//   SECONDARY: secondary,
// };

const tintColorLight = "#DC2626"; // Emergency red
const tintColorDark = "#EF4444";  // Lighter red for dark theme

const primary = "#DC2626";     // Emergency red
const secondary = "#1F2937";   // Dark gray
const accent = "#F59E0B";      // Warning amber
const success = "#10B981";     // Success green
const warning = "#F59E0B";     // Warning amber
const danger = "#EF4444";      // Danger red
const info = "#3B82F6";        // Info blue

export const Colors = {
  light: {
    // Background colors
    background: "#FFFFFF",           // Pure white
    backgroundSecondary: "#F9FAFB",  // Light gray
    backgroundTertiary: "#F3F4F6",   // Slightly darker gray
    
    // Text colors
    text: "#111827",                 // Almost black
    textSecondary: "#6B7280",        // Medium gray
    textLight: "#9CA3AF",            // Light gray
    textWhite: "#FFFFFF",            // Pure white
    
    // UI Elements
    tint: tintColorLight,
    tintSecondary: "#DC2626",
    
    // Status colors
    primary: primary,
    secondary: secondary,
    accent: accent,
    success: success,
    warning: warning,
    danger: danger,
    info: info,
    
    // SOS specific colors
    sosButton: "#DC2626",            // Main SOS button
    sosButtonShadow: "rgba(220, 38, 38, 0.3)",
    sosButtonPressed: "#B91C1C",     // Darker red when pressed
    
    // Card and surface colors
    cardBackground: "#FFFFFF",
    cardShadow: "rgba(0, 0, 0, 0.1)",
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    
    // Gradient colors
    gradientStart: "#DC2626",
    gradientEnd: "#B91C1C",
    
    // Tab colors
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#DC2626",
    
    // Emergency states
    emergencyActive: "#EF4444",
    emergencyInactive: "#FCA5A5",
    
    // Status bar
    statusBar: "dark-content",
  },
  
  dark: {
    // Background colors
    background: "#111827",           // Very dark gray
    backgroundSecondary: "#1F2937",  // Dark gray
    backgroundTertiary: "#374151",   // Medium dark gray
    
    // Text colors
    text: "#F9FAFB",                 // Almost white
    textSecondary: "#D1D5DB",        // Light gray
    textLight: "#9CA3AF",            // Medium gray
    textWhite: "#FFFFFF",            // Pure white
    
    // UI Elements
    tint: tintColorDark,
    tintSecondary: "#EF4444",
    
    // Status colors
    primary: "#EF4444",
    secondary: "#F3F4F6",
    accent: accent,
    success: success,
    warning: warning,
    danger: danger,
    info: info,
    
    // SOS specific colors
    sosButton: "#EF4444",            // Main SOS button
    sosButtonShadow: "rgba(239, 68, 68, 0.4)",
    sosButtonPressed: "#DC2626",     // Darker red when pressed
    
    // Card and surface colors
    cardBackground: "#1F2937",
    cardShadow: "rgba(0, 0, 0, 0.3)",
    border: "#374151",
    borderLight: "#4B5563",
    
    // Gradient colors
    gradientStart: "#EF4444",
    gradientEnd: "#DC2626",
    
    // Tab colors
    tabIconDefault: "#6B7280",
    tabIconSelected: "#EF4444",
    
    // Emergency states
    emergencyActive: "#EF4444",
    emergencyInactive: "#7F1D1D",
    
    // Status bar
    statusBar: "light-content",
  },
  
  // Additional utility colors
  PRIMARY: primary,
  SECONDARY: secondary,
  ACCENT: accent,
  SUCCESS: success,
  WARNING: warning,
  DANGER: danger,
  INFO: info,
  
  // Semantic colors
  EMERGENCY: "#DC2626",
  SAFE: "#10B981",
  WARNING: "#F59E0B",
  CRITICAL: "#7C2D12",
};