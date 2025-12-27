# PorkyFarm Mobile

Application mobile React Native (Expo) pour la gestion d'élevage porcin.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20.x
- npm ou pnpm
- Expo Go (pour tester sur téléphone) OU Xcode/Android Studio (pour simulateur)

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Le fichier .env.local a été créé automatiquement
# Éditer .env.local avec vos clés Supabase réelles :
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### Lancer l'application

```bash
# Démarrer Expo
npm start

# Lancer sur iOS
npm run ios

# Lancer sur Android
npm run android

# Lancer sur web
npm run web
```

## 📁 Structure

```
porkyfarm-mobile/
├── app/                    # Expo Router
│   ├── (auth)/             # Écrans d'authentification
│   ├── (tabs)/             # Navigation par onglets
│   └── profile/            # Profil utilisateur
├── services/               # Services Supabase
│   ├── supabase/          # Client Supabase
│   └── animals.ts         # Service animaux
├── contexts/               # Contextes React
└── components/             # Composants UI
```

## 🔐 Configuration Supabase

1. Créer un fichier `.env.local` à la racine
2. Ajouter vos clés Supabase :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   ```

## 📱 Modules disponibles

- ✅ Authentification (Login, Register)
- ✅ Cheptel (Liste, Ajout)
- 🚧 Santé (en développement)
- 🚧 Reproduction (en développement)
- 🚧 Alimentation (en développement)

## 🔗 Backend

L'application consomme :
- Supabase directement pour les modules P0 (CRUD)
- API Routes Next.js pour l'IA (`/api/chat`)

