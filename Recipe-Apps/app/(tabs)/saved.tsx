
import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, Link } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSavedRecipes } from '@/contexts/SavedRecipesContext';
import { getRecipeById, Recipe } from '@/services/mealDbApi';

export default function SavedRecipesScreen() {
  const { savedRecipeIds } = useSavedRecipes();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedRecipes();
  }, [savedRecipeIds]);

  const loadSavedRecipes = async () => {
    if (savedRecipeIds.length === 0) {
      setSavedRecipes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const recipePromises = savedRecipeIds.map(id => getRecipeById(id));
      const recipes = await Promise.all(recipePromises);
      const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);
      setSavedRecipes(validRecipes);
    } catch (error) {
      console.error('Failed to load saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Saved Recipes',
          headerLargeTitle: Platform.OS === 'ios',
        }}
      />
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Platform.OS !== 'ios' && (
            <Text style={styles.pageTitle}>Saved Recipes</Text>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading saved recipes...</Text>
            </View>
          ) : savedRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="heart" color={colors.textSecondary} size={64} />
              <Text style={styles.emptyTitle}>No Saved Recipes</Text>
              <Text style={styles.emptyText}>
                Start saving your favorite recipes to see them here
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{savedRecipes.length}</Text>
                  <Text style={styles.statLabel}>Saved Recipes</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {new Set(savedRecipes.map(r => r.category)).size}
                  </Text>
                  <Text style={styles.statLabel}>Categories</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {new Set(savedRecipes.map(r => r.area)).size}
                  </Text>
                  <Text style={styles.statLabel}>Cuisines</Text>
                </View>
              </View>

              <View style={styles.recipesGrid}>
                {savedRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
                    <Pressable style={styles.recipeCard}>
                      <Image 
                        source={{ uri: recipe.image }} 
                        style={styles.recipeImage}
                        resizeMode="cover"
                      />
                      <View style={styles.savedBadge}>
                        <IconSymbol name="heart.fill" color={colors.primary} size={16} />
                      </View>
                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeTitle} numberOfLines={2}>
                          {recipe.title}
                        </Text>
                        <Text style={styles.recipeCategory}>{recipe.category}</Text>
                        <View style={styles.recipeMetaRow}>
                          <View style={styles.metaItem}>
                            <IconSymbol name="globe" color={colors.textSecondary} size={14} />
                            <Text style={styles.metaText}>{recipe.area}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <IconSymbol name="star.fill" color={colors.accent} size={14} />
                            <Text style={styles.metaText}>{recipe.rating.toFixed(1)}</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.highlight,
  },
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  recipeCategory: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
