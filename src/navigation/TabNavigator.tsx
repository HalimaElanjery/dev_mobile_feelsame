/**
 * Navigateur par onglets pour les principales fonctionnalités
 * Permet un accès facile aux sections importantes de l'application
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { TabBadge } from '../components/TabBadge';
import { useTheme } from '../context/ThemeContext';
import { useMatchRequests } from '../hooks/useMatchRequests';
import { HomeScreen } from '../screens/HomeScreen';
import { MatchRequestsScreen } from '../screens/MatchRequestsScreen';
import { PrivateDiscussionsScreen } from '../screens/PrivateDiscussionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type TabParamList = {
  HomeTab: undefined;
  MatchRequestsTab: undefined;
  PrivateDiscussionsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { pendingCount } = useMatchRequests();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MatchRequestsTab':
              iconName = focused ? 'mail' : 'mail-outline';
              break;
            case 'PrivateDiscussionsTab':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          const IconComponent = () => (
            <View style={{ position: 'relative' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'MatchRequestsTab' && (
                <TabBadge 
                  count={pendingCount} 
                  show={pendingCount > 0}
                  color="#FF3B30"
                />
              )}
            </View>
          );

          return <IconComponent />;
        },
        tabBarActiveTintColor: colors.primary || '#007AFF',
        tabBarInactiveTintColor: colors.textSecondary || '#8E8E93',
        tabBarStyle: {
          backgroundColor: colors.surface || '#FFFFFF',
          borderTopColor: colors.border || '#E5E5EA',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
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
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          headerShown: false, // HomeScreen gère son propre header
        }}
      />
      <Tab.Screen
        name="MatchRequestsTab"
        component={MatchRequestsScreen}
        options={{
          title: 'Demandes',
          headerTitle: 'Demandes de discussion',
        }}
      />
      <Tab.Screen
        name="PrivateDiscussionsTab"
        component={PrivateDiscussionsScreen}
        options={{
          title: 'Discussions',
          headerTitle: 'Discussions privées',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          headerShown: false, // ProfileScreen gère son propre header
        }}
      />
    </Tab.Navigator>
  );
};