# 🏗️ Guide de Restructuration PorkyFarm

## ✅ PHASE 1 TERMINÉE : Structure créée

La nouvelle structure `src/` a été créée **SANS modifier** les fichiers existants.

### Structure actuelle

```
porkyfarm-mobile/
├── app/                    # ✅ INTACT - Expo Router
├── components/             # ✅ INTACT - Anciens composants
├── services/               # ✅ INTACT - Anciens services
├── hooks/                  # ✅ INTACT - Anciens hooks
├── lib/                    # ✅ INTACT - Anciennes libs
├── constants/              # ✅ INTACT - Anciennes constantes
│
└── src/                    # 🆕 NOUVELLE STRUCTURE
    ├── features/           # Modules métier
    ├── shared/             # Code partagé
    ├── config/             # Configuration
    └── assets/             # Assets organisés
```

## 📋 PROCHAINES PHASES (À FAIRE PROGRESSIVEMENT)

### Phase 2 : Migration Services (Optionnel)

**Objectif** : Copier les services dans `src/shared/services/` avec alias de compatibilité

```bash
# Exemple pour un service
cp services/animals.ts src/shared/services/animals.ts

# Créer un alias dans l'ancien fichier
# services/animals.ts
export * from '../src/shared/services/animals'
```

**⚠️ IMPORTANT** : Tester après chaque service migré

### Phase 3 : Migration Hooks (Optionnel)

**Objectif** : Copier les hooks dans `src/shared/hooks/` avec alias

```bash
cp hooks/useData.ts src/shared/hooks/useData.ts
```

### Phase 4 : Migration Composants (Optionnel)

**Objectif** : Organiser les composants par catégorie dans `src/shared/components/`

### Phase 5 : Organisation Features (Optionnel)

**Objectif** : Créer les composants/hooks/services spécifiques par feature

## 🎯 UTILISATION ACTUELLE

### Option 1 : Utiliser l'ancienne structure (recommandé pour l'instant)

```typescript
// Continuer à utiliser les imports actuels
import { animalsService } from '@/services/animals'
import { useData } from '@/hooks/useData'
```

### Option 2 : Utiliser la nouvelle structure (quand tout sera migré)

```typescript
// Utiliser les nouveaux imports
import { animalsService } from '@/features/livestock'
import { useData } from '@/shared/hooks'
import { APP_NAME } from '@/config/constants'
```

## ✅ CE QUI FONCTIONNE DÉJÀ

- ✅ Structure `src/` créée
- ✅ Fichiers d'index avec re-exports
- ✅ `tsconfig.json` mis à jour avec les paths
- ✅ Types de base créés (`src/shared/types/`)
- ✅ Configuration créée (`src/config/`)
- ✅ Structure features créée

## ⚠️ CE QUI N'EST PAS ENCORE MIGRÉ

- ⏳ Services (toujours dans `services/`)
- ⏳ Hooks (toujours dans `hooks/`)
- ⏳ Composants (toujours dans `components/`)
- ⏳ Utilitaires (toujours dans `lib/`)

## 🧪 TESTER

```bash
# Vérifier TypeScript
npx tsc --noEmit

# Vérifier que l'app démarre
npx expo start

# Si tout fonctionne, continuer la migration
```

## 📝 RÈGLES D'OR

1. ✅ **NE JAMAIS supprimer** les anciens fichiers avant d'avoir testé
2. ✅ **Tester après chaque migration**
3. ✅ **Créer des alias de compatibilité** pour les imports
4. ✅ **Faire des commits Git** entre chaque étape
5. ✅ **Garder app/ intact** (Expo Router)

## 🚀 PROCHAINES ÉTAPES RECOMMANDÉES

1. **Tester l'app actuelle** pour s'assurer qu'elle fonctionne
2. **Migrer UN service à la fois** (commencer par `animals.ts`)
3. **Tester après chaque migration**
4. **Continuer progressivement**

---

**Statut** : Phase 1 terminée ✅ - Prêt pour migration progressive

