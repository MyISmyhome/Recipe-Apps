
import React, { useState, useEffect, useRef } from 'react';
import { Stack, Link } from 'expo-router';
import { 
  ScrollView, 
  Pressable, 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSavedRecipes } from '@/contexts/SavedRecipesContext';
import { fetchRandomRecipes, searchRecipesByName, Recipe } from '@/services/mealDbApi';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isRecipeSaved } = useSavedRecipes();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsOpacity = useRef(new Animated.Value(0)).current;

  // Load initial recipes
  useEffect(() => {
    loadRecipes();
  }, []);

  // Handle search suggestions with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim() === '') {
      setShowSuggestions(false);
      setSuggestions([]);
      setFilteredRecipes(recipes);
      return;
    }

    // Show suggestions after 300ms of no typing
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Animate suggestions appearance
  useEffect(() => {
    if (showSuggestions) {
      Animated.timing(suggestionsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(suggestionsOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuggestions]);

  const fetchSuggestions = async (query: string) => {
    try {
      setLoadingSuggestions(true);
      console.log('Fetching suggestions for:', query);
      const results = await searchRecipesByName(query);
      
      // Limit to 5 suggestions
      const limitedResults = results.slice(0, 5);
      setSuggestions(limitedResults);
      setShowSuggestions(limitedResults.length > 0);
      console.log(`Found ${limitedResults.length} suggestions`);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setError(null);
      const fetchedRecipes = await fetchRandomRecipes(12);
      setRecipes(fetchedRecipes);
      setFilteredRecipes(fetchedRecipes);
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRecipes = async () => {
    if (loadingMore || searchQuery.trim() !== '') {
      return;
    }

    try {
      setLoadingMore(true);
      setError(null);
      console.log('Loading more recipes...');
      
      const moreRecipes = await fetchRandomRecipes(12);
      const updatedRecipes = [...recipes, ...moreRecipes];
      setRecipes(updatedRecipes);
      setFilteredRecipes(updatedRecipes);
      
      console.log(`Loaded ${moreRecipes.length} more recipes. Total: ${updatedRecipes.length}`);
    } catch (err) {
      console.error('Failed to load more recipes:', err);
      setError('Failed to load more recipes. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchQuery('');
    await loadRecipes();
    setRefreshing(false);
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      setShowSuggestions(false);
      setError(null);
      console.log('Searching for:', searchTerm);
      
      const searchResults = await searchRecipesByName(searchTerm);
      
      if (searchResults.length === 0) {
        setError(`No recipes found for "${searchTerm}"`);
        setFilteredRecipes([]);
      } else {
        setFilteredRecipes(searchResults);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (recipe: Recipe) => {
    setSearchQuery(recipe.title);
    setShowSuggestions(false);
    handleSearch(recipe.title);
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtonContainer}>
      <IconSymbol name="magnifyingglass" color={colors.primary} size={22} />
    </View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Recipes',
            headerRight: renderHeaderRight,
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {Platform.OS !== 'ios' && (
            <Text style={styles.pageTitle}>Recipes</Text>
          )}
          
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <IconSymbol name="magnifyingglass" color={colors.textSecondary} size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes from TheMealDB..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch()}
                returnKeyType="search"
              />
              {loadingSuggestions && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
              {searchQuery.length > 0 && !loadingSuggestions && (
                <Pressable onPress={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={20} />
                </Pressable>
              )}
            </View>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <Animated.View 
                style={[
                  styles.suggestionsContainer,
                  { opacity: suggestionsOpacity }
                ]}
              >
                {suggestions.map((recipe) => (
                  <Pressable
                    key={recipe.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(recipe)}
                  >
                    <Image 
                      source={{ uri: recipe.image }} 
                      style={styles.suggestionImage}
                    />
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {recipe.title}
                      </Text>
                      <Text style={styles.suggestionCategory}>
                        {recipe.category} • {recipe.area}
                      </Text>
                    </View>
                    <IconSymbol name="arrow.up.left" color={colors.textSecondary} size={16} />
                  </Pressable>
                ))}
              </Animated.View>
            )}
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading delicious recipes...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.triangle" color={colors.textSecondary} size={48} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={loadRecipes}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass" color={colors.textSecondary} size={48} />
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
                </Text>
                {searchQuery.trim() !== '' && (
                  <Pressable onPress={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}>
                    <Text style={styles.clearSearchText}>Clear search</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.recipesGrid}>
                {filteredRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
                    <Pressable style={styles.recipeCard}>
                      <Image 
                        source={{ uri: recipe.image }} 
                        style={styles.recipeImage}
                        resizeMode="cover"
                      />
                      {isRecipeSaved(recipe.id) && (
                        <View style={styles.savedBadge}>
                          <IconSymbol name="heart.fill" color={colors.primary} size={16} />
                        </View>
                      )}
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

              {searchQuery.trim() === '' && (
                <View style={styles.loadMoreContainer}>
                  <Pressable 
                    style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]}
                    onPress={loadMoreRecipes}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <ActivityIndicator size="small" color={colors.card} />
                        <Text style={styles.loadMoreButtonText}>Loading...</Text>
                      </>
                    ) : (
                      <>
                        <IconSymbol name="arrow.down.circle.fill" color={colors.card} size={20} />
                        <Text style={styles.loadMoreButtonText}>Load More Recipes</Text>
                      </>
                    )}
                  </Pressable>
                  <Text style={styles.loadMoreHint}>
                    Discover more delicious recipes from TheMealDB
                  </Text>
                </View>
              )}
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
  headerButtonContainer: {
    padding: 6,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    outlineStyle: 'none',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  suggestionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.highlight,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
    color: colors.textSecondary,
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
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
  loadMoreContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
    minWidth: 200,
  },
  loadMoreButtonDisabled: {
    opacity: 0.7,
  },
  loadMoreButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  loadMoreHint: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
