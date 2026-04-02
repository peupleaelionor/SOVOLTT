// src/screens/onboarding/OnboardingStep1Screen.tsx — Choix du rôle
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import type { AuthScreenProps } from '../../navigation/types';

type Role = 'PRODUCTEUR' | 'CONSOMMATEUR';

export function OnboardingStep1Screen({
  navigation,
}: AuthScreenProps<'OnboardingStep1'>) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { updateProfile } = useAuthStore();

  const handleNext = async () => {
    if (!selectedRole) return;
    try {
      await updateProfile({ role: selectedRole } as never);
      navigation.navigate('OnboardingStep2');
    } catch {
      navigation.navigate('OnboardingStep2');
    }
  };

  return (
    <View style={styles.container}>
      {/* Indicateur de progression */}
      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.step}>Étape 1 / 4</Text>
      <Text style={styles.title}>Quel est votre rôle ? 🌞</Text>
      <Text style={styles.subtitle}>
        Vous pourrez toujours changer plus tard
      </Text>

      {/* Choix producteur */}
      <TouchableOpacity
        style={[
          styles.roleCard,
          selectedRole === 'PRODUCTEUR' && styles.roleCardActive,
        ]}
        onPress={() => setSelectedRole('PRODUCTEUR')}
        activeOpacity={0.7}
      >
        <View style={[styles.roleIcon, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="sunny" size={40} color={colors.secondary} />
        </View>
        <Text style={styles.roleTitle}>☀️ Producteur</Text>
        <Text style={styles.roleDesc}>
          J'ai des panneaux solaires et je souhaite vendre mon surplus d'électricité
        </Text>
        {selectedRole === 'PRODUCTEUR' && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Choix consommateur */}
      <TouchableOpacity
        style={[
          styles.roleCard,
          selectedRole === 'CONSOMMATEUR' && styles.roleCardActive,
        ]}
        onPress={() => setSelectedRole('CONSOMMATEUR')}
        activeOpacity={0.7}
      >
        <View style={[styles.roleIcon, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="flash" size={40} color={colors.info} />
        </View>
        <Text style={styles.roleTitle}>⚡ Consommateur</Text>
        <Text style={styles.roleDesc}>
          Je souhaite acheter de l'énergie solaire locale à prix avantageux
        </Text>
        {selectedRole === 'CONSOMMATEUR' && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Button
          title="Continuer"
          onPress={handleNext}
          disabled={!selectedRole}
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  step: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  roleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
});
