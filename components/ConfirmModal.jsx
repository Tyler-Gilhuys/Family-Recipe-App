import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./ThemedViews";
import { setConfirmListener } from "../utils/confirmBus";

export function ConfirmProvider({ children }) {
    const { theme, card } = useAppTheme();
    const [request, setRequest] = useState(null);

    useEffect(() => {
        setConfirmListener((req) => setRequest(req));
        return () => setConfirmListener(null);
    }, []);

    const close = (result) => {
        request?.resolve(result);
        setRequest(null);
    };

    return (
        <View style={{ flex: 1 }}>
            {children}

            <Modal visible={!!request} transparent animationType="fade" onRequestClose={() => close(false)}>
                <View style={styles.backdrop}>
                    <View style={[styles.card, { backgroundColor: card.background, borderColor: card.border }]}>
                        <Text style={[styles.title, { color: theme.text }]}>{request?.title}</Text>
                        <Text style={[styles.message, { color: card.muted }]}>{request?.message}</Text>

                        <View style={styles.actions}>
                            <Pressable style={styles.cancelButton} onPress={() => close(false)}>
                                <Text style={[styles.cancelText, { color: card.muted }]}>Cancel</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.confirmButton, { backgroundColor: card.danger }]}
                                onPress={() => close(true)}
                            >
                                <Text style={styles.confirmText}>{request?.confirmLabel || "Confirm"}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(20,18,14,0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 380,
        borderWidth: 1,
        borderRadius: 14,
        padding: 22,
    },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
    message: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    cancelButton: { paddingVertical: 10, paddingHorizontal: 14 },
    cancelText: { fontWeight: "600" },
    confirmButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
    confirmText: { color: "#fff", fontWeight: "700" },
});