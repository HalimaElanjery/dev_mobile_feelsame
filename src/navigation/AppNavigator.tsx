/**
 * Navigateur principal de l'application
 * Gère la navigation conditionnelle basée sur l'authentification
 */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { NotificationContainer } from '../components/NotificationContainer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActionSelectionScreen } from '../screens/ActionSelectionScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { EmotionSelectionScreen } from '../screens/EmotionSelectionScreen';
import { EmotionSpaceScreen } from '../screens/EmotionSpaceScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MatchRequestsScreen } from '../screens/MatchRequestsScreen';
import { MyNotesScreen } from '../screens/MyNotesScreen';
import { PrivateChatScreen } from '../screens/PrivateChatScreen';
import { PrivateDiscussionsScreen } from '../screens/PrivateDiscussionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WriteNoteScreen } from '../screens/WriteNoteScreen';
import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  EmotionSelection: undefined;
  ActionSelection: undefined;
  WriteNote: undefined;
  EmotionSpace: undefined;
  Chat: { discussionId: string };
  Feedback: undefined;
  MyNotes: undefined;
  PrivateChat: { discussionId: string };
  MatchRequests: undefined;
  PrivateDiscussions: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Stack d'authentification (Login, Register)
const AuthStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Stack principal de l'application (après authentification)
const AppStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface || '#FFFFFF',
          borderBottomColor: colors.border || '#E5E5EA',
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text || '#000000',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Navigation par onglets comme écran principal */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Écrans modaux et secondaires */}
      <Stack.Screen
        name="MyNotes"
        component={MyNotesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmotionSelection"
        component={EmotionSelectionScreen}
        options={{
          title: 'Choisir une émotion',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ActionSelection"
        component={ActionSelectionScreen}
        options={{
          title: 'Que souhaitez-vous faire ?',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="WriteNote"
        component={WriteNoteScreen}
        options={{
          title: 'Écrire une note',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EmotionSpace"
        component={EmotionSpaceScreen}
        options={{ title: 'Espace émotionnel' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Discussion de groupe',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="PrivateChat"
        component={PrivateChatScreen}
        options={{
          title: 'Discussion privée',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: 'Feedback',
          headerBackTitle: 'Retour',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="MatchRequests"
        component={MatchRequestsScreen}
        options={{ title: 'Demandes de match' }}
      />
      <Stack.Screen
        name="PrivateDiscussions"
        component={PrivateDiscussionsScreen}
        options={{ title: 'Discussions privées' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Mon Profil',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Écran de chargement
const LoadingScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Chargement...
      </Text>
    </View>
  );
};

// Navigateur principal avec logique d'authentification
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ConnectionStatus />
      <NavigationContainer>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
      <NotificationContainer />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

