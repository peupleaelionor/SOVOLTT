// src/screens/pmo/PMOScreen.tsx — Gestion des PMO
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PMOCard } from '../../components/pmo/PMOCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../theme';
import { usePMOStore } from '../../store/pmoStore';

export function PMOScreen() {
  const { myPMOs, isLoading, fetchMyPMOs } = usePMOStore();

  useEffect(() => {
    fetchMyPMOs();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Mes PMO 🏘️</Text>
        </View>

        {/* Info réglementaire */}
        <Card style={styles.infoCard} variant="filled">
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              La Personne Morale Organisatrice (PMO) est obligatoire pour participer
              à l'autoconsommation collective (Art. L315-2).
            </Text>
          </View>
        </Card>

        {/* Liste de mes PMO */}
        {isLoading ? (
          <LoadingSpinner message="Chargement de vos PMO..." />
        ) : myPMOs.length > 0 ? (
          <View style={styles.pmoList}>
            <Text style={styles.sectionTitle}>Vos PMO</Text>
            {myPMOs.map((membership) => (
              <PMOCard
                key={membership.pmo.id}
                pmo={membership.pmo}
                role={membership.role}
                onPress={() => {}}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>
              Vous n'êtes membre d'aucune PMO
            </Text>
            <Text style={styles.emptyDesc}>
              Rejoignez une PMO existante ou créez-en une nouvelle pour
              commencer l'échange d'énergie.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Créer une PMO"
            onPress={() => {}}
            variant="primary"
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />}
          />
          <Button
            title="Rechercher des PMO"
            onPress={() => {}}
            variant="outline"
            icon={<Ionicons name="search-outline" size={20} color={colors.primary} />}
          />
        </View>

        {/* Réglementation */}
        <Card style={styles.regulationCard}>
          <Text style={styles.regulationTitle}>📋 Périmètres réglementaires</Text>
          <View style={styles.regulationRow}>
            <View style={styles.regulationItem}>
              <Text style={styles.regulationEmoji}>🏙️</Text>
              <Text style={styles.regulationLabel}>Urbain</Text>
              <Text style={styles.regulationValue}>2 km</Text>
            </View>
            <View style={styles.regulationItem}>
              <Text style={styles.regulationEmoji}>🏘️</Text>
              <Text style={styles.regulationLabel}>Périurbain</Text>
              <Text style={styles.regulationValue}>10 km</Text>
            </View>
            <View style={styles.regulationItem}>
              <Text style={styles.regulationEmoji}>🌾</Text>
              <Text style={styles.regulationLabel}>Rural</Text>
              <Text style={styles.regulationValue}>20 km</Text>
            </View>
          </View>
          <Text style={styles.regulationNote}>
            Puissance max : 5 MW (standard) — 10 MW (collectivités)
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  pmoList: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  regulationCard: {
    gap: spacing.md,
  },
  regulationTitle: {
    ...typography.h4,
    color: colors.text,
  },
  regulationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  regulationItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  regulationEmoji: {
    fontSize: 28,
  },
  regulationLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  regulationValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  regulationNote: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
});
