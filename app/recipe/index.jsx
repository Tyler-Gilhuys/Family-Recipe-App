import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import { Colors } from "../../constants/Colors";
import ThemedViews from "../../components/ThemedViews";
import React, { forwardRef } from "react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width: windowWidth } = Dimensions.get("window");

const Slide = forwardRef(({ data, theme, onPress, ...props }, ref) => (
  <Pressable
    ref={ref}
    {...props}
    onPress={onPress}
    style={({ pressed }) => [
      styles.slide,
      {
        backgroundColor: theme.cardBackground || "#fff",
        borderColor: theme.border || "#ddd",
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      },
    ]}
  >
    <Image source={data.image} style={styles.slideImage} />
    <Text style={[styles.slideText, { color: "black" }]}>{data.name}</Text>
  </Pressable>
));

const Recipe = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [allRecipes, setAllRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "recipes"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().title,
          image: { uri: doc.data().imageUrl },
          categories: doc.data().categories || [],
        }));
        setAllRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  // Categories data (now uses the mapping for dynamic assignment)
  const categories = [
    { key: "Breakfast" },
    { key: "Dinner" },
    { key: "Christmas" },
    { key: "Thanksgiving" },
    { key: "Sides" },
    { key: "Dessert" },
    { key: "Beverages" },
  ].map((category) => {
    const filtered = allRecipes.filter((recipe) =>
      recipe.categories?.includes(category.key)
    );

    const preview = filtered.slice(0, 3);

    return {
      ...category,
      recipes: [
        ...preview,
        ...(filtered.length > 3
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
  });

  return (
    // <SafeAreaView style={[styles.container, { backgroundColor: theme.background}]}>
    <ThemedViews>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <View style={styles.categoryContainer}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>
              {item.key}
            </Text>
            <FlatList
              data={item.recipes}
              renderItem={({ item: recipe }) => {
                // View All card
                if (recipe.type === "viewAll") {
                  return (
                    <Link href={`/recipe/${recipe.category}`} asChild>
                      <Pressable style={[styles.slide, styles.viewAllCard]}>
                        <Text style={styles.viewAllText}>View All</Text>
                      </Pressable>
                    </Link>
                  );
                }

                // Normal recipe card
                return (
                  <Link href={`/recipe/details/${recipe.id}`} asChild>
                    <Slide
                      data={recipe}
                      theme={theme}
                      onPress={() =>
                        console.log(
                          "Pressed item:",
                          recipe.type ?? "recipe",
                          recipe.name ?? recipe.id
                        )
                      }
                    />
                  </Link>
                );
              }}
              keyExtractor={(recipe) => recipe.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={[
                styles.carouselContainer,
                { backgroundColor: theme.background || "#f5f5f5" },
              ]}
            />
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      {/* <Link href="/">Home Page</Link> */}
    </ThemedViews>
    // </SafeAreaView>
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
    width: windowWidth * 0.8, // Keep card width
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
    width: "100%",
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
  categoryTitle: {
    padding: 10,
    fontSize: 15,
  },
  viewAllCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },

  viewAllText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    alignItems: "center",
  },
});
