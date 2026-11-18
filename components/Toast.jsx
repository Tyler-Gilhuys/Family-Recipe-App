import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./ThemedViews";
import { setToastListener } from "../utils/toastBus";
const DURATIONS = { info: 3200, success: 3200, error: 5000 };

function ToastItem({ toast, onDone, theme, card }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(dismiss, DURATIONS[toast.type] || 3200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function dismiss() {
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(
            () => onDone(toast.id)
        );
    }

    const barColor =
        toast.type === "error" ? card.danger : toast.type === "success" ? card.accent : card.border;

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: card.background,
                    borderColor: card.border,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={[styles.bar, { backgroundColor: barColor }]} />
            <Pressable style={styles.toastBody} onPress={dismiss}>
                <Text style={[styles.toastTitle, { color: theme.text }]} numberOfLines={2}>
                    {toast.title}
                </Text>
                {toast.message ? (
                    <Text style={[styles.toastMessage, { color: card.muted }]} numberOfLines={4}>
                        {toast.message}
                    </Text>
                ) : null}
            </Pressable>
        </Animated.View>
    );
}

export function ToastProvider({ children }) {
    const { theme, card } = useAppTheme();
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((cur) => cur.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        setToastListener((toast) => {
            const id = Date.now() + Math.random();
            setToasts((cur) => [...cur, { id, ...toast }]);
        });
        return () => setToastListener(null);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {children}
            <View pointerEvents="box-none" style={styles.host}>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDone={remove} theme={theme} card={card} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    host: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 24,
        alignItems: "center",
        gap: 10,
    },
    toast: {
        flexDirection: "row",
        width: "92%",
        maxWidth: 420,
        borderWidth: 1,
        borderRadius: 10,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    bar: { width: 4 },
    toastBody: { flex: 1, paddingVertical: 12, paddingHorizontal: 14 },
    toastTitle: { fontWeight: "700", fontSize: 15 },
    toastMessage: { fontSize: 13, marginTop: 3, lineHeight: 18 },
});