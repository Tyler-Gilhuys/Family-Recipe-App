
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "../../../components/ThemedViews";
import { Colors } from "../../../constants/Colors";
import pb from "../../../pocketbaseConfig";
import { pickImage } from "../../../utils/ImagePicker";
import { updateRecipe } from "../../../services/recipes";
import { uploadRecipeImage } from "../../../services/recipeImages";

const categoriesList = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Christmas",
  "Thanksgiving",
  "Sides",
  "Dessert",
  "Beverages",
  "Extras",
];

export default function EditRecipe() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    theme,
    colorScheme,
    width: windowWidth,
  } = useAppTheme();

  const recipeId = Array.isArray(id) ? id[0] : id;
  const contentWidth = Math.min(windowWidth - 32, 760);

  const cardBackground =
    colorScheme === "dark"
      ? Colors.light.uiBackground
      : Colors.dark.uiBackground;

  const cardBorder =
    colorScheme === "dark"
      ? Colors.light.navBackground
      : Colors.dark.navBackground;

  const cardText =
    colorScheme === "dark"
      ? Colors.light.text
      : Colors.dark.text;

  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [comments, setComments] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchRecipe = async () => {
      try {
        if (!pb.authStore.isValid) {
          throw new Error("Please log in before editing a recipe.");
        }

        if (!recipeId) {
          throw new Error("No recipe ID was provided.");
        }

        const record = await pb.collection("recipes").getOne(recipeId);

        if (!active) return;

        setRecipeName(record.title || "");
        setIngredients((record.ingredients || []).join("\n"));
        setSteps((record.steps || []).join("\n"));
        setComments(record.comments || "");
        setSelectedCategories(record.categories || []);
        setExistingImage(
          record.image ? pb.files.getURL(record, record.image) : null
        );
      } catch (error) {
        console.error("Error loading recipe for editing:", error);

        if (active) {
          Alert.alert(
            "Unable to load recipe",
            error?.message || "Please try again.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRecipe();

    return () => {
      active = false;
    };
  }, [recipeId]);

  const normalizeList = (text, type = "generic") => {
    if (!text) return [];

    return text
      .split(type === "steps" ? "\n" : /\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const toggleCategory = (category) => {
    if (saving) return;

    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handlePickImage = async () => {
    if (saving) return;

    try {
      const uri = await pickImage();
      if (uri) setImageUri(uri);
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(
        "Image error",
        error?.message || "Could not select an image."
      );
    }
  };


  const handleSave = async () => {
    if (saving) return;

    if (!recipeName.trim()) {
      if (Platform.OS === "web") {
        window.alert("Please enter a recipe name.");
      } else {
        Alert.alert("Missing recipe name", "Please enter a recipe name.");
      }
      return;
    }

    if (!recipeId) {
      if (Platform.OS === "web") {
        window.alert("No recipe ID was provided.");
      } else {
        Alert.alert("Error", "No recipe ID was provided.");
      }
      return;
    }

    console.log("Saving recipe changes for ID:", recipeId);

    try {
      setSaving(true);

      console.log("Starting recipe update:", recipeId);

      const recipeData = {
        title: recipeName.trim(),
        ingredients: normalizeList(ingredients, "ingredients"),
        steps: normalizeList(steps, "steps"),
        comments: comments.trim(),
        categories: selectedCategories,
      };

      await updateRecipe(recipeId, recipeData);

      console.log("Recipe updated; checking image.");

      if (imageUri) {
        await uploadRecipeImage(imageUri, recipeId);
      }

      console.log("Save complete; navigating back.");

      // Navigate independently of any alert.
      router.back();
    } catch (error) {
      console.error("Error saving recipe changes:", error);

      const message =
        error?.response?.message ||
        error?.message ||
        "Please try again.";

      if (Platform.OS === "web") {
        window.alert(`Unable to save changes: ${message}`);
      } else {
        Alert.alert("Unable to save changes", message);
      }
    } finally {
      setSaving(false);
    }
  };


  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          {saving && (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="large" color={theme.title} />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Saving changes...
              </Text>
            </View>
          )}

          <Text style={[styles.heading, { color: theme.text }]}>
            Edit Recipe
          </Text>

          <Text style={[styles.helperText, { color: theme.text }]}>
            Update your recipe details, ingredients, and preparation steps.
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>
            Recipe Name
          </Text>
          <TextInput
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
            placeholder="e.g. Grandma's Chicken and Rice"
            placeholderTextColor={theme.iconColor}
            editable={!saving}
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: theme.text }]}>
            Ingredients
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorder,
                color: cardText,
              },
            ]}
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="Enter one ingredient per line, or separate with commas or semicolons"
            placeholderTextColor={theme.iconColor}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />

          <Text style={[styles.label, { color: theme.text }]}>
            Preparation Steps
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorder,
                color: cardText,
              },
            ]}
            value={steps}
            onChangeText={setSteps}
            placeholder="Enter each preparation step on a new line"
            placeholderTextColor={theme.iconColor}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />

          <Text style={[styles.label, { color: theme.text }]}>
            Special Comments
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorder,
                color: cardText,
              },
            ]}
            value={comments}
            onChangeText={setComments}
            placeholder="Optional notes, tips, or substitutions"
            placeholderTextColor={theme.iconColor}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />

          <Text style={[styles.label, { color: theme.text }]}>
            Categories
          </Text>
          <Text style={[styles.helperText, { color: theme.text }]}>
            Select all categories that apply to this recipe.
          </Text>

          <View style={styles.categories}>
            {categoriesList.map((category) => {
              const selected = selectedCategories.includes(category);

              return (
                <Pressable
                  key={category}
                  onPress={() => toggleCategory(category)}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.categoryButton,
                    {
                      backgroundColor: selected
                        ? Colors.primary
                        : theme.uiBackground,
                      borderColor: selected
                        ? Colors.primary
                        : theme.navBackground,
                      opacity: pressed || saving ? 0.75 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selected ? "#ffffff" : theme.text },
                    ]}
                  >
                    {selected ? "✓ " : ""}
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: theme.text }]}>
            Recipe Image
          </Text>

          {imageUri || existingImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri || existingImage }}
                style={styles.image}
                resizeMode="cover"
              />

              {imageUri && (
                <Pressable
                  onPress={() => setImageUri(null)}
                  disabled={saving}
                  style={styles.removeImageButton}
                >
                  <Text style={styles.removeImageText}>
                    Discard New Image
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  backgroundColor: cardBackground,
                  borderColor: cardBorder,
                },
              ]}
            >
              <Text style={styles.placeholderIcon}>🍽️</Text>
              <Text style={[styles.placeholderText, { color: cardText }]}>
                No photo available
              </Text>
            </View>
          )}

          <Pressable
            onPress={handlePickImage}
            disabled={saving}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorder,
                opacity: pressed || saving ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: cardText }]}>
              {imageUri ? "Choose a Different Image" : "Choose New Image"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: cardBackground,
                opacity: pressed || saving ? 0.75 : 1,
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={[styles.saveButtonText, { color: cardText }]}>
                Save Changes
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={saving}
            style={({ pressed }) => [
              styles.cancelButton,
              {
                backgroundColor: Colors.warning,
                borderColor: cardBorder,
                opacity: pressed || saving ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: cardText }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  content: {
    maxWidth: 760,
    alignSelf: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  savingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  heading: {
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
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 12,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: "#d6d5e1",
  },
  imagePlaceholder: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  placeholderIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
  },
  removeImageButton: {
    marginTop: 8,
    padding: 8,
  },
  removeImageText: {
    color: Colors.warning,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    marginTop: 16,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
