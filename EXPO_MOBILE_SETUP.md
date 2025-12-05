# 📱 Guide Création Application Mobile Expo - PorcPro

## 🎯 Objectif

Créer une application mobile React Native avec Expo qui utilise le même backend Supabase que l'application web.

## 📋 Prérequis

- Node.js 18+ installé
- npm ou yarn
- Expo CLI installé globalement : `npm install -g expo-cli`
- Compte Expo (gratuit) : https://expo.dev
- Compte EAS (pour les builds) : https://eas.expo.dev

## 🚀 Création du Projet Expo

### Option 1 : Créer dans un nouveau dossier (Recommandé)

```bash
# Créer un nouveau dossier pour l'app mobile
cd /Users/desk/Desktop
npx create-expo-app PorcProMobile --template blank-typescript

# Ou avec navigation
npx create-expo-app PorcProMobile --template tabs-typescript
```

### Option 2 : Ajouter Expo au projet existant

```bash
cd /Users/desk/Desktop/PorcPro
npx create-expo-app@latest --template blank-typescript .
```

## 📦 Installation des Dépendances

```bash
cd PorcProMobile  # ou PorcPro si option 2

# Dépendances principales
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens
npm install @tanstack/react-query
npm install zod
npm install date-fns
npm install react-native-reanimated react-native-gesture-handler

# UI Components
npm install react-native-paper  # ou native-base, ou votre choix
npm install react-native-vector-icons

# Utilitaires
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
npm install expo-haptics
npm install expo-image-picker
npm install expo-linear-gradient

# Dev dependencies
npm install --save-dev @types/react @types/react-native
```

## 🔧 Configuration Expo

### Créer `app.json` ou `app.config.js`

```json
{
  "expo": {
    "name": "PorcPro",
    "slug": "porcpro-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.porcpro.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.porcpro.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "L'application a besoin d'accéder à vos photos pour ajouter des images de porcs."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "votre-project-id"
      }
    }
  }
}
```

## 🔐 Variables d'Environnement

### Créer `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://cjzyvcrnwqejlplbkexg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Installer dotenv

```bash
npm install dotenv
npm install --save-dev @types/dotenv
```

### Configurer `app.config.js` (au lieu de `app.json`)

```javascript
import 'dotenv/config';

export default {
  expo: {
    name: "PorcPro",
    slug: "porcpro-mobile",
    version: "1.0.0",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    // ... reste de la config
  }
};
```

## 📱 Structure du Projet Mobile

```
PorcProMobile/
├── app/                    # Expo Router (si utilisé)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── pigs.tsx
│   │   ├── formulator.tsx
│   │   ├── finances.tsx
│   │   └── calendar.tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/            # Composants UI réutilisables
│   │   └── features/      # Composants métier
│   ├── screens/           # Écrans (si pas Expo Router)
│   ├── navigation/        # Configuration navigation
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitaires
│   │   ├── supabase.ts    # Client Supabase
│   │   └── validation.ts # Schémas Zod
│   └── types/             # Types TypeScript
├── assets/                # Images, icônes
├── app.json               # Configuration Expo
└── package.json
```

## 🔌 Configuration Supabase Mobile

### `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        return await SecureStore.getItemAsync(key);
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
      },
      removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## 📱 Navigation

### Avec React Navigation

```typescript
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
// ... autres screens

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Porcs" component={PigsScreen} />
      <Tab.Screen name="Formulateur" component={FormulatorScreen} />
      <Tab.Screen name="Finances" component={FinancesScreen} />
      <Tab.Screen name="Calendrier" component={CalendarScreen} />
    </Tab.Navigator>
  );
}
```

## 🎨 UI Components

### Utiliser React Native Paper ou NativeBase

```bash
# Option 1: React Native Paper
npm install react-native-paper react-native-vector-icons

# Option 2: NativeBase
npm install native-base react-native-safe-area-context
```

## 🚀 Commandes EAS Build

### Installation EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configuration EAS

```bash
eas build:configure
```

### Build Android

```bash
# Build de développement
eas build --platform android --profile development

# Build de production
eas build --platform android --profile production
```

### Build iOS

```bash
# Build de développement
eas build --platform ios --profile development

# Build de production
eas build --platform ios --profile production
```

### Soumettre aux Stores

```bash
# Android (Google Play)
eas submit --platform android

# iOS (App Store)
eas submit --platform ios
```

## 📝 Checklist Pré-Publication

### Code
- [ ] Tous les écrans implémentés
- [ ] Navigation fonctionnelle
- [ ] Authentification Supabase fonctionnelle
- [ ] États de chargement/erreur/vide sur tous les écrans
- [ ] Validation Zod sur tous les formulaires
- [ ] Gestion d'erreurs réseau
- [ ] Pas de console.log en production

### Configuration
- [ ] `app.json` / `app.config.js` configuré
- [ ] Icône et splash screen créés
- [ ] Variables d'environnement configurées
- [ ] Permissions configurées (camera, storage)

### Build
- [ ] Build Android réussi
- [ ] Build iOS réussi
- [ ] Test sur appareil physique
- [ ] Test sur différents appareils

### Stores
- [ ] Compte développeur Google Play créé
- [ ] Compte développeur App Store créé
- [ ] Screenshots préparés (toutes tailles)
- [ ] Description de l'app rédigée
- [ ] Politique de confidentialité créée
- [ ] Icônes et assets préparés

## 🔗 Ressources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

**Note** : Ce guide est pour créer une NOUVELLE application mobile. L'application web actuelle reste intacte.

