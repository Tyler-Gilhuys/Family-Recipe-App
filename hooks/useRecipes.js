import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import pb from "../pocketbaseConfig";

// Loads recipes (newest first) every time the screen comes into focus.
// Pass { category } to keep only recipes tagged with that category.
export function useRecipes({ category } = {}) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const load = async () => {
                try {
                    if (!pb.authStore.isValid) {
                        if (active) setRecipes([]);
                        return;
                    }

                    const records = await pb.collection("recipes").getFullList({
                        sort: "-created",
                        requestKey: null,
                    });

                    const list = records
                        .filter(
                            (record) => !category || record.categories?.includes(category)
                        )
                        .map((record) => ({
                            id: record.id,
                            title: record.title,
                            imageUrl: record.image
                                ? pb.files.getURL(record, record.image)
                                : null,
                            categories: record.categories || [],
                        }));

                    if (active) setRecipes(list);
                } catch (error) {
                    console.error("Error fetching recipes:", error);
                } finally {
                    if (active) setLoading(false);
                }
            };

            load();

            return () => {
                active = false;
            };
        }, [category])
    );

    return { recipes, loading };
}