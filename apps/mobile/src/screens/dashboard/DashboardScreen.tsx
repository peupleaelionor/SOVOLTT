// src/screens/dashboard/DashboardScreen.tsx — Tableau de bord principal
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { ProductionGauge } from '../../components/energy/ProductionGauge';
import { EnergyChart } from '../../components/energy/EnergyChart';
import { SurplusIndicator } from '../../components/energy/SurplusIndicator';
import { colors, typography, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useEnergyStore } from '../../store/energyStore';

export function DashboardScreen() {
  const { user } = useAuthStore();
  const {
    currentProduction,
    transactions,
    isLoading,
    fetchTransactions,
    fetchReadings,
  } = useEnergyStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const isProducer = user?.role === 'PRODUCTEUR';

  useEffect(() => {
    fetchTransactions();
    fetchReadings(isProducer ? 'PRODUCTION' : 'CONSOMMATION');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    await fetchReadings(isProducer ? 'PRODUCTION' : 'CONSOMMATION');
    setRefreshing(false);
  };

  // Données simulées pour la démonstration
  const weeklyData = [
    { label: 'Lun', value: 12.5 },
    { label: 'Mar', value: 15.2 },
    { label: 'Mer', value: 8.7 },
    { label: 'Jeu', value: 18.3 },
    { label: 'Ven', value: 14.1 },
    { label: 'Sam', value: 20.6 },
    { label: 'Dim', value: 16.8 },
  ];

  const totalEarnings = transactions
    .filter((t) => t.sellerId === user?.id && t.status === 'PAYEE')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Bonjour {user?.firstName} 👋
            </Text>
            <Text style={styles.role}>
              {isProducer ? '☀️ Producteur' : '⚡ Consommateur'}
            </Text>
          </View>
          <View style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </View>
        </View>

        {/* Jauge de production (producteur) */}
        {isProducer && (
          <Card style={styles.gaugeCard}>
            <Text style={styles.cardTitle}>Production en temps réel</Text>
            <ProductionGauge
              currentKw={currentProduction?.currentKw || 3.2}
              maxKw={10}
              label="Puissance actuelle"
            />
            <SurplusIndicator
              surplusKwh={currentProduction?.surplusKwh || 4.8}
              selfConsumedKwh={currentProduction?.selfConsumedKwh || 2.1}
            />
          </Card>
        )}

        {/* Statistiques rapides */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons
              name={isProducer ? 'sunny' : 'flash'}
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.statValue}>
              {isProducer ? '106.3' : '85.2'}
            </Text>
            <Text style={styles.statLabel}>kWh ce mois</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons
              name={isProducer ? 'wallet' : 'trending-down'}
              size={24}
              color={colors.accent}
            />
            <Text style={styles.statValue}>
              {isProducer
                ? `${totalEarnings.toFixed(0)}€`
                : '23€'}
            </Text>
            <Text style={styles.statLabel}>
              {isProducer ? 'Revenus' : 'Économies'}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>kg CO₂ évité</Text>
          </Card>
        </View>

        {/* Graphique de la semaine */}
        <Card style={styles.chartCard}>
          <EnergyChart
            data={weeklyData}
            title={isProducer ? 'Production (7 jours)' : 'Consommation (7 jours)'}
            color={isProducer ? colors.secondary : colors.primary}
            unit="kWh"
          />
        </Card>

        {/* Dernières transactions */}
        <Card style={styles.transactionsCard}>
          <Text style={styles.cardTitle}>Dernières transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
          ) : (
            transactions.slice(0, 3).map((tx) => (
              <View key={tx.id} style={styles.transaction}>
                <Ionicons
                  name={tx.sellerId === user?.id ? 'arrow-up-circle' : 'arrow-down-circle'}
                  size={24}
                  color={tx.sellerId === user?.id ? colors.success : colors.info}
                />
                <View style={styles.txInfo}>
                  <Text style={styles.txAmount}>
                    {tx.sellerId === user?.id ? '+' : '-'}{tx.totalAmount.toFixed(2)}€
                  </Text>
                  <Text style={styles.txDetail}>{tx.kwh} kWh</Text>
                </View>
                <Text style={styles.txDate}>
                  {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))
          )}
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
  greeting: {
    ...typography.h3,
    color: colors.text,
  },
  role: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gaugeCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
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
  transactionsCard: {
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  txInfo: {
    flex: 1,
  },
  txAmount: {
    ...typography.bodyBold,
    color: colors.text,
  },
  txDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  txDate: {
    ...typography.caption,
    color: colors.textLight,
  },
});
