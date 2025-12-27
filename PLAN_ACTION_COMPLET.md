# PLAN D'ACTION COMPLET - PorkyFarm

**Date :** $(date)  
**Objectif :** Fiabilité web 100% + Préparation mobile Expo

---

## 1️⃣ STRATÉGIE MOBILE

### Choix : Projet Expo séparé dans le même repo

**Justification (5-6 lignes) :**

Le backend Next.js est déjà prêt avec toutes les API Routes (`/api/animals`, `/api/health-cases`, `/api/gestations`, `/api/chat`). Supabase est configuré avec RLS. Un projet Expo séparé (`porkyfarm-mobile/`) consommera directement Supabase via `@supabase/supabase-js` pour les modules P0 (CRUD), et utilisera les API Routes Next.js pour l'IA et les emails. Cette approche évite de réinventer le backend, permet un développement mobile rapide avec hot reload, et facilite la publication iOS/Android via EAS Build. Le partage de code (types, validations) se fera via un package monorepo ou des exports TypeScript.

### Structure proposée

```
porky-farm-ai/
├── app/                    # Next.js (existant)
├── components/             # Web components (existant)
├── lib/                    # Shared libs (existant)
├── porkyfarm-mobile/       # NOUVEAU - Projet Expo
│   ├── app/                # Expo Router
│   │   ├── (auth)/         # Login, Register, Reset
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── reset-password.tsx
│   │   ├── (tabs)/         # Tab Navigator (modules P0)
│   │   │   ├── index.tsx   # Dashboard
│   │   │   ├── livestock/  # Cheptel
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── add.tsx
│   │   │   ├── health/     # Santé
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── reproduction/ # Reproduction
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── feeding/    # Alimentation
│   │   │   │   └── index.tsx
│   │   │   └── ai-assistant.tsx
│   │   └── profile/        # Profil
│   │       └── index.tsx
│   ├── services/           # Services Supabase
│   │   ├── supabase/
│   │   │   ├── client.ts   # Client Supabase configuré
│   │   │   └── auth.ts     # Helpers auth
│   │   ├── animals.ts      # animalsService (getAll, create, update, delete)
│   │   ├── healthCases.ts  # healthCasesService
│   │   ├── gestations.ts   # gestationsService
│   │   └── feeding.ts      # feedingService
│   ├── contexts/           # Contextes React
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── components/         # Composants UI réutilisables
│   │   ├── ui/             # shadcn/ui adapté React Native
│   │   └── forms/          # Formulaires métier
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitaires
│   │   ├── types.ts       # Types partagés
│   │   └── validations.ts # Validations Zod
│   ├── app.json            # Config Expo
│   ├── package.json
│   └── tsconfig.json
```

---

## 2️⃣ SETUP LOCAL TERMINAL + SIMULATEUR

### Prérequis (macOS)

```bash
# 1. Node.js (v20.x requis selon package.json)
node --version  # Doit être 20.x
npm --version

# 2. Expo CLI (PAS nécessaire - on utilise npx directement)
# Note: Pas besoin d'installer expo-cli globalement, npx le fait automatiquement

# 3. Installer Xcode (pour simulateur iOS)
# Via App Store ou xcode-select --install

# 4. Installer Android Studio (pour simulateur Android)
# Télécharger depuis https://developer.android.com/studio
# Configurer ANDROID_HOME dans ~/.zshrc ou ~/.bash_profile

# 5. Expo Go (optionnel, pour test sur téléphone physique)
# Installer depuis App Store (iOS) ou Play Store (Android)
```

### Commandes exactes (ordre d'exécution)

```bash
# 1. Cloner/mettre à jour le repo
cd /Users/desk/Desktop
git clone https://github.com/bethd446/porky-farm-ai.git
# OU si déjà cloné :
cd porky-farm-ai-V1
git pull origin main

# 2. Installer dépendances web
npm install
# OU si pnpm est installé :
pnpm install

# 3. Lancer le backend Next.js (terminal 1)
npm run dev
# Le serveur démarre sur http://localhost:3000

# 4. Créer le projet Expo (dans le repo, terminal 2)
cd /Users/desk/Desktop/porky-farm-ai-V1
npx create-expo-app@latest porkyfarm-mobile --template blank-typescript
# ✅ Projet créé avec succès (pas besoin d'installer expo-cli globalement)

# 5. Installer dépendances mobile
cd porkyfarm-mobile
npm install @supabase/supabase-js expo-secure-store @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

# 6. Configurer les variables d'environnement
# Créer .env.local dans porkyfarm-mobile/
echo "EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase" > .env.local
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key" >> .env.local
echo "EXPO_PUBLIC_API_URL=http://localhost:3000" >> .env.local

# 7. Lancer Expo (terminal 2)
npx expo start

# 8. Ouvrir le simulateur
# iOS : Appuyer sur 'i' dans le terminal Expo
# Android : Appuyer sur 'a' dans le terminal Expo
# OU scanner le QR code avec Expo Go sur téléphone physique
```

### Vérification

- ✅ Backend web accessible sur http://localhost:3000
- ✅ Expo DevTools ouverte dans le navigateur
- ✅ Simulateur iOS/Android lancé avec l'app Expo
- ✅ Hot reload fonctionnel (modifier un fichier → voir le changement)

---

## 3️⃣ FIABILITÉ WEB - ÉTAT ACTUEL

### ✅ MODULES FONCTIONNELS (après corrections CRUD)

#### Auth
- ✅ Login/Register/Reset password fonctionnels
- ✅ Déconnexion fonctionnelle
- ✅ Protection des routes dashboard
- ✅ Redirection automatique si non authentifié

#### Cheptel (Livestock)
- ✅ Liste des animaux : affichage correct
- ✅ Ajout animal : création + synchronisation UI ✅
- ✅ Modification animal : update + refresh ✅
- ✅ Suppression animal : delete + refresh ✅
- ✅ Filtres par catégorie (Truies, Verrats, Porcelets) : fonctionnels
- ✅ Détail animal : affichage complet
- ✅ Mapping catégories/statuts corrigé ✅

#### Santé (Health)
- ✅ Liste des cas : affichage correct
- ✅ Ajout cas : création + synchronisation UI ✅
- ✅ Modification cas : update + refresh ✅
- ✅ Suppression cas : delete + refresh ✅
- ✅ Priorités et statuts : fonctionnels
- ✅ Photos : upload fonctionnel

#### Reproduction
- ✅ Liste des gestations : affichage correct
- ✅ Ajout gestation : création + synchronisation UI ✅
- ✅ Mapping statuts (active ↔ pregnant) corrigé ✅
- ✅ Calcul automatique date de mise-bas (114 jours) : fonctionnel
- ✅ Complétion gestation : update + refresh ✅

#### Alimentation (Feeding)
- ✅ Calculateur de rations : calcul fonctionnel (pas de DB, juste calcul)
- ✅ Stock d'aliments : CRUD complet + synchronisation ✅
- ✅ Planning alimentaire : CRUD complet + synchronisation ✅
- ✅ Toggle statut tâche : update + refresh ✅

#### Assistant IA
- ✅ Envoi message : fonctionnel
- ✅ Réception réponse : fonctionnel
- ✅ Upload photo : fonctionnel
- ✅ Rate limiting : actif (20 req/min)
- ✅ Gestion erreurs : correcte

#### Dashboard
- ✅ Statistiques : calculées depuis données réelles
- ✅ Alertes : générées depuis gestations/cas actifs
- ✅ Actions rapides : liens fonctionnels
- ✅ Météo : intégration fonctionnelle

#### Profil & Paramètres
- ✅ Affichage profil : fonctionnel
- ✅ Export données : fonctionnel (JSON)
- ✅ Sauvegarde locale : fonctionnelle
- ⚠️ Changement mot de passe : simulé (pas d'API réelle)
- ⚠️ 2FA : non implémenté (message d'avertissement affiché)

### ⚠️ PROBLÈMES IDENTIFIÉS (NON BLOQUANTS)

#### Settings - Changement mot de passe
**Fichier :** `app/dashboard/settings/page.tsx` (ligne 94-112)  
**Problème :** La fonction `handlePasswordUpdate` simule un changement (setTimeout) mais n'appelle pas l'API Supabase réelle.  
**Type :** MAJEUR  
**Action :** Implémenter l'appel à `supabase.auth.updateUser({ password: newPassword })`  
**Test :** Vérifier que le mot de passe change réellement dans Supabase Auth

#### Settings - Statistiques incohérentes
**Fichier :** `app/dashboard/settings/page.tsx` (ligne 128-131)  
**Problème :** Les stats utilisent `category === "Truie"` (avec majuscule) alors que les données utilisent `"truie"` (minuscule).  
**Type :** MINEUR  
**Action :** Corriger les filtres pour utiliser les valeurs réelles (`"truie"`, `"verrat"`, etc.)  
**Test :** Vérifier que les stats affichées correspondent aux données réelles

#### Profile - Pas de mise à jour réelle
**Fichier :** `components/profile/profile-settings.tsx` (à vérifier)  
**Problème :** Possible que les modifications de profil ne soient pas sauvegardées dans Supabase.  
**Type :** MAJEUR  
**Action :** Vérifier et implémenter l'appel à `supabase.from('profiles').update()`  
**Test :** Modifier le profil et vérifier dans Supabase que les données sont mises à jour

---

## 4️⃣ INTÉGRATION SUPABASE POUR MOBILE (EXPO READY)

### Structure de services

**Fichier :** `porkyfarm-mobile/services/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        return await SecureStore.getItemAsync(key)
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value)
      },
      removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key)
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### Exemple complet : Service Animaux

**Fichier :** `porkyfarm-mobile/services/animals.ts`

```typescript
import { supabase } from './supabase/client'
import type { Database } from '../lib/types'

type Animal = Database['public']['Tables']['pigs']['Row']
type AnimalInsert = Database['public']['Tables']['pigs']['Insert']
type AnimalUpdate = Database['public']['Tables']['pigs']['Update']

export interface AnimalsService {
  getAll: () => Promise<{ data: Animal[] | null; error: Error | null }>
  getById: (id: string) => Promise<{ data: Animal | null; error: Error | null }>
  create: (animal: AnimalInsert) => Promise<{ data: Animal | null; error: Error | null }>
  update: (id: string, updates: AnimalUpdate) => Promise<{ data: Animal | null; error: Error | null }>
  delete: (id: string) => Promise<{ error: Error | null }>
}

export const animalsService: AnimalsService = {
  getAll: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error as Error }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  getById: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) return { data: null, error: error as Error }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  create: async (animal: AnimalInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .insert({ ...animal, user_id: user.id })
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  update: async (id: string, updates: AnimalUpdate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Non authentifié') }

      const { data, error } = await supabase
        .from('pigs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error: error as Error }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  delete: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: new Error('Non authentifié') }

      const { error } = await supabase
        .from('pigs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) return { error: error as Error }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
```

### Auth mobile

**Fichier :** `porkyfarm-mobile/services/supabase/auth.ts`

```typescript
import { supabase } from './client'

export const authService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },
  
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    return { data, error }
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },
  
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'porkyfarm://reset-password',
    })
    return { error }
  },
}
```

### Sécurité

- ✅ Seules `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` sont exposées (clés publiques)
- ✅ RLS Supabase garantit l'isolation par `user_id`
- ✅ Session stockée dans `expo-secure-store` (chiffré)
- ✅ Auto-refresh token activé
- ✅ Pas de clés secrètes côté client

---

## 5️⃣ RÉCAP - ÉLÉMENTS À CORRIGER

### 🔴 WEB - CORRECTIONS REQUISES

#### BLOQUANT
Aucun problème bloquant identifié. Les corrections CRUD précédentes ont résolu les problèmes majeurs.

#### MAJEUR
1. **Settings - Changement mot de passe**
   - Fichier : `app/dashboard/settings/page.tsx` (ligne 94-112)
   - Action : Remplacer le setTimeout par un appel réel à `supabase.auth.updateUser({ password: newPassword })`
   - Test : Vérifier que le mot de passe change dans Supabase Auth

2. **Profile - Mise à jour profil**
   - Fichier : `components/profile/profile-settings.tsx` (à vérifier)
   - Action : Vérifier et implémenter l'appel à `supabase.from('profiles').update()`
   - Test : Modifier le profil et vérifier dans Supabase

#### MINEUR
1. **Settings - Stats incohérentes**
   - Fichier : `app/dashboard/settings/page.tsx` (ligne 128-131)
   - Action : Corriger les filtres (`"Truie"` → `"truie"`)
   - Test : Vérifier que les stats correspondent aux données

### 🟢 MOBILE - À IMPLÉMENTER

#### Priorité 1 (P0 - MVP)
1. **Création projet Expo**
   - Créer `porkyfarm-mobile/` avec Expo Router
   - Configurer navigation (auth + tabs)
   - Setup Supabase client avec expo-secure-store

2. **Services Supabase**
   - `animalsService` (exemple complet fourni)
   - `healthCasesService` (même pattern)
   - `gestationsService` (même pattern)
   - `feedingService` (même pattern)

3. **Écrans prioritaires**
   - Auth : Login, Register, Reset
   - Dashboard : Stats + alertes
   - Cheptel : Liste, Détail, Ajout
   - Santé : Liste, Détail, Ajout
   - Reproduction : Liste, Détail, Ajout

#### Priorité 2 (P1)
4. **Alimentation**
   - Calculateur de rations
   - Gestion stock
   - Planning

5. **Assistant IA**
   - Intégration API `/api/chat`
   - Upload photos

6. **Profil & Paramètres**
   - Affichage profil
   - Export données

#### Points sensibles
- **Auth Apple** : Configurer dans `app.json` et Supabase Dashboard
- **Réseau instable** : Gérer les erreurs réseau avec retry logic
- **UX terrain** : Boutons 44px minimum, feedback haptique, pull-to-refresh
- **Photos** : Utiliser `expo-image-picker` et upload vers Supabase Storage

---

## 📋 PROCHAINES ÉTAPES

### Option A : Finaliser Web
1. Corriger changement mot de passe (Settings)
2. Corriger mise à jour profil (Profile)
3. Corriger stats incohérentes (Settings)
4. Tests complets de tous les modules

### Option B : Démarrer Mobile
1. Créer projet Expo
2. Setup Supabase client
3. Implémenter services (animals, healthCases, gestations)
4. Créer écrans auth
5. Créer écrans dashboard + cheptel

**Recommandation :** Commencer par Option A (finaliser web) puis Option B (mobile).

---

## ✅ CHECKLIST FINALE

- [x] Stratégie mobile définie
- [x] Plan terminal exécutable fourni
- [x] État de fiabilité web documenté
- [x] Problèmes identifiés et classés
- [x] Structure mobile proposée
- [x] Exemple service Supabase fourni
- [x] Liste récapitulative créée

**Prêt pour le prochain prompt :** Coder le projet Expo OU corriger les derniers points web.

