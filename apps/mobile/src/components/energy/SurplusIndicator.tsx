// src/components/energy/SurplusIndicator.tsx — Indicateur de surplus/déficit
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface SurplusIndicatorProps {
  surplusKwh: number;
  selfConsumedKwh: number;
}

export function SurplusIndicator({
  surplusKwh,
  selfConsumedKwh,
}: SurplusIndicatorProps) {
  const hasSurplus = surplusKwh > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, hasSurplus ? styles.surplus : styles.deficit]}>
        <Ionicons
          name={hasSurplus ? 'trending-up' : 'trending-down'}
          size={24}
          color={hasSurplus ? colors.success : colors.warning}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.value, { color: hasSurplus ? colors.success : colors.warning }]}>
            {hasSurplus ? '+' : ''}{surplusKwh.toFixed(1)} kWh
          </Text>
          <Text style={styles.label}>
            {hasSurplus ? 'Surplus disponible' : 'Pas de surplus'}
          </Text>
        </View>
      </View>
      <View style={styles.selfConsumed}>
        <Ionicons name="home-outline" size={18} color={colors.info} />
        <Text style={styles.selfConsumedText}>
          {selfConsumedKwh.toFixed(1)} kWh autoconsommé
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    gap: spacing.md,
  },
  surplus: {
    backgroundColor: '#DCFCE7',
  },
  deficit: {
    backgroundColor: '#FEF3C7',
  },
  textContainer: {
    flex: 1,
  },
  value: {
    ...typography.h4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  selfConsumed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  selfConsumedText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
