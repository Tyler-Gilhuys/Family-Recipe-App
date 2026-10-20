import { useRouter } from "expo-router";
import RecipeForm from "../components/RecipeForm";
import { createRecipe } from "../services/recipes";
import { showMessage } from "../utils/showMessage";


export default function AddRecipe() {
  const router = useRouter();

  const handleSubmit = async ({ recipe, imageUri }) => {
    await createRecipe(recipe, imageUri);

    showMessage("Success", "Recipe saved successfully!");
    router.replace("/recipe");
  };

  return (
    <RecipeForm
      heading="Add a Recipe"
      helperText="Add your recipe details, ingredients, and preparation steps below."
      submitLabel="Save Recipe"
      savingLabel="Saving recipe..."
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}