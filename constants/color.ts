export const Colors = {
  light: {
    // Orange Theme
    primary: "#FF6B35",
    primaryLight: "#FF8C61",
    primaryDark: "#E6522D",
    secondary: "#FFA500",
    accent: "#FF4500",

    // Backgrounds
    background: "#FFFFFF",
    backgroundSecondary: "#F8F9FA",
    card: "#FFFFFF",
    cardElevated: "#FFFFFF",

    // Text
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",

    // Borders
    border: "#E5E7EB",
    borderLight: "#F3F4F6",

    // Status Colors
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    infoLight: "#DBEAFE",

    // Gradient
    gradientStart: "#FF6B35",
    gradientEnd: "#FFA500",

    // Shadow
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowDark: "rgba(0, 0, 0, 0.2)",
  },

  dark: {
    // Orange Theme
    primary: "#FF8C61",
    primaryLight: "#FFB794",
    primaryDark: "#FF6B35",
    secondary: "#FFB84D",
    accent: "#FF6347",

    // Backgrounds
    background: "#0F0F0F",
    backgroundSecondary: "#1A1A1A",
    card: "#1E1E1E",
    cardElevated: "#252525",

    // Text
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    textTertiary: "#718096",

    // Borders
    border: "#2D3748",
    borderLight: "#374151",

    // Status Colors
    success: "#34D399",
    successLight: "#064E3B",
    warning: "#FBBF24",
    warningLight: "#78350F",
    error: "#F87171",
    errorLight: "#7F1D1D",
    info: "#60A5FA",
    infoLight: "#1E3A8A",

    // Gradient
    gradientStart: "#FF8C61",
    gradientEnd: "#FFB84D",

    // Shadow
    shadow: "rgba(0, 0, 0, 0.4)",
    shadowDark: "rgba(0, 0, 0, 0.6)",
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorKey = keyof typeof Colors.light;
