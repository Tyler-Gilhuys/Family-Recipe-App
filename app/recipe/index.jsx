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
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import ThemedViews from "../../components/ThemedViews";
import React, { forwardRef } from "react";

const { width: windowWidth } = Dimensions.get("window");

const Slide = forwardRef(({ data, theme, ...props }, ref) => (
  <Pressable
    ref={ref}
    {...props}
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

  const everydayRecipes = [
    {
      id: "1",
      name: "Grilled Chicken",
      image: require("../../assets/grilled-chicken.jpeg"), // Update path
    },
    {
      id: "2",
      name: "Pasta Primavera",
      image: require("../../assets/pasta-primavera.jpeg"),
    },
    // Add more everyday recipes here
  ];

  const fallRecipes = [
    {
      id: "3",
      name: "Pumpkin Soup",
      image: require("../../assets/pumpkin-soup.jpeg"),
    },
    {
      id: "4",
      name: "Apple Crisp",
      image: require("../../assets/apple-crisp.jpeg"),
    },
    // Add more fall recipes here
  ];

  const christmasRecipes = [
    {
      id: "5",
      name: "Gingerbread Cookies",
      image: require("../../assets/gingerbread-cookies.jpeg"),
    },
    // Add more Christmas recipes here
  ];

  const thanksgivingRecipes = [
    {
      id: "6",
      name: "Roast Turkey",
      image: require("../../assets/roast-turkey.jpeg"),
    },
    {
      id: "7",
      name: "Mashed Potatoes",
      image: require("../../assets/mashed-potatoes.jpeg"),
    },
    // Add more Thanksgiving recipes here
  ];

  const sidesRecipes = [
    {
      id: "8",
      name: "Garlic Bread",
      image: require("../../assets/garlic-bread.jpeg"),
    },
    // Add more sides here
  ];

  const dessertsRecipes = [
    {
      id: "9",
      name: "Chocolate Cake",
      image: require("../../assets/chocolate-cake.jpeg"),
    },
    // Add more desserts here
  ];

  const beveragesRecipes = [
    {
      id: "10",
      name: "Hot Cocoa",
      image: require("../../assets/hot-cocoa.jpeg"),
    },
    // Add more beverages here
  ];

  // Mapping object: Keys match category names, values are the recipe arrays
  const recipeMapping = {
    "Everday Dinners": everydayRecipes,
    "Fall Dinners": fallRecipes,
    "Christmas Snack Night": christmasRecipes,
    "Thanksgiving Dinners": thanksgivingRecipes,
    Sides: sidesRecipes,
    Desserts: dessertsRecipes,
    Beverages: beveragesRecipes,
    // Add new categories here, e.g., 'Summer Salads': summerRecipes,
  };

  // Categories data (now uses the mapping for dynamic assignment)
  const categories = [
    { key: "Everday Dinners" },
    { key: "Fall Dinners" },
    { key: "Christmas Snack Night" },
    { key: "Thanksgiving Dinners" },
    { key: "Sides" },
    { key: "Desserts" },
    { key: "Beverages" },
    // Add new categories here, e.g., { key: 'Summer Salads' },
  ].map((category) => ({
    ...category,
    recipes: recipeMapping[category.key] || [], // Dynamically assign recipes or empty array if not found
  }));

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
              data={item.recipes} // Use the recipes for this category
              renderItem={({ item: recipe }) => (
                <Link href={`/recipe/${recipe.id}`} asChild>
                  <Slide data={recipe} theme={theme} />
                </Link>
              )}
              keyExtractor={(recipe) => recipe.id}
              horizontal
              pagingEnabled // Snaps to the next item
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={[
                styles.carouselContainer,
                { backgroundColor: theme.background || "#f5f5f5" },
              ]} // Adds spacing
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
});
