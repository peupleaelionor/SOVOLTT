// src/screens/auth/WelcomeScreen.tsx — Écran d'accueil Sovoltt
import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../theme';
import type { AuthScreenProps } from '../../navigation/types';

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* En-tête avec gradient simulé */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="sunny" size={64} color={colors.secondary} />
        </View>
        <Text style={styles.brand}>Sovoltt</Text>
        <Text style={styles.tagline}>L'énergie solaire pair-à-pair</Text>
      </View>

      {/* Description */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="sunny-outline" size={28} color={colors.secondary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Produisez & vendez</Text>
            <Text style={styles.featureDesc}>
              Vendez votre surplus solaire à vos voisins
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="flash-outline" size={28} color={colors.accent} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Consommez local</Text>
            <Text style={styles.featureDesc}>
              Achetez de l'énergie verte à prix juste
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="people-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Autoconsommation collective</Text>
            <Text style={styles.featureDesc}>
              Rejoignez une PMO et partagez l'énergie
            </Text>
          </View>
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actions}>
        <Button
          title="Créer un compte"
          onPress={() => navigation.navigate('Register')}
          variant="primary"
          size="large"
        />
        <Button
          title="J'ai déjà un compte"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          size="large"
        />
      </View>

      {/* Mention légale */}
      <Text style={styles.legal}>
        Autoconsommation collective · Art. L315-2 Code de l'énergie
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brand: {
    ...typography.h1,
    color: colors.textInverse,
    letterSpacing: 1,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  features: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  featureDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  legal: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    paddingBottom: spacing.xl,
  },
});
