import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { recipes } from "../../constants/recipes";

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return <Text>Recipe not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={recipe.image} style={styles.image} />

      <Text style={styles.title}>{recipe.name}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      <Text style={styles.section}>Ingredients</Text>
      {recipe.ingredients.map((item, index) => (
        <Text key={index}>• {item}</Text>
      ))}

      <Text style={styles.section}>Instructions</Text>
      {recipe.instructions.map((step, index) => (
        <Text key={index}>
          {index + 1}. {step}
        </Text>
      ))}
    </ScrollView>
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
