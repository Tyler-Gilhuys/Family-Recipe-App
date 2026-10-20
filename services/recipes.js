import pb from "../pocketbaseConfig";

function requireUser(action) {
  const user = pb.authStore.record;

  if (!pb.authStore.isValid || !user?.id) {
    throw new Error(`You must log in to ${action}.`);
  }

  return user;
}

// Builds a multipart body so the text fields and the image travel together.
// ingredients, steps, and categories are JSON fields, so they go as JSON strings.
async function buildRecipeFormData(recipe, imageUri) {
  const response = await fetch(imageUri);

  if (!response.ok) {
    throw new Error(`Could not read image: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const formData = new FormData();

  formData.append("title", recipe.title);
  formData.append("comments", recipe.comments ?? "");
  formData.append("ingredients", JSON.stringify(recipe.ingredients ?? []));
  formData.append("steps", JSON.stringify(recipe.steps ?? []));
  formData.append("categories", JSON.stringify(recipe.categories ?? []));
  formData.append("image", blob, "recipe.jpg");

  return formData;
}

export async function createRecipe(recipe, imageUri = null) {
  if (!recipe) {
    throw new Error("No recipe data provided");
  }

  const user = requireUser("save a recipe");

  let data;
  if (imageUri) {
    data = await buildRecipeFormData(recipe, imageUri);
    data.append("author", user.id);
  } else {
    data = { ...recipe, author: user.id };
  }

  const record = await pb.collection("recipes").create(data);
  return record.id;
}

export async function updateRecipe(recipeId, recipe, imageUri = null) {
  if (!recipeId || !recipe) {
    throw new Error("Recipe ID and recipe data are required.");
  }

  requireUser("edit a recipe");

  const data = imageUri ? await buildRecipeFormData(recipe, imageUri) : recipe;

  return pb.collection("recipes").update(recipeId, data);
}

export async function deleteRecipe(recipeId) {
  if (!recipeId) {
    throw new Error("A recipe ID is required.");
  }

  requireUser("delete a recipe");

  await pb.collection("recipes").delete(recipeId);
  return true;
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