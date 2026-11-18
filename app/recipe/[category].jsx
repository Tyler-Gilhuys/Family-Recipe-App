import { View, FlatList, Text, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "../../components/ThemedViews";
import RecipeCard from "../../components/RecipeCard";
import { SkeletonRow } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { useRecipes } from "../../hooks/useRecipes";

const SERIF = Platform.select({
  web: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const { theme, card, width: windowWidth, isPhone, isTablet, isDesktop } =
    useAppTheme();

  const categoryName = Array.isArray(category) ? category[0] : category;
  const { recipes, loading } = useRecipes({ category: categoryName });

  const cardWidth = isPhone
    ? Math.min(windowWidth * 0.9, 440)
    : isTablet
      ? Math.min(windowWidth * 0.65, 560)
      : Math.min(windowWidth * 0.8, 600);

  const imageWidth = cardWidth - 40;
  const imageHeight = Math.min(imageWidth * 0.65, 280);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
          {categoryName}
        </Text>
        {recipes.length > 0 && (
          <Text style={[styles.count, { color: card.muted }]}>
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          </Text>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: card.border }]} />

      {loading && recipes.length === 0 ? (
        <SkeletonRow count={isDesktop ? 4 : isTablet ? 3 : 1} width={cardWidth} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          numColumns={isDesktop ? 2 : 1}
          key={isDesktop ? "grid" : "list"}
          columnWrapperStyle={isDesktop ? styles.row : undefined}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.list}
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
            <EmptyState
              icon="restaurant-outline"
              title="Nothing here yet"
              message={`No recipes have been added to ${categoryName} yet.`}
              actionLabel="Add a recipe"
              onAction={() => router.push("/addRecipe")}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  count: {
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 24,
    alignItems: "center",
  },
  row: {
    justifyContent: "center",
    gap: 10,
  },
});