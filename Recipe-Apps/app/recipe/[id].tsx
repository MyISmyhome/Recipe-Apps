
import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Pressable,
  Platform,
  Share,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSavedRecipes } from '@/contexts/SavedRecipesContext';
import { getRecipeById, Recipe } from '@/services/mealDbApi';
import * as Haptics from 'expo-haptics';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isRecipeSaved, toggleSaveRecipe } = useSavedRecipes();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    if (typeof id !== 'string') {
      setError('Invalid recipe ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedRecipe = await getRecipeById(id);
      
      if (!fetchedRecipe) {
        setError('Recipe not found');
      } else {
        setRecipe(fetchedRecipe);
      }
    } catch (err) {
      console.error('Failed to load recipe:', err);
      setError('Failed to load recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!recipe) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleSaveRecipe(recipe.id);
  };

  const handleShare = async () => {
    if (!recipe) return;

    try {
      const message = `Check out this recipe: ${recipe.title}\n\n${recipe.description}`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: recipe.title,
            text: message,
          });
        } else {
          Alert.alert('Share', 'Sharing is not supported on this browser');
        }
      } else {
        await Share.share({
          message: message,
          title: recipe.title,
        });
      }
    } catch (error) {
      console.log('Error sharing recipe:', error);
    }
  };

  const handleWatchVideo = () => {
    if (recipe?.youtubeUrl) {
      Linking.openURL(recipe.youtubeUrl);
    }
  };

  const renderHeaderRight = () => {
    if (!recipe) return null;

    const isSaved = isRecipeSaved(recipe.id);

    return (
      <View style={styles.headerActions}>
        <Pressable onPress={handleShare} style={styles.headerButton}>
          <IconSymbol name="square.and.arrow.up" color={colors.primary} size={22} />
        </Pressable>
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <IconSymbol 
            name={isSaved ? "heart.fill" : "heart"} 
            color={isSaved ? colors.primary : colors.text} 
            size={22} 
          />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: '',
            headerTransparent: Platform.OS === 'ios',
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </>
    );
  }

  if (error || !recipe) {
    return (
      <>
        <Stack.Screen
          options={{
            title: '',
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" color={colors.textSecondary} size={48} />
          <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
          <Pressable style={styles.retryButton} onPress={loadRecipe}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const isSaved = isRecipeSaved(recipe.id);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: Platform.OS === 'ios',
          headerRight: renderHeaderRight,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{recipe.category}</Text>
              </View>
              <View style={styles.areaBadge}>
                <IconSymbol name="globe" color={colors.card} size={12} />
                <Text style={styles.areaText}>{recipe.area}</Text>
              </View>
            </View>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description}>{recipe.description}</Text>
            
            {recipe.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaCard}>
              <IconSymbol name="clock" color={colors.primary} size={24} />
              <Text style={styles.metaLabel}>Prep</Text>
              <Text style={styles.metaValue}>{recipe.prepTime}</Text>
            </View>
            <View style={styles.metaCard}>
              <IconSymbol name="flame" color={colors.primary} size={24} />
              <Text style={styles.metaLabel}>Cook</Text>
              <Text style={styles.metaValue}>{recipe.cookTime}</Text>
            </View>
            <View style={styles.metaCard}>
              <IconSymbol name="person.2" color={colors.primary} size={24} />
              <Text style={styles.metaLabel}>Servings</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
            <View style={styles.metaCard}>
              <IconSymbol name="chart.bar" color={colors.primary} size={24} />
              <Text style={styles.metaLabel}>Level</Text>
              <Text style={styles.metaValue}>{recipe.difficulty}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="list.bullet" color={colors.primary} size={24} />
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="list.number" color={colors.primary} size={24} />
              <Text style={styles.sectionTitle}>Instructions</Text>
            </View>
            <View style={styles.stepsList}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.actionButton, styles.saveButton, isSaved && styles.savedButton]}
              onPress={handleSave}
            >
              <IconSymbol 
                name={isSaved ? "heart.fill" : "heart"} 
                color={colors.card} 
                size={20} 
              />
              <Text style={styles.actionButtonText}>
                {isSaved ? 'Saved' : 'Save Recipe'}
              </Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
              <IconSymbol name="square.and.arrow.up" color={colors.card} size={20} />
              <Text style={styles.actionButtonText}>Share</Text>
            </Pressable>
          </View>

          {recipe.youtubeUrl && (
            <Pressable style={styles.videoButton} onPress={handleWatchVideo}>
              <IconSymbol name="play.circle.fill" color={colors.card} size={24} />
              <Text style={styles.videoButtonText}>Watch Video Tutorial</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.highlight,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  areaBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  areaText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  metaCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  ingredientsList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  savedButton: {
    backgroundColor: colors.secondary,
  },
  shareButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  videoButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
});
