import { forwardRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./ThemedViews";

// forwardRef is required so <Link asChild> can attach to the Pressable.
const RecipeCard = forwardRef(
    (
        { recipe, cardWidth, imageWidth, imageHeight = 120, large = false, ...props },
        ref
    ) => {
        const { card } = useAppTheme();

        return (
            <Pressable
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
                            { width: imageWidth, height: imageHeight },
                        ]}
                    >
                        <Text style={styles.noImageIcon}>🍽</Text>
                        <Text style={styles.noImageText}>No photo yet</Text>
                    </View>
                )}

                <Text
                    style={[styles.name, large && styles.nameLarge, { color: card.text }]}
                    numberOfLines={2}
                >
                    {recipe.title}
                </Text>
            </Pressable>
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
        marginBottom: 10,
        backgroundColor: "#F0EDE7",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2DDD3",
    },
    noImageIcon: { fontSize: 32, marginBottom: 6 },
    noImageText: { fontSize: 11, color: "#81796D", fontWeight: "500" },
    name: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
    nameLarge: { fontSize: 18 },
});