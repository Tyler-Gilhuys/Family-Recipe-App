import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

/**
 * Uploads a local image URI (from Expo ImagePicker) to Firebase Storage.
 * @param {string} uri - Local file URI (file:///…)
 * @param {string} recipeId - Firestore recipe document ID
 * @returns {Promise<string>} - Download URL
 */
export async function uploadRecipeImage(uri, recipeId) {
  try {
    if (!uri) throw new Error("No image URI provided");

    // Convert local file URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Firebase Storage reference
    const imageRef = ref(storage, `recipe-images/${recipeId}.jpg`);

    // Upload blob
    await uploadBytes(imageRef, blob);

    // Get download URL
    const downloadUrl = await getDownloadURL(imageRef);
    console.log("Image uploaded, download URL:", downloadUrl);

    return downloadUrl;
  } catch (error) {
    console.error("uploadRecipeImage error:", error);
    throw error;
  }
}

/**
 * Updates the Firestore document with the image URL
 */
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function updateRecipeImage(recipeId, imageUrl) {
  try {
    const docRef = doc(db, "recipes", recipeId);
    await updateDoc(docRef, { imageUrl });
    console.log("Recipe image updated in Firestore:", recipeId);
  } catch (error) {
    console.error("updateRecipeImage error:", error);
    throw error;
  }
}
