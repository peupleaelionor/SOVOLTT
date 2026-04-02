// src/navigation/MainNavigator.tsx — Navigation principale avec onglets
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { colors } from '../theme';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { MarketplaceScreen } from '../screens/marketplace/MarketplaceScreen';
import { ProductionScreen } from '../screens/production/ProductionScreen';
import { PMOScreen } from '../screens/pmo/PMOScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Marketplace':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Production':
              iconName = focused ? 'sunny' : 'sunny-outline';
              break;
            case 'PMO':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ tabBarLabel: 'Marché' }}
      />
      <Tab.Screen
        name="Production"
        component={ProductionScreen}
        options={{ tabBarLabel: 'Production' }}
      />
      <Tab.Screen
        name="PMO"
        component={PMOScreen}
        options={{ tabBarLabel: 'PMO' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}
