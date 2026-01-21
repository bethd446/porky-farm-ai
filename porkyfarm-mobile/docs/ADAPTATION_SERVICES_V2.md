# 🔄 Adaptation des Services pour Migration V2.0

**Date** : $(date)  
**Statut** : ⚠️ **EN COURS**

---

## 📊 État Actuel des Tables

### Tables Existantes

| Table | Existe | Structure | Service |
|-------|--------|-----------|---------|
| `health_records` | ❌ | N'existe plus | `healthCases.ts` (à corriger) |
| `health_cases` | ✅ | `farm_id` (V2.0) | À adapter |
| `pigs` | ✅ | `user_id` (ancien) | `animals.ts` |
| `transactions` | ✅ | `user_id` (ancien) | `costs.ts` |
| `costs` | ✅ | `farm_id` (V2.0) | À créer/adapter |
| `farms` | ✅ | `user_id` | `farms.ts` (créé) |

---

## 🔧 Corrections Requises

### 1. ✅ Service `farms.ts` - CRÉÉ

Service créé pour gérer les fermes. Fonctions disponibles :
- `getAll()` - Toutes les fermes de l'utilisateur
- `getPrimary()` - Ferme principale (première créée)
- `getById(id)` - Ferme par ID
- `create(farm)` - Créer une ferme
- `update(id, updates)` - Mettre à jour
- `delete(id)` - Supprimer

### 2. ⚠️ Service `healthCases.ts` - À CORRIGER

**Problème** : Utilise `health_records` qui n'existe plus.

**Solution** : Adapter pour utiliser `health_cases` avec `farm_id`.

**Changements nécessaires** :
- Remplacer `health_records` → `health_cases`
- Remplacer `user_id` → `farm_id` (via `farmsService.getPrimary()`)
- Adapter les colonnes selon la structure réelle de `health_cases`

### 3. ⚠️ Service `animals.ts` - À ADAPTER

**Problème** : Utilise `user_id` mais la table `pigs` devrait utiliser `farm_id`.

**Solution** : Adapter pour utiliser `farm_id` via `farmsService.getPrimary()`.

### 4. ⚠️ Service `costs.ts` - À ADAPTER

**Problème** : Utilise `transactions` avec `user_id`, mais `costs` existe avec `farm_id`.

**Solution** : Adapter pour utiliser `costs` avec `farm_id`.

### 5. ⚠️ Service `gestations.ts` - À ADAPTER

**Problème** : Utilise `user_id` mais devrait utiliser `farm_id`.

**Solution** : Adapter pour utiliser `farm_id` via `farmsService.getPrimary()`.

### 6. ⚠️ Service `feeding.ts` - À ADAPTER

**Problème** : Utilise `user_id` mais devrait utiliser `farm_id`.

**Solution** : Adapter pour utiliser `farm_id` via `farmsService.getPrimary()`.

---

## 🎯 Stratégie d'Adaptation

### Étape 1 : Helper pour obtenir farm_id

Créer un helper qui récupère automatiquement le `farm_id` de l'utilisateur :

```typescript
// lib/farmHelpers.ts
import { farmsService } from '../services/farms'

let cachedFarmId: string | null = null

export async function getCurrentFarmId(): Promise<string | null> {
  if (cachedFarmId) return cachedFarmId
  
  const { data: farm } = await farmsService.getPrimary()
  if (farm) {
    cachedFarmId = farm.id
    return farm.id
  }
  
  // Si pas de ferme, en créer une par défaut
  const { data: newFarm } = await farmsService.create({
    name: 'Ma Ferme',
    address: null,
  })
  
  if (newFarm) {
    cachedFarmId = newFarm.id
    return newFarm.id
  }
  
  return null
}
```

### Étape 2 : Adapter chaque service

Pour chaque service, remplacer :
```typescript
// AVANT
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { data: null, error: new Error('Non authentifié') }

await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id)
```

Par :
```typescript
// APRÈS
const farmId = await getCurrentFarmId()
if (!farmId) return { data: null, error: new Error('Aucune ferme trouvée') }

await supabase
  .from('table')
  .select('*')
  .eq('farm_id', farmId)
```

---

## 📝 Checklist

- [x] Service `farms.ts` créé
- [ ] Helper `getCurrentFarmId()` créé
- [ ] Service `healthCases.ts` adapté
- [ ] Service `animals.ts` adapté
- [ ] Service `costs.ts` adapté
- [ ] Service `gestations.ts` adapté
- [ ] Service `feeding.ts` adapté
- [ ] Tests d'intégration

---

## ⚠️ Notes Importantes

1. **Migration progressive** : Les tables `pigs` et `transactions` utilisent encore `user_id`. Il faudra soit :
   - Migrer les données vers les nouvelles tables
   - Ou maintenir la compatibilité avec les deux schémas

2. **Structure `health_cases`** : La table créée par la migration V2.0 semble avoir une structure différente de ce qui était prévu. Vérifier les colonnes réelles avant d'adapter le service.

3. **Création automatique de ferme** : Si un utilisateur n'a pas de ferme, le helper `getCurrentFarmId()` en créera une automatiquement.

---

**Prochaine étape** : Créer le helper `getCurrentFarmId()` et adapter `healthCases.ts` en priorité (bloquant).

