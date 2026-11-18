import { forwardRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PressableScale from "./PressableScale";
import { useAppTheme } from "./ThemedViews";

const RecipeCard = forwardRef(
    (
        { recipe, cardWidth, imageWidth, imageHeight = 120, large = false, ...props },
        ref
    ) => {
        const { theme, card } = useAppTheme();

        return (
            <PressableScale
                ref={ref}
                {...props}
                style={({ pressed }) =>
                    StyleSheet.flatten([
                        styles.card,
                        large && styles.cardLarge,
                        {
                            width: cardWidth,
                            backgroundColor: card.background,
                            borderColor: card.border,
                            opacity: pressed ? 0.85 : 1,
                        },
                    ])
                }
            >
                {recipe.imageUrl ? (
                    <Image
                        source={{ uri: recipe.imageUrl }}
                        style={[styles.image, { width: imageWidth, height: imageHeight }]}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={[
                            styles.noImage,
                            {
                                width: imageWidth,
                                height: imageHeight,
                                backgroundColor: theme.background,
                                borderColor: card.border,
                            },
                        ]}
                    >
                        <Ionicons name="restaurant-outline" size={22} color={card.muted} />
                        <Text style={[styles.noImageText, { color: card.muted }]}>
                            No photo yet
                        </Text>
                    </View>
                )}

                <Text
                    style={[styles.name, large && styles.nameLarge, { color: card.text }]}
                    numberOfLines={2}
                >
                    {recipe.title}
                </Text>
            </PressableScale>
        );
    }
);

RecipeCard.displayName = "RecipeCard";

export default RecipeCard;

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    cardLarge: {
        marginVertical: 12,
        borderRadius: 16,
        padding: 20,
        overflow: "hidden",
    },
    image: {
        borderRadius: 8,
        marginBottom: 10,
    },
    noImage: {
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "dashed",
        marginBottom: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    noImageText: { fontSize: 11, fontWeight: "500" },
    name: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
    nameLarge: { fontSize: 18 },
});