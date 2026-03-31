// src/services/notifications.ts — Service de notifications push Expo
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

// Configuration du comportement des notifications en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** Enregistre le token push auprès du serveur */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Demander les permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permission de notification refusée');
      return null;
    }

    // Obtenir le token Expo Push
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'sovoltt-app',
    });
    const token = tokenData.data;

    // Configuration spécifique Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Sovoltt',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
      });
    }

    // Enregistrer le token sur le serveur
    await api.put('/users/me', { expoPushToken: token });

    console.log('📱 Token push enregistré :', token);
    return token;
  } catch (error) {
    console.error("❌ Erreur d'enregistrement push :", error);
    return null;
  }
}

/** Ajoute un listener pour les notifications reçues */
export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/** Ajoute un listener pour les interactions avec les notifications */
export function addResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
