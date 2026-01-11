import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Creates a new recipe document in Firestore
 * @param {Object} recipe - Recipe data
 * @returns {Promise<string>} - The Firestore document ID
 */
export async function createRecipe(recipe) {
  try {
    if (!recipe) throw new Error("No recipe data provided");

    const docRef = await addDoc(collection(db, "recipes"), {
      ...recipe,
      createdAt: serverTimestamp(),
    });

    console.log("Recipe created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("createRecipe error:", error);
    throw error;
  }
}
