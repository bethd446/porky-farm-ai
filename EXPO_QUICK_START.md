# 🚀 Quick Start - Application Mobile Expo PorcPro

## ⚡ Démarrage Rapide (5 minutes)

### 1. Créer le Projet

```bash
cd /Users/desk/Desktop
npx create-expo-app PorcProMobile --template blank-typescript
cd PorcProMobile
```

### 2. Installer les Dépendances Essentielles

```bash
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens
npm install @tanstack/react-query
npm install zod
npm install expo-secure-store
npm install expo-haptics
```

### 3. Configurer Supabase

Créez `src/lib/supabase.ts` avec la même configuration que l'app web.

### 4. Lancer en Développement

```bash
# Démarrer Expo
npx expo start

# Scanner le QR code avec Expo Go sur votre téléphone
```

## 📱 Tester avec Expo Go

1. Installez **Expo Go** sur votre téléphone :
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Lancez `npx expo start`

3. Scannez le QR code avec :
   - **iOS** : Appareil photo
   - **Android** : Expo Go app

## 🎯 Prochaines Étapes

1. Créer les écrans principaux
2. Configurer la navigation
3. Intégrer Supabase Auth
4. Tester avec Expo Go
5. Build avec EAS pour les stores

---

**Voir `EXPO_MOBILE_SETUP.md` pour le guide complet.**

