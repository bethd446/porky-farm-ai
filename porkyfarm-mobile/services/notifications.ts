/**
 * Service de notifications
 * Gestion des notifications push pour tâches et alertes
 */

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logger } from '../lib/logger'

const NOTIFICATION_PERMISSIONS_KEY = 'porkyfarm_notification_permissions'

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledTime: Date
  data?: Record<string, any>
}

export const notificationService = {
  /**
   * Demander les permissions de notification
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      logger.debug('Notifications non disponibles sur simulateur')
      return false
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      logger.warn('Permissions de notification refusées')
      return false
    }

    // Configurer le canal Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('tasks', {
        name: 'Tâches',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      })

      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Alertes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#EF4444',
      })
    }

    await AsyncStorage.setItem(NOTIFICATION_PERMISSIONS_KEY, 'granted')
    return true
  },

  /**
   * Vérifier si les permissions sont accordées
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync()
    return status === 'granted'
  },

  /**
   * Planifier une notification pour une tâche
   */
  async scheduleTaskNotification(
    taskId: string,
    title: string,
    body: string,
    scheduledTime: Date,
    minutesBefore: number = 15
  ): Promise<string | null> {
    try {
      const hasPerms = await this.hasPermissions()
      if (!hasPerms) {
        const granted = await this.requestPermissions()
        if (!granted) return null
      }

      // Calculer l'heure de notification (X minutes avant)
      const notificationTime = new Date(scheduledTime.getTime() - minutesBefore * 60 * 1000)
      
      // Ne pas planifier si l'heure est passée
      if (notificationTime <= new Date()) {
        return null
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { taskId, type: 'task' },
        },
        trigger: {
          date: notificationTime,
          channelId: 'tasks',
        },
      })

      return notificationId
    } catch (error) {
      logger.error('Erreur planification notification:', error)
      return null
    }
  },

  /**
   * Planifier une notification d'alerte (mise bas, etc.)
   */
  async scheduleAlertNotification(
    alertId: string,
    title: string,
    body: string,
    scheduledTime: Date,
    type: 'gestation' | 'health' | 'other' = 'other'
  ): Promise<string | null> {
    try {
      const hasPerms = await this.hasPermissions()
      if (!hasPerms) return null

      if (scheduledTime <= new Date()) return null

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { alertId, type },
        },
        trigger: {
          date: scheduledTime,
          channelId: 'alerts',
        },
      })

      return notificationId
    } catch (error) {
      logger.error('Erreur planification alerte:', error)
      return null
    }
  },

  /**
   * Planifier des notifications récurrentes quotidiennes
   */
  async scheduleDailyNotification(
    id: string,
    title: string,
    body: string,
    hour: number,
    minute: number
  ): Promise<string | null> {
    try {
      const hasPerms = await this.hasPermissions()
      if (!hasPerms) return null

      // Annuler l'ancienne notification si elle existe
      await this.cancelNotification(id)

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: { id, type: 'daily' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          channelId: 'tasks',
        },
      })

      return notificationId
    } catch (error) {
      logger.error('Erreur planification notification quotidienne:', error)
      return null
    }
  },

  /**
   * Annuler une notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
    } catch (error) {
      // Ignorer si la notification n'existe pas
    }
  },

  /**
   * Annuler toutes les notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
  },

  /**
   * Obtenir toutes les notifications planifiées
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync()
  },

  /**
   * Envoyer une notification immédiate
   */
  async sendImmediateNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
      },
      trigger: null, // Immédiat
    })
  },
}

export default notificationService

