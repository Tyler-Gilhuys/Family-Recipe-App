import React, { createContext, useContext } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { Colors } from "../constants/Colors";
import { BREAKPOINTS, HEADER_COMPACT_WIDTH } from "../constants/layout";

const AppContext = createContext(null);

export const useAppTheme = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside ThemedViews");
  }

  return context;
};

const ThemedViews = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { width, height, scale, fontScale } = useWindowDimensions();

  const isPhone = width < BREAKPOINTS.phone;
  const isTablet = width >= BREAKPOINTS.phone && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;
  const isCompact = width < HEADER_COMPACT_WIDTH;

  const isDark = colorScheme === "dark";
  const card = {
    background: isDark ? "#2A2620" : "#F7F4EC",
    border: isDark ? "#3A352C" : "#D9D1B9",
    text: isDark ? "#F3EEE2" : "#2B2420",
    muted: isDark ? "#A79E8C" : "#6B6152",
    accent: isDark ? "#8FAE89" : Colors.primary,
    danger: isDark ? "#D98571" : Colors.warning,
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        colorScheme,
        width,
        height,
        scale,
        fontScale,
        isPhone,
        isTablet,
        isDesktop,
        isCompact,
        card,
      }}
    >
      <View
        {...props}
        style={{
          flex: 1,
          backgroundColor: theme.background,
          ...(style ? StyleSheet.flatten(style) : {}),
        }}
      />
    </AppContext.Provider>
  );
};

export default ThemedViews;
