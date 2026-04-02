// src/components/pmo/PMOCard.tsx — Carte récapitulative d'une PMO
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { colors, typography, spacing } from '../../theme';
import type { PMO } from '../../types';

interface PMOCardProps {
  pmo: PMO;
  role?: string;
  onPress: () => void;
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  EN_CREATION: { label: 'En création', variant: 'warning' },
  SUSPENDUE: { label: 'Suspendue', variant: 'neutral' },
  FERMEE: { label: 'Fermée', variant: 'neutral' },
};

const typeLabels: Record<string, string> = {
  URBAIN: '🏙️ Urbain (2 km)',
  PERIURBAIN: '🏘️ Périurbain (10 km)',
  RURAL: '🌾 Rural (20 km)',
};

export function PMOCard({ pmo, role, onPress }: PMOCardProps) {
  const status = statusLabels[pmo.status] || statusLabels.ACTIVE;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons name="people" size={24} color={colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{pmo.name}</Text>
            <Text style={styles.type}>{typeLabels[pmo.type] || pmo.type}</Text>
          </View>
          <Badge label={status.label} variant={status.variant} />
        </View>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Ionicons name="location-outline" size={14} color={colors.textLight} />
            <Text style={styles.detailText}>{pmo.address}</Text>
          </View>
          {pmo.members && (
            <View style={styles.detail}>
              <Ionicons name="people-outline" size={14} color={colors.textLight} />
              <Text style={styles.detailText}>
                {pmo.members.length} membre{pmo.members.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {pmo.distanceKm != null && (
            <View style={styles.detail}>
              <Ionicons name="navigate-outline" size={14} color={colors.textLight} />
              <Text style={styles.detailText}>{pmo.distanceKm} km</Text>
            </View>
          )}
          {role && (
            <View style={styles.detail}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.primary }]}>
                {role}
              </Text>
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
  },
  type: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  details: {
    gap: spacing.sm,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
