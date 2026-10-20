import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useAppTheme } from "../../components/ThemedViews";
import RecipeCard from "../../components/RecipeCard";
import { useRecipes } from "../../hooks/useRecipes";
import { CATEGORIES } from "../../constants/categories";
import { useRecipeSearch } from "../../contexts/RecipeSearchContext";

const PREVIEW_COUNT = 4;

const Recipe = () => {
  const { theme, width: windowWidth, isPhone, isTablet, isCompact } =
    useAppTheme();
  const { recipes: allRecipes } = useRecipes();
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

    // While searching, keep only matching recipes.
    const filtered = isSearching
      ? inCategory.filter((recipe) =>
        (recipe.title ?? "").toLowerCase().includes(query)
      )
      : inCategory;

    // Normal view: first few + "View All". Search view: show every match.
    const preview = isSearching ? filtered : filtered.slice(0, PREVIEW_COUNT);

    return {
      key,
      recipes: [
        ...preview,
        ...(!isSearching && filtered.length > PREVIEW_COUNT
          ? [{ id: `view-all-${key}`, type: "viewAll", category: key }]
          : []),
      ],
    };
  })
    // Hide categories with no matches while searching.
    .filter((category) => !isSearching || category.recipes.length > 0);

  return (
    <View style={{ flex: 1 }}>
      {isCompact && (
        <View style={{ padding: 10 }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
            placeholderTextColor={theme.iconColor}
            returnKeyType="search"
            accessibilityLabel="Search recipes"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              borderWidth: 1,
              borderColor: theme.iconColor,
            }}
          />
        </View>
      )}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={
          isSearching ? (
            <Text
              style={{
                color: theme.text,
                textAlign: "center",
                padding: 24,
                fontSize: 16,
              }}
            >
              No recipes found for &quot;{searchQuery.trim()}&quot;.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View>
            <Link href={`/recipe/${encodeURIComponent(item.key)}`} asChild>
              <Pressable
                style={styles.categoryHeader}
                accessibilityRole="button"
                accessibilityLabel={`View all ${item.key} recipes`}
              >
                <Text style={[styles.categoryTitle, { color: theme.text }]}>
                  {item.key}
                </Text>
              </Pressable>
            </Link>

            <FlatList
              data={item.recipes}
              renderItem={({ item: recipe }) => {
                if (recipe.type === "viewAll") {
                  return (
                    <Link
                      href={`/recipe/${encodeURIComponent(recipe.category)}`}
                      asChild
                    >
                      <Pressable
                        style={StyleSheet.flatten([
                          styles.viewAllCard,
                        ])}
                      >
                        <Text style={styles.viewAllText}>View All</Text>
                      </Pressable>
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
          </View>
        )}
      />
    </View>
  );
};

export default Recipe;

const styles = StyleSheet.create({
  carouselContainer: {
    paddingHorizontal: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllCard: {
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#565555",
  },
  viewAllText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});