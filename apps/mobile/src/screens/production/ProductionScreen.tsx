// src/screens/production/ProductionScreen.tsx — Suivi de production temps réel
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { ProductionGauge } from '../../components/energy/ProductionGauge';
import { EnergyChart } from '../../components/energy/EnergyChart';
import { Badge } from '../../components/common/Badge';
import { colors, typography, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useEnergyStore } from '../../store/energyStore';
import { useProduction } from '../../hooks/useProduction';

export function ProductionScreen() {
  const { user } = useAuthStore();
  const { currentProduction } = useEnergyStore();
  const { isConnected } = useProduction();

  // Données horaires simulées pour la démonstration
  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    label: `${8 + i}h`,
    value: Math.max(0, Math.sin(((i - 2) / 11) * Math.PI) * 8 + Math.random() * 2),
  }));

  const production = currentProduction || {
    currentKw: 3.2,
    todayKwh: 18.5,
    surplusKwh: 4.8,
    selfConsumedKwh: 13.7,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Production solaire ☀️</Text>
          <Badge
            label={isConnected ? '🟢 Temps réel' : '🔴 Hors ligne'}
            variant={isConnected ? 'success' : 'error'}
          />
        </View>

        {/* Jauge principale */}
        <Card style={styles.gaugeCard}>
          <ProductionGauge
            currentKw={production.currentKw}
            maxKw={10}
            label="Puissance instantanée"
          />
        </Card>

        {/* Statistiques du jour */}
        <View style={styles.statsGrid}>
          <Card style={styles.statItem}>
            <Ionicons name="sunny" size={20} color={colors.secondary} />
            <Text style={styles.statValue}>{production.todayKwh.toFixed(1)}</Text>
            <Text style={styles.statLabel}>kWh produits</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="home" size={20} color={colors.info} />
            <Text style={styles.statValue}>{production.selfConsumedKwh.toFixed(1)}</Text>
            <Text style={styles.statLabel}>kWh consommés</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="trending-up" size={20} color={colors.success} />
            <Text style={styles.statValue}>{production.surplusKwh.toFixed(1)}</Text>
            <Text style={styles.statLabel}>kWh surplus</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="leaf" size={20} color={colors.primary} />
            <Text style={styles.statValue}>
              {(production.todayKwh * 0.42).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>kg CO₂ évité</Text>
          </Card>
        </View>

        {/* Graphique horaire */}
        <Card style={styles.chartCard}>
          <EnergyChart
            data={hourlyData}
            title="Production aujourd'hui"
            color={colors.secondary}
            unit="kW"
            height={220}
          />
        </Card>

        {/* Prévisions */}
        <Card style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="partly-sunny-outline" size={22} color={colors.secondary} />
            <Text style={styles.forecastTitle}>Prévision demain</Text>
          </View>
          <View style={styles.forecastRow}>
            <View style={styles.forecastItem}>
              <Text style={styles.forecastValue}>22.3 kWh</Text>
              <Text style={styles.forecastLabel}>Production estimée</Text>
            </View>
            <View style={styles.forecastItem}>
              <Text style={styles.forecastValue}>6.1 kWh</Text>
              <Text style={styles.forecastLabel}>Surplus prévu</Text>
            </View>
          </View>
          <Text style={styles.forecastNote}>
            ☀️ Ensoleillement prévu : bon — Production optimale attendue
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  gaugeCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    width: '48%' as any,
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  statValue: {
    ...typography.statSmall,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  forecastCard: {
    gap: spacing.md,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  forecastTitle: {
    ...typography.h4,
    color: colors.text,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  forecastItem: {
    flex: 1,
  },
  forecastValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  forecastLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  forecastNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: spacing.radiusSm,
  },
});
