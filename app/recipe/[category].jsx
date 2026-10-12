import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { useLocalSearchParams, Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { useAppTheme } from "../../components/ThemedViews";
import { Colors } from "../../constants/Colors";
import pb from "../../pocketbaseConfig";

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const {
    theme,
    width: windowWidth,
    isPhone,
    isTablet,
  } = useAppTheme();

  const [recipes, setRecipes] = useState([]);

  const categoryName = Array.isArray(category) ? category[0] : category;

  // Match the responsive sizing used on the main recipe page.
  const cardWidth = isPhone
    ? Math.min(windowWidth * 0.90, 440)
    : isTablet
      ? Math.min(windowWidth * 0.65, 560)
      : Math.min(windowWidth * 0.80, 600);

  const imageWidth = cardWidth - 40;
  const imageHeight = Math.min(imageWidth * 0.65, 280);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        if (!pb.authStore.isValid) {
          setRecipes([]);
          return;
        }

        const records = await pb.collection("recipes").getFullList({
          sort: "-created",
        });

        const filtered = records.filter((recipe) =>
          recipe.categories?.includes(categoryName)
        );

        setRecipes(filtered);
      } catch (error) {
        console.error("Error fetching PocketBase category recipes:", error);
      }
    };

    fetchRecipes();
  }, [categoryName]);

  const cardBackground =
    theme === Colors.dark
      ? Colors.light.uiBackground
      : Colors.dark.uiBackground;

  const cardBorder =
    theme === Colors.dark
      ? Colors.light.navBackground
      : Colors.dark.navBackground;

  const cardText =
    theme === Colors.dark
      ? Colors.light.text
      : Colors.dark.text;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        {categoryName}
      </Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.list}
        numColumns={1}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/recipe/details/${item.id}`)}
            style={({ pressed }) => ({
              ...StyleSheet.flatten(styles.card),
              width: cardWidth,
              backgroundColor: cardBackground,
              borderColor: cardBorder,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {item.image ? (
              <Image
                source={{
                  uri: pb.files.getURL(item, item.image),
                }}
                style={[styles.image, { width: imageWidth, height: imageHeight }]}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.noImage, { width: imageWidth, height: imageHeight }]}
              >
                <Text style={styles.noImageIcon}>🍽</Text>
                <Text style={styles.noImageText}>No photo yet</Text>
              </View>
            )}

            <Text
              style={[styles.name, { color: cardText }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </Pressable>
        )
        }
        ListEmptyComponent={
          < Text style={[styles.empty, { color: theme.text }]} >
            No recipes found in this category yet.
          </Text >
        }
      />
    </View >
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
  card: {
    marginVertical: 12,
    marginHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  noImage: {
    borderRadius: 8,
    marginBottom: 12,
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
  empty: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 15,
  },
});