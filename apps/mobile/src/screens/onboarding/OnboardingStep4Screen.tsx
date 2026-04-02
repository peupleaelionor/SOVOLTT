// src/screens/onboarding/OnboardingStep4Screen.tsx — Rejoindre une PMO
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { PMOCard } from '../../components/pmo/PMOCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../theme';
import { usePMOStore } from '../../store/pmoStore';
import { useLocation } from '../../hooks/useLocation';
import type { AuthScreenProps } from '../../navigation/types';

export function OnboardingStep4Screen({
  navigation,
}: AuthScreenProps<'OnboardingStep4'>) {
  const { nearbyPMOs, isLoading, fetchNearbyPMOs, joinPMO } = usePMOStore();
  const { location, requestLocation } = useLocation();
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    loadPMOs();
  }, []);

  const loadPMOs = async () => {
    let loc = location;
    if (!loc) {
      loc = await requestLocation();
    }
    if (loc) {
      await fetchNearbyPMOs(loc.latitude, loc.longitude);
    }
  };

  const handleJoin = async (pmoId: string) => {
    setJoining(pmoId);
    try {
      await joinPMO(pmoId);
      Alert.alert('Bienvenue !', 'Vous avez rejoint la PMO avec succès 🎉');
    } catch {
      Alert.alert('Erreur', "Impossible de rejoindre cette PMO pour le moment");
    } finally {
      setJoining(null);
    }
  };

  // L'onboarding est terminé — aller vers l'app principale
  // (la navigation se fait automatiquement via le store d'auth)
  const handleFinish = () => {
    // Le store est déjà authentifié, la navigation se met à jour automatiquement
    Alert.alert(
      'Bienvenue sur Sovoltt ! 🌞',
      "Vous êtes prêt à échanger de l'énergie solaire.",
    );
  };

  return (
    <View style={styles.container}>
      {/* Indicateur de progression */}
      <View style={styles.progress}>
        <View style={styles.dotDone} />
        <View style={styles.dotDone} />
        <View style={styles.dotDone} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      <Text style={styles.step}>Étape 4 / 4</Text>
      <Text style={styles.title}>Rejoindre une PMO 🏘️</Text>
      <Text style={styles.subtitle}>
        La Personne Morale Organisatrice est obligatoire pour l'autoconsommation collective
      </Text>

      {/* Liste des PMO proches */}
      {isLoading ? (
        <LoadingSpinner message="Recherche de PMO à proximité..." />
      ) : nearbyPMOs.length > 0 ? (
        <FlatList
          data={nearbyPMOs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PMOCard
              pmo={item}
              onPress={() => handleJoin(item.id)}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Aucune PMO trouvée</Text>
          <Text style={styles.emptyDesc}>
            Pas de PMO dans votre périmètre. Vous pourrez en créer ou rejoindre une plus tard.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Terminer et commencer 🚀"
          onPress={handleFinish}
          size="large"
        />
        <Button
          title="Je créerai une PMO plus tard"
          onPress={handleFinish}
          variant="ghost"
          size="medium"
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
