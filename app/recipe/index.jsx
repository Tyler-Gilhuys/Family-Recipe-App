import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useAppTheme } from "../../components/ThemedViews";
import RecipeCard from "../../components/RecipeCard";
import ViewAllCard from "../../components/ViewAllCard";
import { SkeletonRow } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { useRecipes } from "../../hooks/useRecipes";
import { CATEGORIES } from "../../constants/categories";
import { useRecipeSearch } from "../../contexts/RecipeSearchContext";

const SERIF = Platform.select({
  web: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const PREVIEW_COUNT = 4;

const Recipe = () => {
  const router = useRouter();
  const { theme, card, width: windowWidth, isPhone, isTablet, isCompact, isDesktop } =
    useAppTheme();
  const { recipes: allRecipes, loading } = useRecipes();
  const { searchQuery, setSearchQuery } = useRecipeSearch();

  const cardWidth = isPhone
    ? windowWidth * 0.72
    : isTablet
      ? windowWidth * 0.36
      : 220;

  const imageWidth = Math.min(cardWidth - 32, 180);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const categories = CATEGORIES.map((key) => {
    const inCategory = allRecipes.filter((recipe) =>
      recipe.categories.includes(key)
    );

    const filtered = isSearching
      ? inCategory.filter((recipe) =>
        (recipe.title ?? "").toLowerCase().includes(query)
      )
      : inCategory;

    const preview = isSearching ? filtered : filtered.slice(0, PREVIEW_COUNT);

    return {
      key,
      total: filtered.length,
      recipes: [
        ...preview,
        ...(!isSearching && filtered.length > PREVIEW_COUNT
          ? [{ id: `view-all-${key}`, type: "viewAll", category: key }]
          : []),
      ],
    };
  })
    // Hide categories with nothing in them, in every view, not just search.
    .filter((category) => category.recipes.length > 0);

  return (
    <View style={{ flex: 1 }}>
      {isCompact && (
        <View style={{ padding: 10 }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
            placeholderTextColor={card.muted}
            returnKeyType="search"
            accessibilityLabel="Search recipes"
            style={{
              backgroundColor: card.background,
              color: theme.text,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              borderWidth: 1,
              borderColor: card.border,
            }}
          />
        </View>
      )}

      {loading && allRecipes.length === 0 && (
        <View style={{ paddingTop: 10 }}>
          <SkeletonRow count={isPhone ? 2 : 4} width={cardWidth} />
        </View>
      )}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={
          !loading && isSearching ? (
            <EmptyState
              icon="search-outline"
              title="No recipes found"
              message={`Nothing matches "${searchQuery.trim()}".`}
            />
          ) : !loading && allRecipes.length === 0 ? (
            <EmptyState
              icon="restaurant-outline"
              title="No recipes yet"
              message="Add the first family recipe to get started."
              actionLabel="Add a recipe"
              onAction={() => router.push("/addRecipe")}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Link href={`/recipe/${encodeURIComponent(item.key)}`} asChild>
              <Pressable style={styles.categoryHeader}>
                <Text
                  style={[
                    styles.categoryTitle,
                    { color: theme.text, fontFamily: SERIF },
                  ]}
                >
                  {item.key}
                </Text>

                <View style={styles.seeAll}>
                  <Text style={[styles.seeAllText, { color: card.accent }]}>
                    See all
                  </Text>
                  <Ionicons name="chevron-forward" size={15} color={card.accent} />
                </View>
              </Pressable>
            </Link>

            <View style={[styles.divider, { backgroundColor: card.border }]} />

            {isDesktop ? (
              <View style={styles.grid}>
                {item.recipes.map((recipe) =>
                  recipe.type === "viewAll" ? (
                    <Link
                      key={recipe.id}
                      href={`/recipe/${encodeURIComponent(recipe.category)}`}
                      asChild
                    >
                      <ViewAllCard cardWidth={cardWidth} />
                    </Link>
                  ) : (
                    <Link key={recipe.id} href={`/recipe/details/${recipe.id}`} asChild>
                      <RecipeCard recipe={recipe} cardWidth={cardWidth} imageWidth={imageWidth} />
                    </Link>
                  )
                )}
              </View>
            ) : (
              <FlatList
                data={item.recipes}
                renderItem={({ item: recipe }) => {
                  if (recipe.type === "viewAll") {
                    return (
                      <Link
                        href={`/recipe/${encodeURIComponent(recipe.category)}`}
                        asChild
                      >
                        <ViewAllCard cardWidth={cardWidth} />
                      </Link>
                    );
                  }

                  return (
                    <Link href={`/recipe/details/${recipe.id}`} asChild>
                      <RecipeCard
                        recipe={recipe}
                        cardWidth={cardWidth}
                        imageWidth={imageWidth}
                      />
                    </Link>
                  );
                }}
                keyExtractor={(recipe) => recipe.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContainer}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

export default Recipe;

const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
  },
  carouselContainer: {
    paddingHorizontal: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 4,
  },
});