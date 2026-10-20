import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "../../../components/ThemedViews";
import RecipeForm from "../../../components/RecipeForm";
import pb from "../../../pocketbaseConfig";
import { updateRecipe } from "../../../services/recipes";
import { showMessage, describeError } from "../../../utils/showMessage";

export default function EditRecipe() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useAppTheme();

  const recipeId = Array.isArray(id) ? id[0] : id;
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!pb.authStore.isValid) {
          throw new Error("Please log in before editing a recipe.");
        }
        if (!recipeId) {
          throw new Error("No recipe ID was provided.");
        }

        const record = await pb.collection("recipes").getOne(recipeId);
        if (!active) return;

        setInitialValues({
          title: record.title || "",
          ingredients: record.ingredients || [],
          steps: record.steps || [],
          comments: record.comments || "",
          categories: record.categories || [],
          imageUrl: record.image ? pb.files.getURL(record, record.image) : null,
        });
      } catch (error) {
        console.error("Error loading recipe for editing:", error);
        if (active) {
          showMessage("Unable to load recipe", describeError(error));
          router.back();
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [recipeId, router]);

  const handleSave = async ({ recipe, imageUri }) => {
    await updateRecipe(recipeId, recipe, imageUri);
    router.back();
  };

  if (!initialValues) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.title} />
      </View>
    );
  }

  return (
    <RecipeForm
      heading="Edit Recipe"
      helperText="Update your recipe details, ingredients, and preparation steps."
      submitLabel="Save Changes"
      savingLabel="Saving changes..."
      initialValues={initialValues}
      onSubmit={handleSave}
      onCancel={() => router.back()}
    />
  );
}