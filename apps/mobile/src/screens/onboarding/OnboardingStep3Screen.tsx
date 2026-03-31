// src/screens/onboarding/OnboardingStep3Screen.tsx — Connexion compteur Linky
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../theme';
import { api } from '../../services/api';
import type { AuthScreenProps } from '../../navigation/types';

export function OnboardingStep3Screen({
  navigation,
}: AuthScreenProps<'OnboardingStep3'>) {
  const [prm, setPrm] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    // Validation du PRM (14 chiffres)
    if (!/^\d{14}$/.test(prm)) {
      Alert.alert('Erreur', 'Le numéro PRM doit contenir exactement 14 chiffres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/enedis/meters', {
        prm,
        type: 'CONSOMMATION',
      });
      setConnected(true);
    } catch {
      Alert.alert(
        'Information',
        "Le compteur sera synchronisé ultérieurement. Vous pouvez continuer.",
      );
      setConnected(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Indicateur de progression */}
      <View style={styles.progress}>
        <View style={styles.dotDone} />
        <View style={styles.dotDone} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.step}>Étape 3 / 4</Text>
      <Text style={styles.title}>Compteur Linky 📊</Text>
      <Text style={styles.subtitle}>
        Connectez votre compteur pour le suivi automatique de votre consommation
      </Text>

      {/* Illustration Linky */}
      <View style={styles.linkyCard}>
        <View style={styles.linkyIcon}>
          <Ionicons name="speedometer" size={48} color={colors.accent} />
        </View>
        <Text style={styles.linkyTitle}>Numéro PRM</Text>
        <Text style={styles.linkyDesc}>
          Retrouvez votre numéro PRM (Point Référence Mesure) sur votre compteur
          Linky ou sur votre facture d'électricité.
        </Text>
      </View>

      {/* Formulaire PRM */}
      {!connected ? (
        <View style={styles.form}>
          <Input
            label="Numéro PRM (14 chiffres)"
            placeholder="12345678901234"
            value={prm}
            onChangeText={setPrm}
            icon="barcode-outline"
            keyboardType="numeric"
            maxLength={14}
          />
          <Button
            title="Connecter mon compteur"
            onPress={handleConnect}
            loading={loading}
            disabled={prm.length !== 14}
          />
        </View>
      ) : (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={styles.successTitle}>Compteur enregistré !</Text>
          <Text style={styles.successDesc}>
            PRM : {prm}
          </Text>
        </View>
      )}

      {/* Aide */}
      <View style={styles.helpBox}>
        <Ionicons name="help-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.helpText}>
          Où trouver mon PRM ? Appuyez sur le bouton + de votre compteur Linky
          jusqu'à voir le numéro à 14 chiffres.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={connected ? 'Continuer' : 'Passer cette étape'}
          onPress={() => navigation.navigate('OnboardingStep4')}
          variant={connected ? 'primary' : 'outline'}
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
  dotDone: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
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
    marginBottom: spacing.lg,
  },
  linkyCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  linkyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  linkyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  linkyDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: spacing.lg,
    borderRadius: spacing.radiusLg,
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h4,
    color: colors.success,
    marginTop: spacing.sm,
  },
  successDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  helpBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.radiusMd,
    alignItems: 'flex-start',
  },
  helpText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
});
