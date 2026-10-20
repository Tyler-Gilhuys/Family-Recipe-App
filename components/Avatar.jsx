import { Text, View } from "react-native";
import { Colors } from "../constants/Colors";

export default function Avatar({ user, size = 58, style }) {
    const initial = (user?.name || user?.email || "?")
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: Colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
        >
            <Text
                style={{
                    color: "#ffffff",
                    fontSize: Math.round(size * 0.42),
                    fontWeight: "bold",
                }}
            >
                {initial}
            </Text>
        </View>
    );
}