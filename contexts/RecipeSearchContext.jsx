
import React, { createContext, useContext, useState } from "react";

const RecipeSearchContext = createContext(null);

export function RecipeSearchProvider({ children }) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <RecipeSearchContext.Provider
            value={{ searchQuery, setSearchQuery }}
        >
            {children}
        </RecipeSearchContext.Provider>
    );
}

export function useRecipeSearch() {
    const context = useContext(RecipeSearchContext);

    if (!context) {
        throw new Error(
            "useRecipeSearch must be used inside RecipeSearchProvider"
        );
    }

    return context;
}
