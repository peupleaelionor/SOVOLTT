// src/screens/onboarding/OnboardingStep2Screen.tsx — Géolocalisation
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../theme';
import { useLocation } from '../../hooks/useLocation';
import { useAuthStore } from '../../store/authStore';
import type { AuthScreenProps } from '../../navigation/types';

export function OnboardingStep2Screen({
  navigation,
}: AuthScreenProps<'OnboardingStep2'>) {
  const { location, loading, error, requestLocation } = useLocation();
  const { updateProfile } = useAuthStore();

  const handleRequestLocation = async () => {
    const loc = await requestLocation();
    if (loc) {
      try {
        await updateProfile({
          latitude: loc.latitude,
          longitude: loc.longitude,
          city: loc.city,
        } as never);
      } catch {
        // Continuer même si la sauvegarde échoue
      }
    }
  };

  const handleNext = () => {
    if (!location) {
      Alert.alert(
        'Position requise',
        'Votre position est nécessaire pour trouver les producteurs à proximité. Voulez-vous continuer sans ?',
        [
          { text: 'Réessayer', onPress: handleRequestLocation },
          { text: 'Continuer', onPress: () => navigation.navigate('OnboardingStep3') },
        ],
      );
      return;
    }
    navigation.navigate('OnboardingStep3');
  };

  return (
    <View style={styles.container}>
      {/* Indicateur de progression */}
      <View style={styles.progress}>
        <View style={styles.dotDone} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.step}>Étape 2 / 4</Text>
      <Text style={styles.title}>Votre localisation 📍</Text>
      <Text style={styles.subtitle}>
        Pour trouver les producteurs et PMO dans votre périmètre
      </Text>

      {/* Illustration */}
      <View style={styles.illustration}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={80} color={colors.primaryLight} />
          {location && (
            <View style={styles.pin}>
              <Ionicons name="location" size={32} color={colors.error} />
            </View>
          )}
        </View>
      </View>

      {/* Résultat de la géolocalisation */}
      {location ? (
        <View style={styles.locationResult}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <View>
            <Text style={styles.locationCity}>
              {location.city || 'Position détectée'}
            </Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.locationPrompt}>
          <Text style={styles.promptText}>
            {error || "Autorisez l'accès à votre position pour continuer"}
          </Text>
          <Button
            title="Activer la géolocalisation"
            onPress={handleRequestLocation}
            loading={loading}
            icon={<Ionicons name="navigate" size={20} color={colors.textInverse} />}
          />
        </View>
      )}

      {/* Info réglementaire */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          Le périmètre d'autoconsommation collective est de 2 km en zone urbaine,
          10 km en périurbain et 20 km en zone rurale.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title="Continuer" onPress={handleNext} size="large" />
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
  illustration: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  mapPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    position: 'absolute',
    top: 60,
  },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  locationCity: {
    ...typography.bodyBold,
    color: colors.text,
  },
  locationCoords: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationPrompt: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  promptText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    ...typography.bodySmall,
    color: '#1E40AF',
    flex: 1,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
});
