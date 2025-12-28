/**
 * Module de gestion des permissions mobile
 * Respecte les guidelines Apple/Google avec messages explicites
 */

import { Alert, Linking, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Camera from 'expo-camera'
import * as Notifications from 'expo-notifications'

export interface PermissionResult {
  granted: boolean
  canAskAgain: boolean
  message?: string
}

/**
 * Demande la permission caméra avec message explicite
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    // Vérifier d'abord le statut actuel
    const { status: existingStatus } = await Camera.requestCameraPermissionsAsync()

    if (existingStatus === 'granted') {
      return { granted: true, canAskAgain: true }
    }

    if (existingStatus === 'denied') {
      // Si refusé définitivement, proposer d'ouvrir les paramètres
      Alert.alert(
        'Permission caméra requise',
        'Pour prendre des photos des animaux et des cas de santé, PorkyFarm a besoin d\'accéder à votre caméra. Vous pouvez activer cette permission dans les paramètres de votre téléphone.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ouvrir les paramètres',
            onPress: () => Linking.openSettings(),
          },
        ],
      )

      return { granted: false, canAskAgain: false, message: 'Permission refusée' }
    }

    // Première demande
    const { status } = await Camera.requestCameraPermissionsAsync()

    if (status === 'granted') {
      return { granted: true, canAskAgain: true }
    }

    Alert.alert(
      'Permission caméra requise',
      'Pour documenter vos animaux et cas de santé avec des photos, PorkyFarm a besoin d\'accéder à votre caméra.',
      [{ text: 'OK' }],
    )

    return { granted: false, canAskAgain: status === 'undetermined', message: 'Permission refusée' }
  } catch (error: any) {
    return { granted: false, canAskAgain: false, message: error.message || 'Erreur lors de la demande de permission' }
  }
}

/**
 * Demande la permission galerie photos avec message explicite
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  try {
    const { status: existingStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (existingStatus === 'granted') {
      return { granted: true, canAskAgain: true }
    }

    if (existingStatus === 'denied') {
      Alert.alert(
        'Permission galerie requise',
        'Pour sélectionner des photos depuis votre galerie, PorkyFarm a besoin d\'accéder à vos photos. Vous pouvez activer cette permission dans les paramètres.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ouvrir les paramètres',
            onPress: () => Linking.openSettings(),
          },
        ],
      )

      return { granted: false, canAskAgain: false, message: 'Permission refusée' }
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status === 'granted') {
      return { granted: true, canAskAgain: true }
    }

    Alert.alert(
      'Permission galerie requise',
      'Pour ajouter des photos de vos animaux depuis votre galerie, PorkyFarm a besoin d\'accéder à vos photos.',
      [{ text: 'OK' }],
    )

    return { granted: false, canAskAgain: status === 'undetermined', message: 'Permission refusée' }
  } catch (error: any) {
    return { granted: false, canAskAgain: false, message: error.message || 'Erreur lors de la demande de permission' }
  }
}

/**
 * Demande la permission notifications avec message explicite
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()

    if (existingStatus === 'granted') {
      return { granted: true, canAskAgain: true }
    }

    if (existingStatus === 'denied') {
      Alert.alert(
        'Permission notifications requise',
        'Pour vous rappeler les gestations, vaccinations et alertes importantes, PorkyFarm a besoin d\'envoyer des notifications. Vous pouvez activer cette permission dans les paramètres.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ouvrir les paramètres',
            onPress: () => Linking.openSettings(),
          },
        ],
      )

      return { granted: false, canAskAgain: false, message: 'Permission refusée' }
    }

    const { status } = await Notifications.requestPermissionsAsync()

    if (status === 'granted') {
      return { granted: true, canAskAgain: true }
    }

    Alert.alert(
      'Permission notifications requise',
      'Pour vous rappeler les événements importants de votre élevage (gestations, vaccinations, alertes santé), PorkyFarm a besoin d\'envoyer des notifications.',
      [{ text: 'OK' }],
    )

    return { granted: false, canAskAgain: status === 'undetermined', message: 'Permission refusée' }
  } catch (error: any) {
    return { granted: false, canAskAgain: false, message: error.message || 'Erreur lors de la demande de permission' }
  }
}

/**
 * Vérifie toutes les permissions nécessaires pour l'app
 */
export async function checkAllPermissions(): Promise<{
  camera: PermissionResult
  mediaLibrary: PermissionResult
  notifications: PermissionResult
}> {
  const [camera, mediaLibrary, notifications] = await Promise.all([
    Camera.getCameraPermissionsAsync().then((r) => ({
      granted: r.granted,
      canAskAgain: r.canAskAgain ?? true,
    })),
    ImagePicker.getMediaLibraryPermissionsAsync().then((r) => ({
      granted: r.granted,
      canAskAgain: r.canAskAgain ?? true,
    })),
    Notifications.getPermissionsAsync().then((r) => ({
      granted: r.granted,
      canAskAgain: r.canAskAgain ?? true,
    })),
  ])

  return { camera, mediaLibrary, notifications }
}
