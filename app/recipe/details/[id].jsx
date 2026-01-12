import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useEffect, useState } from "react";
import ThemedViews from "../../../components/ThemedViews";

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
        } else {
          setRecipe(null);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <ThemedViews>
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 50 }}
        />
      </ThemedViews>
    );
  }

  if (!recipe) {
    return (
      <ThemedViews>
        <Text style={{ padding: 16, fontSize: 18 }}>Recipe not found</Text>
      </ThemedViews>
    );
  }

  return (
    <ThemedViews>
      <ScrollView contentContainerStyle={styles.container}>
        {recipe.imageUrl && (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        )}

        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.comments ? (
          <Text style={styles.description}>{recipe.comments}</Text>
        ) : null}

        {recipe.ingredients?.length > 0 && (
          <>
            <Text style={styles.section}>Ingredients</Text>
            {recipe.ingredients.map((item, index) => (
              <Text key={index}>• {item}</Text>
            ))}
          </>
        )}

        {recipe.steps?.length > 0 && (
          <>
            <Text style={styles.section}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <Text key={index}>
                {index + 1}. {step}
              </Text>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedViews>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    marginVertical: 10,
    fontSize: 16,
  },
  section: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
  },
});
