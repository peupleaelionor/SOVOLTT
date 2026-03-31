// src/screens/marketplace/MarketplaceScreen.tsx — Marketplace d'énergie
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProducerCard } from '../../components/marketplace/ProducerCard';
import { FilterPanel } from '../../components/marketplace/FilterPanel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../theme';
import { useEnergyStore } from '../../store/energyStore';
import { useLocation } from '../../hooks/useLocation';

export function MarketplaceScreen() {
  const { offers, isLoading, fetchOffers } = useEnergyStore();
  const { location, requestLocation } = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [radius, setRadius] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOffers();
  }, [maxPrice, radius]);

  const loadOffers = async () => {
    let loc = location;
    if (!loc) {
      loc = await requestLocation();
    }
    await fetchOffers({
      latitude: loc?.latitude,
      longitude: loc?.longitude,
      maxPrice,
      radius,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOffers();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Marché de l'énergie ⚡</Text>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options"
            size={20}
            color={showFilters ? colors.textInverse : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <FilterPanel
            maxPrice={maxPrice}
            radius={radius}
            onMaxPriceChange={setMaxPrice}
            onRadiusChange={setRadius}
          />
        </View>
      )}

      {/* Résumé */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {offers.length} offre{offers.length > 1 ? 's' : ''} disponible{offers.length > 1 ? 's' : ''}
        </Text>
        {location && (
          <Text style={styles.locationText}>
            📍 {location.city || 'Ma position'} · {radius} km
          </Text>
        )}
      </View>

      {/* Liste des offres */}
      {isLoading && offers.length === 0 ? (
        <LoadingSpinner message="Recherche des offres..." />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProducerCard
              offer={item}
              onPress={() => {
                // Navigation vers le détail
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="flash-off-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Aucune offre disponible</Text>
              <Text style={styles.emptyDesc}>
                Essayez d'élargir votre rayon de recherche
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  locationText: {
    ...typography.caption,
    color: colors.textLight,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
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
  },
});
