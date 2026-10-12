import React, { createContext, useContext } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { Colors } from "../constants/Colors";

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

  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1000;
  const isDesktop = width >= 1000;

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
