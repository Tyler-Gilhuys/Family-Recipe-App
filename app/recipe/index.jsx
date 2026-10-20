import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useAppTheme } from "../../components/ThemedViews";
import React, { forwardRef, useCallback, useState } from "react";
import pb from "../../pocketbaseConfig";
import { Colors } from "../../constants/Colors";
import { useRecipeSearch } from "../../contexts/RecipeSearchContext";
import { CATEGORIES } from "../../constants/categories";

const Slide = forwardRef(
  ({ data, theme, cardWidth, imageWidth, ...props }, ref) => (
    <Pressable
      ref={ref}
      {...props}
      // onPress={onPress}
      style={({ pressed }) => StyleSheet.flatten([
        styles.slide,
        {
          width: cardWidth,
          backgroundColor:
            theme === Colors.dark
              ? Colors.light.uiBackground
              : Colors.dark.uiBackground,
          borderColor:
            theme === Colors.dark
              ? Colors.light.navBackground
              : Colors.dark.navBackground,
          opacity: pressed ? 0.85 : 1,
        },
      ])}
    >
      {data.image ? (
        <Image
          source={data.image}
          style={[styles.slideImage, { width: imageWidth }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.noImagePlaceholder,
            { width: imageWidth },
          ]}
        >
          <Text style={styles.noImageIcon}>🍽</Text>
          <Text style={styles.noImageText}>No photo yet</Text>
        </View>
      )}

      <Text
        style={[
          styles.slideText,
          {
            color:
              theme === Colors.dark
                ? Colors.light.text
                : Colors.dark.text,
          },
        ]}
        numberOfLines={2}
      >
        {data.name}
      </Text>
    </Pressable>
  )
);

Slide.displayName = "Slide";

const Recipe = () => {
  const { theme, width: windowWidth, isPhone, isTablet, isCompact } = useAppTheme();
  const [allRecipes, setAllRecipes] = useState([]);
  const { searchQuery, setSearchQuery } = useRecipeSearch();

  const cardWidth = isPhone
    ? windowWidth * 0.72
    : isTablet
      ? windowWidth * 0.36
      : 220;

  const imageWidth = Math.min(cardWidth - 32, 180);

  useFocusEffect(
    useCallback(() => {
      const fetchRecipes = async () => {
        try {
          if (!pb.authStore.isValid) {
            console.log("Please log in to view recipes.");
            setAllRecipes([]);
            return;
          }

          const records = await pb.collection("recipes").getFullList({
            sort: "-created",
          });

          const data = records.map((record) => ({
            id: record.id,
            name: record.title,
            image: record.image
              ? {
                uri: pb.files.getURL(record, record.image),
              }
              : null,
            categories: record.categories || [],
          }));

          setAllRecipes(data);
        } catch (error) {
          console.error("Error fetching PocketBase recipes:", error);
        }
      };

      fetchRecipes();
    }, [])
  );

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const categories = CATEGORIES.map((key) => ({ key }))
    .map((category) => {
      const inCategory = allRecipes.filter((recipe) =>
        recipe.categories?.includes(category.key)
      );

      // While searching, keep only matching recipes.
      const filtered = isSearching
        ? inCategory.filter((recipe) =>
          (recipe.name ?? "").toLowerCase().includes(query)
        )
        : inCategory;

      // Normal view: first 4 + "View All". Search view: show every match.
      const preview = isSearching ? filtered : filtered.slice(0, 4);

      return {
        ...category,
        recipes: [
          ...preview,
          ...(!isSearching && filtered.length > 4
            ? [
              {
                id: `view-all-${category.key}`,
                type: "viewAll",
                category: category.key,
              },
            ]
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
          <View style={styles.categoryContainer}>
            <Link
              href={`/recipe/${encodeURIComponent(item.key)}`}
              asChild
            >
              <Pressable
                style={styles.categoryHeader}
                accessibilityRole="button"
                accessibilityLabel={`View all ${item.key} recipes`}
              >
                <Text
                  style={[
                    styles.categoryTitle,
                    { color: theme.text },
                  ]}
                >
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
                          styles.slide,
                          styles.viewAllCard,
                        ])}
                      >
                        <Text style={styles.viewAllText}>View All</Text>
                      </Pressable>
                    </Link>
                  );
                }

                return (
                  <Link
                    href={`/recipe/details/${recipe.id}`}
                    asChild
                  >
                    <Slide
                      data={recipe}
                      theme={theme}
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
              style={styles.carousel}
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
  container: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
  },
  item: {
    padding: 10,
  },
  slide: {
    marginHorizontal: 10, // Space between cards
    borderRadius: 12, // Rounded corners for card feel
    borderWidth: 1, // Thin border for separation
    padding: 15, // Inner padding for content
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5, // Stronger shadow for Android
    alignItems: "center",
    justifyContent: "center",
  },
  slideImage: {
    height: 120, // Adjust as needed
    borderRadius: 8,
    marginBottom: 10,
  },
  slideText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  // Add this if you want extra separation (e.g., background stripes)
  carouselContainer: {
    paddingHorizontal: 10,
    // backgroundColor: theme.background || "#f5f5f5", // Use theme background for overall separation
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

  categoryAction: {
    fontSize: 14,
    fontWeight: "600",
  },

  viewAllCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#565555",
  },

  viewAllText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    alignItems: "center",
  },

  noImagePlaceholder: {
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#F0EDE7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2DDD3",
  },

  noImageIcon: {
    fontSize: 32,
    marginBottom: 6,
  },

  noImageText: {
    fontSize: 11,
    color: "#81796D",
    fontWeight: "500",
  },
});
