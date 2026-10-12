import pb from "../pocketbaseConfig";

export async function createRecipe(recipe) {
  try {
    if (!recipe) {
      throw new Error("No recipe data provided");
    }

    const user = pb.authStore.record;

    if (!pb.authStore.isValid || !user?.id) {
      throw new Error("You must log in to PocketBase before saving a recipe.");
    }

    const recipeData = {
      ...recipe,
      author: user.id,
    };

    const record = await pb.collection("recipes").create(recipeData);

    console.log("PocketBase recipe created:", record.id);
    console.log("Recipe author:", record.author);

    return record.id;
  } catch (error) {
    console.error("PocketBase createRecipe error:", error);
    throw error;
  }
}

export async function updateRecipe(recipeId, recipe) {
  try {
    if (!recipeId || !recipe) {
      throw new Error("Recipe ID and recipe data are required.");
    }

    if (!pb.authStore.isValid || !pb.authStore.record?.id) {
      throw new Error("You must log in to PocketBase before editing a recipe.");
    }

    const record = await pb.collection("recipes").update(recipeId, recipe);

    console.log("PocketBase recipe updated:", record.id);

    return record;
  } catch (error) {
    console.error("PocketBase updateRecipe error:", error);
    throw error;
  }
}


export async function deleteRecipe(recipeId) {
  if (!recipeId) {
    throw new Error("A recipe ID is required.");
  }

  if (!pb.authStore.isValid || !pb.authStore.record?.id) {
    throw new Error("You must log in to delete a recipe.");
  }

  try {
    await pb.collection("recipes").delete(recipeId);
    console.log("PocketBase recipe deleted:", recipeId);
    return true;
  } catch (error) {
    console.error("PocketBase deleteRecipe error:", error);
    throw error;
  }
}

