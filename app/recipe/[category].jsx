import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import ThemedViews from "../../components/ThemedViews";

const { width } = Dimensions.get("window");

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const snapshot = await getDocs(collection(db, "recipes"));
      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecipes(all.filter((r) => r.categories?.includes(category)));
    };

    fetchRecipes();
  }, [category]);

  return (
    <ThemedViews>
      <Text style={styles.title}>{category}</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/recipe/details/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <Text style={styles.name}>{item.title}</Text>
            </Pressable>
          </Link>
        )}
      />
    </ThemedViews>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 12,
    textAlign: "center",
    color: "white",
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: "#fff", // ensures text is readable if image doesn't fill all space
  },
  image: {
    width: "100%",
    height: width * 0.45, // slightly smaller than before
  },
  name: {
    padding: 8,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
});
