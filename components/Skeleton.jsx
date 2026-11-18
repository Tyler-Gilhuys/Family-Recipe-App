import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "./ThemedViews";

function Pulse({ style }) {
    const { card } = useAppTheme();
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.View style={[{ backgroundColor: card.border, borderRadius: 8 }, style, { opacity }]} />
    );
}

export function SkeletonCard({ width = 160 }) {
    return (
        <View style={[styles.card, { width }]}>
            <Pulse style={{ height: 120, borderRadius: 8, marginBottom: 10 }} />
            <Pulse style={{ height: 14, width: "80%", marginBottom: 6 }} />
            <Pulse style={{ height: 14, width: "55%" }} />
        </View>
    );
}

export function SkeletonRow({ count = 3, width = 160 }) {
    return (
        <View style={styles.row}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} width={width} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { marginHorizontal: 10, padding: 8 },
    row: { flexDirection: "row", paddingHorizontal: 10 },
});