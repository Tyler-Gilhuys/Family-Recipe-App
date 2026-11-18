import { Platform, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./ThemedViews";
import { Colors } from "../constants/Colors";

const SERIF = Platform.select({
    web: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
    ios: "Georgia",
    android: "serif",
    default: "serif",
});

export default function Wordmark({ size = "small" }) {
    const { theme } = useAppTheme();
    const large = size === "large";

    return (
        <View style={styles.row}>
            <View style={[styles.badge, large && styles.badgeLarge]}>
                <Text style={[styles.badgeText, large && styles.badgeTextLarge, { fontFamily: SERIF }]}>
                    G
                </Text>
            </View>
            {large && (
                <View style={styles.textBlock}>
                    <Text style={[styles.name, { color: theme.text, fontFamily: SERIF }]}>Gilhuys</Text>
                    <Text style={[styles.tagline, { color: theme.text }]}>Family Recipes</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    badge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeLarge: { width: 56, height: 56, borderRadius: 28 },
    badgeText: { color: "#F7F4EC", fontSize: 16, fontWeight: "700" },
    badgeTextLarge: { fontSize: 28 },
    textBlock: { alignItems: "flex-start" },
    name: { fontSize: 22, fontWeight: "700", lineHeight: 26 },
    tagline: { fontSize: 13, opacity: 0.7 },
});