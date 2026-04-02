// src/screens/profile/ProfileScreen.tsx — Profil utilisateur
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { colors, typography, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Informations personnelles', action: () => {} },
    { icon: 'card-outline' as const, label: 'Moyens de paiement', action: () => {} },
    { icon: 'speedometer-outline' as const, label: 'Compteurs Linky', action: () => {} },
    { icon: 'receipt-outline' as const, label: 'Factures et historique', action: () => {} },
    { icon: 'notifications-outline' as const, label: 'Notifications', action: () => {} },
    { icon: 'shield-checkmark-outline' as const, label: 'Sécurité', action: () => {} },
    { icon: 'help-circle-outline' as const, label: 'Aide et support', action: () => {} },
    { icon: 'document-text-outline' as const, label: 'Mentions légales', action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* En-tête profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Badge
            label={user?.role === 'PRODUCTEUR' ? '☀️ Producteur' : '⚡ Consommateur'}
            variant={user?.role === 'PRODUCTEUR' ? 'warning' : 'info'}
          />
        </View>

        {/* Menu */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.action}
              activeOpacity={0.6}
            >
              <Ionicons name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Version et déconnexion */}
        <View style={styles.footer}>
          <Button
            title="Se déconnecter"
            onPress={handleLogout}
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
          />
          <Text style={styles.version}>Sovoltt v1.0.0</Text>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    ...typography.h2,
    color: colors.textInverse,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  menuCard: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.textLight,
  },
});
