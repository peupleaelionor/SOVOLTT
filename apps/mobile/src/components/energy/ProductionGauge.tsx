// src/components/energy/ProductionGauge.tsx — Jauge circulaire de production
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing } from '../../theme';

interface ProductionGaugeProps {
  currentKw: number;
  maxKw?: number;
  label?: string;
}

export function ProductionGauge({
  currentKw,
  maxKw = 10,
  label = 'Production',
}: ProductionGaugeProps) {
  const percentage = Math.min((currentKw / maxKw) * 100, 100);
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  // Couleur selon le niveau de production
  const gaugeColor =
    percentage > 75
      ? colors.energyGreen
      : percentage > 40
        ? colors.energyYellow
        : colors.energyOrange;

  return (
    <View style={styles.container}>
      <Svg width={180} height={180} viewBox="0 0 180 180">
        {/* Cercle de fond */}
        <Circle
          cx="90"
          cy="90"
          r={radius}
          stroke={colors.borderLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Cercle de progression */}
        <Circle
          cx="90"
          cy="90"
          r={radius}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.value, { color: gaugeColor }]}>
          {currentKw.toFixed(1)}
        </Text>
        <Text style={styles.unit}>kW</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  value: {
    ...typography.stat,
  },
  unit: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginTop: -4,
  },
  label: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});
