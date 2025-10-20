
// TheMealDB API Service
// API Documentation: https://www.themealdb.com/api.php

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export interface MealDbRecipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string;
  // Ingredients (up to 20)
  strIngredient1: string;
  strIngredient2: string;
  strIngredient3: string;
  strIngredient4: string;
  strIngredient5: string;
  strIngredient6: string;
  strIngredient7: string;
  strIngredient8: string;
  strIngredient9: string;
  strIngredient10: string;
  strIngredient11: string;
  strIngredient12: string;
  strIngredient13: string;
  strIngredient14: string;
  strIngredient15: string;
  strIngredient16: string;
  strIngredient17: string;
  strIngredient18: string;
  strIngredient19: string;
  strIngredient20: string;
  // Measures (up to 20)
  strMeasure1: string;
  strMeasure2: string;
  strMeasure3: string;
  strMeasure4: string;
  strMeasure5: string;
  strMeasure6: string;
  strMeasure7: string;
  strMeasure8: string;
  strMeasure9: string;
  strMeasure10: string;
  strMeasure11: string;
  strMeasure12: string;
  strMeasure13: string;
  strMeasure14: string;
  strMeasure15: string;
  strMeasure16: string;
  strMeasure17: string;
  strMeasure18: string;
  strMeasure19: string;
  strMeasure20: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  steps: string[];
  category: string;
  rating: number;
  area: string;
  tags: string[];
  youtubeUrl?: string;
}

// Convert MealDB recipe to our app's recipe format
export function convertMealDbRecipe(meal: MealDbRecipe): Recipe {
  // Extract ingredients and measures
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDbRecipe];
    const measure = meal[`strMeasure${i}` as keyof MealDbRecipe];
    
    if (ingredient && ingredient.trim()) {
      const formattedIngredient = measure && measure.trim() 
        ? `${measure.trim()} ${ingredient.trim()}`
        : ingredient.trim();
      ingredients.push(formattedIngredient);
    }
  }

  // Split instructions into steps
  const steps = meal.strInstructions
    .split(/\r?\n/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim());

  // Parse tags
  const tags = meal.strTags ? meal.strTags.split(',').map(tag => tag.trim()) : [];

  // Estimate difficulty based on number of ingredients
  let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  if (ingredients.length <= 5) {
    difficulty = 'Easy';
  } else if (ingredients.length >= 12) {
    difficulty = 'Hard';
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    description: `Delicious ${meal.strArea} ${meal.strCategory.toLowerCase()} dish`,
    image: meal.strMealThumb,
    prepTime: '15 min',
    cookTime: '30 min',
    servings: 4,
    difficulty,
    ingredients,
    steps,
    category: meal.strCategory,
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    area: meal.strArea,
    tags,
    youtubeUrl: meal.strYoutube || undefined,
  };
}

// Fetch random recipes
export async function fetchRandomRecipes(count: number = 12): Promise<Recipe[]> {
  try {
    console.log(`Fetching ${count} random recipes from TheMealDB...`);
    const promises = Array(count).fill(null).map(() => 
      fetch(`${BASE_URL}/random.php`).then(res => res.json())
    );
    
    const results = await Promise.all(promises);
    const recipes = results
      .filter(result => result.meals && result.meals[0])
      .map(result => convertMealDbRecipe(result.meals[0]));
    
    console.log(`Successfully fetched ${recipes.length} recipes`);
    return recipes;
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    throw error;
  }
}

// Search recipes by name
export async function searchRecipesByName(query: string): Promise<Recipe[]> {
  try {
    console.log(`Searching recipes for: ${query}`);
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data.meals) {
      console.log('No recipes found');
      return [];
    }
    
    const recipes = data.meals.map((meal: MealDbRecipe) => convertMealDbRecipe(meal));
    console.log(`Found ${recipes.length} recipes`);
    return recipes;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

// Get recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    console.log(`Fetching recipe with ID: ${id}`);
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    
    if (!data.meals || !data.meals[0]) {
      console.log('Recipe not found');
      return null;
    }
    
    const recipe = convertMealDbRecipe(data.meals[0]);
    console.log(`Successfully fetched recipe: ${recipe.title}`);
    return recipe;
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    throw error;
  }
}

// Get recipes by category
export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  try {
    console.log(`Fetching recipes in category: ${category}`);
    const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();
    
    if (!data.meals) {
      console.log('No recipes found in category');
      return [];
    }
    
    // Note: This endpoint returns limited data, so we need to fetch full details
    const detailPromises = data.meals.slice(0, 12).map((meal: { idMeal: string }) => 
      getRecipeById(meal.idMeal)
    );
    
    const recipes = await Promise.all(detailPromises);
    const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);
    console.log(`Found ${validRecipes.length} recipes in category`);
    return validRecipes;
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    throw error;
  }
}

// Get all categories
export async function getCategories(): Promise<string[]> {
  try {
    console.log('Fetching categories...');
    const response = await fetch(`${BASE_URL}/categories.php`);
    const data = await response.json();
    
    if (!data.categories) {
      return [];
    }
    
    const categories = data.categories.map((cat: { strCategory: string }) => cat.strCategory);
    console.log(`Found ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Get recipes by area/cuisine
export async function getRecipesByArea(area: string): Promise<Recipe[]> {
  try {
    console.log(`Fetching recipes from area: ${area}`);
    const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
    const data = await response.json();
    
    if (!data.meals) {
      console.log('No recipes found for area');
      return [];
    }
    
    // Fetch full details for first 12 recipes
    const detailPromises = data.meals.slice(0, 12).map((meal: { idMeal: string }) => 
      getRecipeById(meal.idMeal)
    );
    
    const recipes = await Promise.all(detailPromises);
    const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);
    console.log(`Found ${validRecipes.length} recipes from area`);
    return validRecipes;
  } catch (error) {
    console.error('Error fetching recipes by area:', error);
    throw error;
  }
}
