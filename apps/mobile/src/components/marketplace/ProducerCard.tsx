// src/components/marketplace/ProducerCard.tsx — Carte d'un producteur
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { colors, typography, spacing } from '../../theme';
import type { Offer } from '../../types';

interface ProducerCardProps {
  offer: Offer;
  onPress: () => void;
}

export function ProducerCard({ offer, onPress }: ProducerCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="sunny" size={24} color={colors.secondary} />
          </View>
          <View style={styles.producerInfo}>
            <Text style={styles.name}>
              {offer.producer?.firstName} {offer.producer?.lastName}
            </Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={12} color={colors.textLight} />
              {' '}{offer.producer?.city || 'France'}
              {offer.distanceKm != null && ` · ${offer.distanceKm} km`}
            </Text>
          </View>
          <Badge
            label={`${offer.pricePerKwh.toFixed(2)}€/kWh`}
            variant="success"
          />
        </View>

        <View style={styles.details}>
          <View style={styles.stat}>
            <Ionicons name="flash" size={16} color={colors.secondary} />
            <Text style={styles.statValue}>{offer.availableKwh} kWh</Text>
            <Text style={styles.statLabel}>disponible</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
            <Text style={styles.statLabel}>
              Jusqu'au {new Date(offer.endDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {offer.matchScore != null && (
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color={colors.secondary} />
              <Text style={styles.statValue}>{offer.matchScore}%</Text>
              <Text style={styles.statLabel}>match</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  producerInfo: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
  },
  location: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.captionBold,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
  },
});
