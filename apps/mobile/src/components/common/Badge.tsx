// src/components/common/Badge.tsx — Badge d'état
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const variantColors = {
  success: { bg: '#DCFCE7', text: '#166534' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  neutral: { bg: '#F3F4F6', text: '#374151' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const colorScheme = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colorScheme.bg }]}>
      <Text style={[styles.text, { color: colorScheme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusFull,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.captionBold,
  },
});
