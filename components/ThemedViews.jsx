import { View, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

const ThemedViews = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View
      style={[{ backgroundColor: theme.background, flex: 1 }, style]}
      {...props}
    />
  );
};

export default ThemedViews;
