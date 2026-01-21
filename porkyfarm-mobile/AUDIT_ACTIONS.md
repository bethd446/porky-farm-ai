# 🎯 PLAN D'ACTION - CORRECTIONS AUDIT

## 🔴 ACTIONS IMMÉDIATES (Aujourd'hui)

### 1. Créer un logger utilitaire
**Fichier:** `lib/logger.ts`

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDev = __DEV__

  debug(message: string, ...args: any[]) {
    if (this.isDev) console.log(`[DEBUG] ${message}`, ...args)
  }

  info(message: string, ...args: any[]) {
    if (this.isDev) console.log(`[INFO] ${message}`, ...args)
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args)
  }

  error(message: string, error?: Error | unknown, ...args: any[]) {
    console.error(`[ERROR] ${message}`, error, ...args)
    // TODO: Envoyer à Sentry en production
  }
}

export const logger = new Logger()
```

**Remplacement:** Remplacer tous les `console.log/error/warn` par `logger.debug/error/warn`

---

### 2. Valider les variables d'environnement
**Fichier:** `lib/env.ts`

```typescript
// lib/env.ts
export function validateEnv() {
  const required = {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(', ')}\n` +
      `Vérifiez eas.json ou .env.local`
    )
  }
}
```

**Utilisation:** Appeler `validateEnv()` dans `app/_layout.tsx`

---

### 3. Créer helper pour services
**Fichier:** `lib/serviceHelpers.ts`

```typescript
// lib/serviceHelpers.ts
import { getCurrentFarmId } from './farmHelpers'

export async function withFarmId<T>(
  farmId: string | undefined,
  operation: (farmId: string) => Promise<{ data: T | null; error: Error | null }>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const targetFarmId = farmId || await getCurrentFarmId()
    if (!targetFarmId) {
      return { data: null, error: new Error('Aucune ferme trouvée') }
    }
    return await operation(targetFarmId)
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Erreur inconnue')
    return { data: null, error }
  }
}
```

**Utilisation:** Factoriser tous les services

---

## ⚠️ ACTIONS COURT TERME (Cette semaine)

### 4. Remplacer les types `any`
**Fichiers:** Voir `AUDIT_COMPLET.md` section 1.2

**Script de remplacement:**
```typescript
// Remplacer progressivement
catch (err: any) → catch (err: unknown)
filter((g: any) => ...) → filter((g: Gestation) => ...)
router.push(route as any) → router.push(route as `/(tabs)/...`)
```

---

### 5. Corriger gestion d'erreurs
**Fichiers:** `services/*.ts`

**Pattern à appliquer:**
```typescript
// ❌ AVANT
catch (err: unknown) {
  return { data: [], error: null }
}

// ✅ APRÈS
catch (err: unknown) {
  const error = err instanceof Error ? err : new Error('Erreur inconnue')
  logger.error('[Service] Error:', error)
  return { data: [], error }
}
```

---

### 6. Utiliser paths `@/*` partout
**Fichiers:** Tous les fichiers dans `app/`

**Remplacement:**
```typescript
// ❌ AVANT
import { animalsService } from '../../../services/animals'

// ✅ APRÈS
import { animalsService } from '@/services/animals'
```

---

## 📊 ACTIONS MOYEN TERME (Ce mois)

### 7. Ajouter ESLint
**Fichier:** `.eslintrc.js`

```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
}
```

---

### 8. Ajouter Prettier
**Fichier:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

### 9. Créer `.env.example`
**Fichier:** `.env.example`

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key

# API (optionnel)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

1. ✅ **Logger** (30 min) - Base pour tout le reste
2. ✅ **Validation env** (15 min) - Évite les crashes
3. ✅ **Helper services** (1h) - Factorise le code
4. ✅ **Remplacer console.log** (2h) - Utiliser le logger
5. ✅ **Remplacer any** (2h) - Sécurité TypeScript
6. ✅ **Corriger erreurs** (1h) - Meilleur debugging
7. ✅ **Paths @/*** (1h) - Meilleure lisibilité
8. ✅ **ESLint + Prettier** (1h) - Qualité code

**Total estimé:** ~9h

---

## 🧪 TESTS À AJOUTER

### Tests unitaires prioritaires

1. **Services**
   - `animalsService.getAll()`
   - `healthCasesService.create()`
   - `gestationsService.getAlerts()`

2. **Hooks**
   - `useData()`
   - `useFocusRefresh()`

3. **Utils**
   - `getCurrentFarmId()`
   - `calculateExpectedFarrowingDate()`
   - `mapSexToCategory()`

---

## 📝 NOTES

- Commencer par les actions P1 (critiques)
- Tester après chaque modification
- Faire des commits Git fréquents
- Documenter les changements

