import { forwardRef } from "react";
import { StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PressableScale from "./PressableScale";
import { useAppTheme } from "./ThemedViews";

const ViewAllCard = forwardRef(({ cardWidth, ...props }, ref) => {
    const { card } = useAppTheme();

    return (
        <PressableScale
            ref={ref}
            {...props}
            style={({ pressed }) =>
                StyleSheet.flatten([
                    styles.card,
                    {
                        width: cardWidth,
                        borderColor: card.accent,
                        backgroundColor: card.background,
                        opacity: pressed ? 0.8 : 1,
                    },
                ])
            }
        >
            <Ionicons name="arrow-forward-circle-outline" size={26} color={card.accent} />
            <Text style={[styles.label, { color: card.accent }]}>View all</Text>
        </PressableScale>
    );
});

ViewAllCard.displayName = "ViewAllCard";

export default ViewAllCard;

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 10,
        marginVertical: 6,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: "dashed",
        paddingVertical: 28,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    label: { fontSize: 14, fontWeight: "700" },
});