import { View, FlatList, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppTheme } from "../../components/ThemedViews";
import RecipeCard from "../../components/RecipeCard";
import { useRecipes } from "../../hooks/useRecipes";

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const { theme, width: windowWidth, isPhone, isTablet } = useAppTheme();

  const categoryName = Array.isArray(category) ? category[0] : category;
  const { recipes } = useRecipes({ category: categoryName });

  // Match the responsive sizing used on the main recipe page.
  const cardWidth = isPhone
    ? Math.min(windowWidth * 0.9, 440)
    : isTablet
      ? Math.min(windowWidth * 0.65, 560)
      : Math.min(windowWidth * 0.8, 600);

  const imageWidth = cardWidth - 40;
  const imageHeight = Math.min(imageWidth * 0.65, 280);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{categoryName}</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.list}
        numColumns={1}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            large
            cardWidth={cardWidth}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            onPress={() => router.push(`/recipe/details/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.text }]}>
            No recipes found in this category yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  empty: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 15,
  },
});