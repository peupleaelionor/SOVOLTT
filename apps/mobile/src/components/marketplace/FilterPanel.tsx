// src/components/marketplace/FilterPanel.tsx — Panneau de filtres marketplace
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface FilterPanelProps {
  maxPrice?: number;
  radius?: number;
  onMaxPriceChange: (value: number | undefined) => void;
  onRadiusChange: (value: number) => void;
}

const priceOptions = [
  { label: 'Tous', value: undefined },
  { label: '< 0.15€', value: 0.15 },
  { label: '< 0.20€', value: 0.20 },
  { label: '< 0.25€', value: 0.25 },
];

const radiusOptions = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
];

export function FilterPanel({
  maxPrice,
  radius,
  onMaxPriceChange,
  onRadiusChange,
}: FilterPanelProps) {
  return (
    <View style={styles.container}>
      {/* Filtre par prix */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.sectionTitle}>Prix max</Text>
        </View>
        <View style={styles.options}>
          {priceOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={[
                styles.chip,
                maxPrice === opt.value && styles.chipActive,
              ]}
              onPress={() => onMaxPriceChange(opt.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  maxPrice === opt.value && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filtre par distance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.sectionTitle}>Distance</Text>
        </View>
        <View style={styles.options}>
          {radiusOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                radius === opt.value && styles.chipActive,
              ]}
              onPress={() => onRadiusChange(opt.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  radius === opt.value && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.radiusLg,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
});
