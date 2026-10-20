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
