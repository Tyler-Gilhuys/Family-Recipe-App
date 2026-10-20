
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../components/ThemedViews";
import { Colors } from "../constants/Colors";
import { pickImage } from "../utils/ImagePicker";
import { createRecipe } from "../services/recipes";
import { uploadRecipeImage } from "../services/recipeImages";
import { showMessage, describeError } from "../utils/showMessage";
import { CATEGORIES } from "../constants/categories";


const AddRecipe = () => {
  const router = useRouter();
  const { theme } = useAppTheme();

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

  const [imageUri, setImageUri] = useState(null);
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);


  const handlePickImage = async () => {
    if (loading) return;

    try {
      const uri = await pickImage();
      if (uri) setImageUri(uri);
    } catch (error) {
      console.error("Image picker error:", error);
      showMessage("Error", "Unable to select an image.");
    }
  };

  const normalizeList = (text, type = "generic") => {
    if (!text) return [];

    return text
      .split(type === "steps" ? "\n" : /\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!recipeName.trim() || !ingredients.trim() || !steps.trim() || !CATEGORIES.some((cat) => selectedCategories.includes(cat))) {
      showMessage("Missing Information", "Please fill in all required fields and select at least one category.");
      return;
    }

    const normalizedIngredients = normalizeList(ingredients, "ingredients");
    const normalizedSteps = normalizeList(steps, "steps");

    try {
      setLoading(true);

      const recipe = {
        title: recipeName.trim(),
        ingredients: normalizedIngredients,
        steps: normalizedSteps,
        comments: comments.trim(),
        categories: selectedCategories,
      };

      const recipeId = await createRecipe(recipe);

      if (imageUri) {
        await uploadRecipeImage(imageUri, recipeId);
      }

      showMessage("Success", "Recipe saved successfully!");

      setRecipeName("");
      setIngredients("");
      setSteps("");
      setComments("");
      setImageUri(null);
      setSelectedCategories([]);

      router.push("/");
    } catch (error) {
      console.error("handleSubmit error:", error);
      showMessage("Error", describeError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.title} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Saving recipe...
          </Text>
        </View>
      )}

      <Text style={[styles.pageTitle, { color: theme.addRecipeText }]}>
        Add a Recipe
      </Text>

      <Text style={[styles.helperText, { color: theme.text }]}>
        Add your recipe details, ingredients, and preparation steps below.
      </Text>

      <Pressable
        onPress={handlePickImage}
        disabled={loading}
        style={({ pressed }) => [
          styles.imageButton,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            opacity: pressed || loading ? 0.75 : 1,
          },
        ]}
      >
        <Text style={[styles.imageButtonText, { color: theme.title }]}>
          {imageUri ? "Change Recipe Image" : "Pick a Recipe Image"}
        </Text>
      </Pressable>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable
            onPress={() => setImageUri(null)}
            disabled={loading}
            style={styles.removeImageButton}
          >
            <Text style={styles.removeImageText}>Remove Image</Text>
          </Pressable>
        </View>
      )}

      <Text style={[styles.label, { color: theme.text }]}>
        Recipe Name *
      </Text>
      <TextInput
        placeholder="e.g. Grandma's Chicken and Rice"
        placeholderTextColor={theme.iconColor}
        style={[
          styles.input,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            color: cardText,
          },
        ]}
        value={recipeName}
        onChangeText={setRecipeName}
        editable={!loading}
        returnKeyType="next"
      />

      <Text style={[styles.label, { color: theme.text }]}>
        Ingredients *
      </Text>
      <TextInput
        placeholder={"Enter one ingredient per line, or separate with commas or semicolons"}
        placeholderTextColor={theme.iconColor}
        style={[
          styles.input,
          styles.multilineInput,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            color: cardText,
          },
        ]}
        value={ingredients}
        onChangeText={setIngredients}
        multiline
        editable={!loading}
      />

      <Text style={[styles.label, { color: theme.text }]}>
        Preparation Steps *
      </Text>
      <TextInput
        placeholder="Enter each preparation step on a new line"
        placeholderTextColor={theme.iconColor}
        style={[
          styles.input,
          styles.multilineInput,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            color: cardText,
          },
        ]}
        value={steps}
        onChangeText={setSteps}
        multiline
        editable={!loading}
      />

      <Text style={[styles.label, { color: theme.text }]}>
        Special Comments
      </Text>
      <TextInput
        placeholder="Optional notes, tips, or substitutions"
        placeholderTextColor={theme.iconColor}
        style={[
          styles.input,
          styles.multilineInput,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            color: cardText,
          },
        ]}
        value={comments}
        onChangeText={setComments}
        multiline
        editable={!loading}
      />

      <Text style={[styles.label, { color: theme.text }]}>
        Categories *
      </Text>
      <Text style={[styles.helperText, { color: theme.text }]}>
        Select all categories that apply to this recipe.
      </Text>

      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <Pressable
              key={category}
              onPress={() => toggleCategory(category)}
              disabled={loading}
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor: isSelected
                    ? Colors.primary
                    : theme.uiBackground,
                  borderColor: isSelected
                    ? Colors.primary
                    : theme.navBackground,
                  opacity: pressed || loading ? 0.75 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: isSelected ? "#ffffff" : theme.text,
                  },
                ]}
              >
                {isSelected ? "✓ " : ""}
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.saveButton,
          {
            backgroundColor: cardBackground,
            opacity: pressed || loading ? 0.75 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={[styles.saveButtonText, { color: cardText }]}>
            Save Recipe
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        disabled={loading}
        style={({ pressed }) => [
          styles.cancelButton,
          {
            backgroundColor: Colors.warning,
            borderColor: cardBorder,
            opacity: pressed || loading ? 0.75 : 1,
          },
        ]}
      >
        <Text style={[styles.cancelButtonText, { color: cardText }]}>
          Cancel
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddRecipe;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  imageButton: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  imageButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  image: {
    width: "100%",
    maxWidth: 420,
    height: 240,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeImageButton: {
    marginTop: 8,
    padding: 8,
  },
  removeImageText: {
    color: Colors.warning,
    fontWeight: "600",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 22,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
  },
  cancelButton: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
