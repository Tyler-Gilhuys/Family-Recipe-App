import pb from "../pocketbaseConfig";

function requireUser(action) {
  const user = pb.authStore.record;

  if (!pb.authStore.isValid || !user?.id) {
    throw new Error(`You must log in to ${action}.`);
  }

  return user;
}

export async function createRecipe(recipe) {
  if (!recipe) {
    throw new Error("No recipe data provided");
  }

  const user = requireUser("save a recipe");

  const record = await pb.collection("recipes").create({
    ...recipe,
    author: user.id,
  });

  return record.id;
}

export async function updateRecipe(recipeId, recipe) {
  if (!recipeId || !recipe) {
    throw new Error("Recipe ID and recipe data are required.");
  }

  requireUser("edit a recipe");

  return pb.collection("recipes").update(recipeId, recipe);
}

export async function deleteRecipe(recipeId) {
  if (!recipeId) {
    throw new Error("A recipe ID is required.");
  }

  requireUser("delete a recipe");

  await pb.collection("recipes").delete(recipeId);
  return true;
}

/**
 * Uploads a recipe image to the image field of an existing recipe.
 */
export async function uploadRecipeImage(uri, recipeId) {
  if (!uri || !recipeId) {
    throw new Error("An image URI and recipe ID are required.");
  }

  requireUser("upload an image");

  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`Could not read image: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const formData = new FormData();
  formData.append("image", blob, `recipe-${recipeId}.jpg`);

  return pb.collection("recipes").update(recipeId, formData);
}

export async function getComments(recipeId) {
  return pb.collection("recipe_comments").getFullList({
    filter: pb.filter("recipe = {:id}", { id: recipeId }),
    sort: "created",
    expand: "author",
    requestKey: null,
  });
}

export async function addComment(recipeId, text) {
  const user = requireUser("comment");

  return pb.collection("recipe_comments").create({
    recipe: recipeId,
    author: user.id,
    text: text.trim(),
  });
}

export async function deleteComment(commentId) {
  requireUser("delete a comment");
  return pb.collection("recipe_comments").delete(commentId);
}