# 🚀 Exécution Stabilisation - PorkyFarm

**Date** : 2025-01-27  
**Objectif** : Stabilisation mobile + amélioration IA + sécurité

---

## ✅ Fichiers Créés/Modifiés

### Mobile (Expo)

#### Nouveaux fichiers

1. **`porkyfarm-mobile/lib/apiClient.ts`**
   - Client API unifié pour toutes les requêtes réseau
   - Gestion : timeout, retry, offline, erreurs HTTP
   - Utilisation : `apiClient.get()`, `apiClient.post()`, etc.

2. **`porkyfarm-mobile/lib/offlineQueue.ts`**
   - Queue de synchronisation offline
   - Stockage dans AsyncStorage
   - Fonctions : `enqueue()`, `processQueue()`, `markAsSynced()`, etc.

3. **`porkyfarm-mobile/hooks/useSyncQueue.ts`**
   - Hook React pour gérer la synchronisation automatique
   - Écoute le réseau et synchronise quand online
   - Retourne : `{ isOnline, pendingCount, isSyncing, syncNow }`

4. **`porkyfarm-mobile/lib/permissions.ts`**
   - Module de gestion des permissions (caméra, photos, notifications)
   - Messages explicites selon guidelines Apple/Google
   - Fonctions : `requestCameraPermission()`, `requestMediaLibraryPermission()`, etc.

5. **`porkyfarm-mobile/components/ErrorBoundary.tsx`**
   - Error Boundary React pour capturer les erreurs et éviter les crashes
   - Affiche un écran d'erreur user-friendly

#### Fichiers modifiés

- **`porkyfarm-mobile/app/_layout.tsx`** : Ajout de `ErrorBoundary`
- **`porkyfarm-mobile/app/(tabs)/index.tsx`** : Désactivation temporaire de `WeatherWidget`, ajout indicateur sync
- **`porkyfarm-mobile/app/(tabs)/ai-assistant.tsx`** : Utilisation de `apiClient` au lieu de `fetch`
- **`porkyfarm-mobile/app/(tabs)/health/add.tsx`** : Intégration queue offline
- **`porkyfarm-mobile/app/(tabs)/reproduction/add.tsx`** : Intégration queue offline
- **`porkyfarm-mobile/app/(tabs)/livestock/add.tsx`** : Utilisation du module permissions

### Backend (Next.js)

#### Fichiers modifiés

- **`app/api/chat/route.ts`** :
  - Ajout vérification quota quotidien (50 requêtes/jour)
  - Amélioration prompt système (avertissement vétérinaire)
  - Tracking usage dans table `ai_usage`
  - Estimation coûts par requête

#### Nouveaux scripts SQL

- **`scripts/005-ai-usage-table.sql`** :
  - Table `ai_usage` pour quotas et monitoring
  - Fonctions : `increment_ai_usage()`, `check_ai_quota()`
  - RLS activé

### Documentation

- **`docs/RLS_RULES.md`** : Documentation complète des policies RLS
- **`docs/STORE_CHECKLIST.md`** : Checklist complète pour publication iOS/Android

---

## 📦 Dépendances Installées

```bash
cd porkyfarm-mobile
npm install expo-network expo-camera expo-notifications --legacy-peer-deps
```

---

## 🔧 Configuration Requise

### 1. Exécuter le script SQL pour la table `ai_usage`

Dans Supabase Dashboard → SQL Editor, exécuter :

```sql
-- Contenu de scripts/005-ai-usage-table.sql
```

### 2. Variables d'environnement

Vérifier que `.env.local` (web) et `porkyfarm-mobile/.env.local` (mobile) contiennent :

**Web** :
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Mobile** :
```env
EXPO_PUBLIC_API_URL=http://localhost:3000  # ou https://porkyfarm.app
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🧪 Tests à Effectuer

### 1. Test Client API (`apiClient`)

```typescript
// Dans un écran mobile
import { apiClient } from '../lib/apiClient'

// Test GET
const { data, error } = await apiClient.get('/api/animals')
console.log('Animals:', data, error)

// Test POST
const { data, error } = await apiClient.post('/api/health-cases', {
  pig_id: '...',
  title: 'Test',
})
```

### 2. Test Queue Offline

1. Activer le mode avion sur le simulateur/appareil
2. Créer un cas de santé ou une gestation
3. Vérifier que l'action est enregistrée dans la queue
4. Désactiver le mode avion
5. Vérifier que la synchronisation se fait automatiquement

```typescript
// Vérifier la queue
import { offlineQueue } from '../lib/offlineQueue'
const pending = await offlineQueue.getPending()
console.log('Pending actions:', pending)
```

### 3. Test Permissions

1. Ouvrir l'écran "Ajouter un animal"
2. Cliquer sur "Prendre une photo"
3. Vérifier que le message de permission est clair
4. Refuser la permission
5. Vérifier que l'app propose d'ouvrir les paramètres

### 4. Test IA avec Quota

1. Faire 50 requêtes IA (ou modifier la limite dans le code)
2. Vérifier que la 51ème requête retourne une erreur 429 avec message clair
3. Vérifier que la table `ai_usage` est bien remplie

### 5. Test Error Boundary

1. Forcer une erreur React (ex: accès à une propriété undefined)
2. Vérifier que l'écran d'erreur s'affiche au lieu d'un crash
3. Vérifier que le bouton "Réessayer" fonctionne

---

## 🚨 Points d'Attention

### 1. Table `ai_usage` non créée

Si les fonctions RPC `check_ai_quota` et `increment_ai_usage` n'existent pas :
- L'endpoint IA continuera de fonctionner (avec un warning dans les logs)
- Les quotas ne seront pas appliqués
- **Solution** : Exécuter `scripts/005-ai-usage-table.sql` dans Supabase

### 2. Widget Météo désactivé

Le `WeatherWidget` est temporairement désactivé dans le dashboard mobile car la route backend `/api/weather` n'est pas encore stable.

**Pour réactiver** :
1. Vérifier que `/api/weather` fonctionne correctement
2. Décommenter l'import et l'utilisation dans `app/(tabs)/index.tsx`

### 3. Services mobiles utilisent encore Supabase directement

Les services (`animalsService`, `healthCasesService`, etc.) utilisent encore Supabase directement au lieu de `apiClient`.

**Pour migrer** (optionnel, future amélioration) :
- Créer des routes API Next.js pour chaque service
- Adapter les services mobiles pour utiliser `apiClient` au lieu de Supabase

---

## 📝 Checklist de Validation

### Fonctionnalités

- [ ] Client API fonctionne (requêtes GET/POST)
- [ ] Queue offline fonctionne (enregistrement + sync)
- [ ] Permissions demandées avec messages clairs
- [ ] Error Boundary capture les erreurs
- [ ] IA avec quota fonctionne (50 requêtes/jour)
- [ ] Dashboard mobile affiche indicateur sync si pending > 0

### Sécurité

- [ ] RLS activé sur toutes les tables (vérifier dans Supabase Dashboard)
- [ ] Aucun secret dans le code (vérifier avec `grep -r "sk-" .`)
- [ ] Table `ai_usage` créée et RLS activé

### Tests

- [ ] Test sur simulateur iOS
- [ ] Test sur simulateur Android
- [ ] Test avec réseau instable (mode avion)
- [ ] Test permissions (refus, acceptation)
- [ ] Test IA (quota, erreurs)

---

## 🔄 Prochaines Étapes

1. **Migrer services mobiles vers API Routes** (optionnel)
   - Créer `/api/animals`, `/api/health-cases`, etc.
   - Adapter services mobiles pour utiliser `apiClient`

2. **Réactiver Widget Météo** (quand backend stable)
   - Vérifier route `/api/weather`
   - Décommenter dans dashboard mobile

3. **Tests sur appareils réels**
   - iPhone réel
   - Android réel
   - Vérifier performance et UX

4. **Préparation publication stores**
   - Suivre `docs/STORE_CHECKLIST.md`
   - Créer icônes, captures d'écran
   - Configurer EAS Build

---

**Dernière mise à jour** : 2025-01-27  
**Maintenu par** : Tech Lead PorkyFarm

