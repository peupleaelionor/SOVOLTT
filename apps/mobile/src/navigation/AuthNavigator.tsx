// src/navigation/AuthNavigator.tsx — Navigateur d'authentification
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingStep1Screen } from '../screens/onboarding/OnboardingStep1Screen';
import { OnboardingStep2Screen } from '../screens/onboarding/OnboardingStep2Screen';
import { OnboardingStep3Screen } from '../screens/onboarding/OnboardingStep3Screen';
import { OnboardingStep4Screen } from '../screens/onboarding/OnboardingStep4Screen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />
      <Stack.Screen name="OnboardingStep4" component={OnboardingStep4Screen} />
    </Stack.Navigator>
  );
}
