import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "./ThemedViews";
import { Colors } from "../constants/Colors";

export default function EmptyState({ icon = "restaurant-outline", title, message, actionLabel, onAction }) {
    const { theme, card } = useAppTheme();

    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={30} color={card.muted} />
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {message ? <Text style={[styles.message, { color: card.muted }]}>{message}</Text> : null}

            {actionLabel ? (
                <Pressable
                    onPress={onAction}
                    style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", padding: 32, gap: 8 },
    title: { fontSize: 17, fontWeight: "700", marginTop: 4 },
    message: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 6, maxWidth: 280 },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginTop: 6,
    },
    buttonText: { color: "#fff", fontWeight: "700" },
});