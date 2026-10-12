import pb from "../pocketbaseConfig";

/**
 * Uploads a recipe image to the image field of an existing PocketBase recipe.
 */
export async function uploadRecipeImage(uri, recipeId) {
  if (!uri || !recipeId) {
    throw new Error("An image URI and recipe ID are required.");
  }

  try {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error(`Could not read image: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const formData = new FormData();

    formData.append("image", blob, `recipe-${recipeId}.jpg`);

    const updatedRecord = await pb
      .collection("recipes")
      .update(recipeId, formData);

    console.log("Recipe image uploaded:", updatedRecord.id);
    return updatedRecord;
  } catch (error) {
    console.error("PocketBase image upload error:", error);
    throw error;
  }
}
