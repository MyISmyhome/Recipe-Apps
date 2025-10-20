
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSavedRecipes } from '@/contexts/SavedRecipesContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const { savedRecipeIds } = useSavedRecipes();
  const { user, signOut, isConfigured } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('Success', 'You have been signed out');
          },
        },
      ]
    );
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Profile',
            headerLargeTitle: true,
          }}
        />
      )}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          Platform.OS !== 'ios' && styles.contentWithTabBar
        ]}
      >
        {Platform.OS !== 'ios' && (
          <Text style={styles.pageTitle}>Profile</Text>
        )}

        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <IconSymbol 
                name={user ? 'person.fill' : 'person.crop.circle'} 
                color={colors.primary} 
                size={48} 
              />
            </View>
            <View style={styles.userInfo}>
              {user ? (
                <>
                  <Text style={styles.userName}>Welcome back!</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.userName}>Guest User</Text>
                  <Text style={styles.userEmail}>Sign in to sync your recipes</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <IconSymbol name="heart.fill" color={colors.primary} size={32} />
              <Text style={styles.statNumber}>{savedRecipeIds.length}</Text>
              <Text style={styles.statLabel}>Saved Recipes</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="book.fill" color={colors.accent} size={32} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {!isConfigured && (
            <View style={styles.warningCard}>
              <IconSymbol name="exclamationmark.triangle.fill" color={colors.accent} size={24} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Supabase Not Configured</Text>
                <Text style={styles.warningText}>
                  Enable Supabase to use authentication features. Press the Supabase button and connect to a project.
                </Text>
              </View>
            </View>
          )}

          {user ? (
            <>
              <Pressable style={styles.menuItem}>
                <IconSymbol name="person.circle" color={colors.text} size={24} />
                <Text style={styles.menuItemText}>Edit Profile</Text>
                <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
              </Pressable>

              <Pressable style={styles.menuItem}>
                <IconSymbol name="bell" color={colors.text} size={24} />
                <Text style={styles.menuItemText}>Notifications</Text>
                <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
              </Pressable>

              <Pressable style={styles.menuItem}>
                <IconSymbol name="lock" color={colors.text} size={24} />
                <Text style={styles.menuItemText}>Privacy & Security</Text>
                <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
              </Pressable>

              <Pressable style={[styles.menuItem, styles.signOutButton]} onPress={handleSignOut}>
                <IconSymbol name="arrow.right.square" color={colors.primary} size={24} />
                <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.signInButton} onPress={handleSignIn}>
              <IconSymbol name="person.crop.circle.badge.checkmark" color={colors.card} size={24} />
              <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
            </Pressable>
          )}
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <Pressable style={styles.menuItem}>
            <IconSymbol name="info.circle" color={colors.text} size={24} />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <IconSymbol name="doc.text" color={colors.text} size={24} />
            <Text style={styles.menuItemText}>Terms & Conditions</Text>
            <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
          </Pressable>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Recipe App v1.0.0</Text>
            <Text style={styles.versionSubtext}>Powered by TheMealDB</Text>
          </View>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  contentWithTabBar: {
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  signOutButton: {
    marginTop: 8,
  },
  signOutText: {
    color: colors.primary,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
