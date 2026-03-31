// src/components/marketplace/OfferCard.tsx — Carte d'une offre d'énergie
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors, typography, spacing } from '../../theme';
import type { Offer } from '../../types';

interface OfferCardProps {
  offer: Offer;
  onBuy?: () => void;
}

export function OfferCard({ offer, onBuy }: OfferCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{offer.pricePerKwh.toFixed(2)}€</Text>
        <Text style={styles.priceUnit}>/kWh</Text>
        <View style={styles.spacer} />
        <Text style={styles.available}>{offer.availableKwh} kWh dispo.</Text>
      </View>

      {offer.description && (
        <Text style={styles.description} numberOfLines={2}>
          {offer.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
          <Text style={styles.metaText}>
            {new Date(offer.startDate).toLocaleDateString('fr-FR')} —{' '}
            {new Date(offer.endDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        {onBuy && (
          <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
            <Ionicons name="cart" size={16} color={colors.textInverse} />
            <Text style={styles.buyText}>Acheter</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  spacer: {
    flex: 1,
  },
  available: {
    ...typography.captionBold,
    color: colors.success,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textLight,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusMd,
    gap: spacing.xs,
  },
  buyText: {
    ...typography.buttonSmall,
    color: colors.textInverse,
  },
});
