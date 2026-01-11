import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import ThemedViews from "../components/ThemedViews";
import { pickImage } from "../utils/ImagePicker";
import { createRecipe } from "../services/recipes";
import { uploadRecipeImage, updateRecipeImage } from "../services/recipeImages";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddRecipe = () => {
  const router = useRouter(); // initialize router
  const [imageUri, setImageUri] = useState(null);
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const categoriesList = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Christmas",
    "Thanksgiving",
    "Sides",
    "Dessert",
    "Beverages",
  ];
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handlePickImage = async () => {
    if (loading) return;
    const uri = await pickImage();
    if (uri) setImageUri(uri);
  };

  const normalizeList = (text, type = "generic") => {
    if (!text) return [];

    if (type === "steps") {
      return text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    } else {
      return text
        .split(/\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    const normalizedIngredients = normalizeList(ingredients, "ingredients");
    const normalizedSteps = normalizeList(steps, "steps");

    if (!recipeName || !imageUri) {
      Alert.alert("Error", "Recipe name and image are required!");
      return;
    }

    try {
      setLoading(true);

      const recipe = {
        title: recipeName.trim(),
        ingredients: normalizedIngredients,
        steps: normalizedSteps,
        comments: comments.trim(),
        imageUrl: null,
        categories: selectedCategories,
      };

      console.log("Creating recipe in Firestore...");
      const recipeId = await createRecipe(recipe);
      console.log("Recipe created with ID:", recipeId);

      console.log("Uploading recipe image...");
      const imageUrl = await uploadRecipeImage(imageUri, recipeId);
      console.log("Image uploaded:", imageUrl);

      console.log("Updating recipe with image URL...");
      await updateRecipeImage(recipeId, imageUrl);

      console.log("Success", "Recipe saved successfully!");

      // Reset form
      setRecipeName("");
      setIngredients("");
      setSteps("");
      setComments("");
      setImageUri(null);
      setSelectedCategories([]);

      // Navigate back to home
      router.push("/");
    } catch (error) {
      console.error("handleSubmit error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedViews>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Saving recipe...</Text>
          </View>
        )}

        <Button
          title="Pick a Recipe Image"
          onPress={handlePickImage}
          disabled={loading}
        />
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <TextInput
          placeholder="Recipe Name"
          style={styles.input}
          value={recipeName}
          onChangeText={setRecipeName}
          editable={!loading}
        />
        <TextInput
          placeholder="Ingredients (newline, comma, or semicolon separated)"
          style={[styles.input, { height: 100 }]}
          value={ingredients}
          onChangeText={setIngredients}
          multiline
          editable={!loading}
        />
        <TextInput
          placeholder="Preparation Steps (newline separated)"
          style={[styles.input, { height: 100 }]}
          value={steps}
          onChangeText={setSteps}
          multiline
          editable={!loading}
        />
        <TextInput
          placeholder="Special Comments"
          style={[styles.input, { height: 100 }]}
          value={comments}
          onChangeText={setComments}
          multiline
          editable={!loading}
        />
        <Text style={styles.categoryText}>
          Choose any of the following that the item falls under.
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginVertical: 10,
          }}
        >
          {categoriesList.map((cat) => {
            const isSelected = selectedCategories.includes(cat);

            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  if (isSelected) {
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== cat)
                    );
                  } else {
                    setSelectedCategories([...selectedCategories, cat]);
                  }
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  margin: 4,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isSelected ? "white" : "gray",
                  backgroundColor: isSelected ? "white" : "transparent",
                }}
              >
                <Text style={{ color: isSelected ? "black" : "white" }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title="Save Recipe" onPress={handleSubmit} disabled={loading} />
      </KeyboardAwareScrollView>
    </ThemedViews>
  );
};

export default AddRecipe;

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginVertical: 8,
    padding: 8,
    color: "white",
    textAlignVertical: "top",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginVertical: 12,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
  },
  categoryText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
});
