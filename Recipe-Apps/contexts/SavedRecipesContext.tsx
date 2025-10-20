
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedRecipesContextType {
  savedRecipeIds: string[];
  toggleSaveRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

const STORAGE_KEY = '@saved_recipes';

export function SavedRecipesProvider({ children }: { children: React.ReactNode }) {
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  // Load saved recipes from storage on mount
  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedRecipeIds(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading saved recipes:', error);
    }
  };

  const toggleSaveRecipe = async (recipeId: string) => {
    try {
      let newSavedIds: string[];
      
      if (savedRecipeIds.includes(recipeId)) {
        // Remove from saved
        newSavedIds = savedRecipeIds.filter(id => id !== recipeId);
      } else {
        // Add to saved
        newSavedIds = [...savedRecipeIds, recipeId];
      }
      
      setSavedRecipeIds(newSavedIds);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedIds));
    } catch (error) {
      console.log('Error saving recipe:', error);
    }
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  };

  return (
    <SavedRecipesContext.Provider value={{ savedRecipeIds, toggleSaveRecipe, isRecipeSaved }}>
      {children}
    </SavedRecipesContext.Provider>
  );
}

export function useSavedRecipes() {
  const context = useContext(SavedRecipesContext);
  if (!context) {
    throw new Error('useSavedRecipes must be used within SavedRecipesProvider');
  }
  return context;
}
