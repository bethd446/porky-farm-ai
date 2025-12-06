# 🚀 Guide d'intégration V0 - PorcPro

## 📋 Vue d'ensemble

Ce guide vous aide à intégrer les composants générés par V0 de Vercel dans votre projet PorcPro existant, tout en préservant :
- ✅ L'authentification Supabase
- ✅ La structure de routing
- ✅ Les hooks personnalisés (useAuth, usePigs)
- ✅ Les intégrations Supabase
- ✅ Le système de design OKLCH

---

## 🎯 Stratégie d'intégration

### Option 1 : Intégration progressive (Recommandée)
Intégrer les composants V0 page par page, en testant à chaque étape.

### Option 2 : Nouvelle branche
Créer une branche `v0-integration` pour tester avant de merger.

### Option 3 : Remplacement complet
Remplacer complètement une page avec le nouveau design V0.

---

## 📁 Structure recommandée pour les composants V0

```
src/
├── components/
│   ├── v0/                    # Nouveaux composants V0
│   │   ├── dashboard/
│   │   ├── auth/
│   │   ├── pigs/
│   │   └── shared/
│   ├── features/               # Composants existants
│   └── layout/                 # Layout existant
```

---

## 🔧 Étapes d'intégration

### Étape 1 : Préparer l'environnement

1. **Créer un dossier pour les composants V0**
```bash
mkdir -p src/components/v0/{dashboard,auth,pigs,shared}
```

2. **Vérifier les dépendances**
Les composants V0 utilisent généralement :
- `@radix-ui/*` (déjà installé)
- `tailwindcss` (déjà installé)
- `lucide-react` (déjà installé)
- `framer-motion` (déjà installé)
- `clsx` ou `cn` (déjà installé via `@/lib/utils`)

### Étape 2 : Adapter les composants V0

#### A. Remplacer les imports
```typescript
// ❌ Avant (V0 génère souvent)
import { Button } from "@/components/ui/button"

// ✅ Après (Adapter à votre structure)
import { Button } from '@/components/ui/button'
```

#### B. Adapter les hooks d'authentification
```typescript
// ❌ Avant (V0 peut générer)
const { user } = useUser()

// ✅ Après (Utiliser votre hook)
import { useAuth } from '@/hooks/useAuth'
const { user, profile } = useAuth()
```

#### C. Adapter les appels Supabase
```typescript
// ❌ Avant (V0 peut générer)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)

// ✅ Après (Utiliser votre client)
import { supabase } from '@/integrations/supabase/client'
// ou
import { supabase } from '@/lib/supabase'
```

#### D. Adapter les types
```typescript
// ❌ Avant (V0 peut générer)
interface Pig {
  id: string
  name: string
}

// ✅ Après (Utiliser vos types)
import { Pig } from '@/types/database'
```

### Étape 3 : Intégrer dans les pages existantes

#### Exemple : Dashboard

**Avant (Dashboard.tsx actuel)**
```typescript
import Dashboard from '@/pages/Dashboard'
```

**Option A : Remplacer complètement**
```typescript
// src/pages/Dashboard.tsx
import { DashboardV0 } from '@/components/v0/dashboard/DashboardV0'

export default function Dashboard() {
  return <DashboardV0 />
}
```

**Option B : Intégration progressive**
```typescript
// src/pages/Dashboard.tsx
import { useAuth } from '@/hooks/useAuth'
import { StatsSection } from '@/components/v0/dashboard/StatsSection'
import { QuickActions } from '@/components/features/QuickActions' // Existant

export default function Dashboard() {
  const { user } = useAuth()
  
  return (
    <div>
      <StatsSection /> {/* Nouveau de V0 */}
      <QuickActions /> {/* Existant */}
    </div>
  )
}
```

---

## 🔄 Migration des données

### Connexion à Supabase

Tous les composants V0 doivent utiliser votre client Supabase existant :

```typescript
// ✅ Correct
import { supabase } from '@/integrations/supabase/client'

// Récupérer les données
const { data, error } = await supabase
  .from('pigs')
  .select('*')
  .eq('user_id', user.id)
```

### Utilisation de React Query

Si V0 génère des appels directs, les adapter à React Query :

```typescript
// ❌ Avant (V0 peut générer)
const [pigs, setPigs] = useState([])
useEffect(() => {
  fetchPigs().then(setPigs)
}, [])

// ✅ Après (Utiliser React Query)
import { useQuery } from '@tanstack/react-query'
const { data: pigs, isLoading } = useQuery({
  queryKey: ['pigs'],
  queryFn: async () => {
    const { data } = await supabase
      .from('pigs')
      .select('*')
      .eq('user_id', user.id)
    return data
  }
})
```

---

## 🎨 Adaptation du design system

### Couleurs OKLCH

Votre projet utilise OKLCH. Vérifier que les composants V0 utilisent les variables CSS :

```typescript
// ✅ Correct
className="bg-primary text-primary-foreground"

// ❌ À éviter
className="bg-green-500 text-white"
```

### Classes Tailwind personnalisées

Votre projet a des animations personnalisées :
- `animate-fade-in-up`
- `animate-scale-in`
- `animate-pulse-soft`

Les ajouter aux composants V0 si nécessaire.

---

## 📝 Checklist d'intégration

Pour chaque composant V0 :

- [ ] **Imports adaptés** : Utiliser `@/` au lieu de `@/components`
- [ ] **Authentification** : Utiliser `useAuth()` au lieu de hooks V0
- [ ] **Supabase** : Utiliser le client existant
- [ ] **Types** : Utiliser les types de `@/types/database`
- [ ] **React Query** : Utiliser pour les appels API
- [ ] **Design system** : Utiliser les couleurs OKLCH
- [ ] **Routing** : Compatible avec React Router existant
- [ ] **Responsive** : Testé sur mobile et desktop
- [ ] **Accessibilité** : Vérifier les attributs ARIA
- [ ] **Performance** : Lazy loading si nécessaire

---

## 🧪 Tests

### Test local
```bash
npm run dev
```

### Test build
```bash
npm run build
```

### Test avec Supabase
```bash
npm run check:supabase
```

---

## 🔀 Exemple complet : Intégrer un Dashboard V0

### 1. Créer le composant V0

```typescript
// src/components/v0/dashboard/DashboardV0.tsx
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DashboardV0() {
  const { user } = useAuth()
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      const [pigsRes, transactionsRes] = await Promise.all([
        supabase.from('pigs').select('*').eq('user_id', user!.id),
        supabase.from('transactions').select('*').eq('user_id', user!.id)
      ])
      
      return {
        totalPigs: pigsRes.data?.length || 0,
        revenue: transactionsRes.data
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0
      }
    },
    enabled: !!user
  })
  
  if (isLoading) {
    return <div>Chargement...</div>
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Porcs</p>
              <p className="text-2xl font-bold">{stats?.totalPigs || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenus</p>
              <p className="text-2xl font-bold">{stats?.revenue || 0} FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Intégrer dans la page

```typescript
// src/pages/Dashboard.tsx
import { DashboardV0 } from '@/components/v0/dashboard/DashboardV0'

export default function Dashboard() {
  return <DashboardV0 />
}
```

### 3. Tester

```bash
npm run dev
# Visiter http://localhost:5173/dashboard
```

---

## 🚨 Problèmes courants et solutions

### Problème 1 : Erreur "useAuth must be used within AuthProvider"
**Solution** : S'assurer que le composant est dans `<AuthProvider>`

### Problème 2 : Erreur de types TypeScript
**Solution** : Importer les types depuis `@/types/database`

### Problème 3 : Les données ne s'affichent pas
**Solution** : Vérifier que `user_id` est correctement filtré dans les requêtes Supabase

### Problème 4 : Styles différents
**Solution** : Vérifier que les classes Tailwind utilisent les variables OKLCH

---

## 📚 Ressources

- **V0 Documentation** : https://v0.dev/docs
- **Supabase Client** : `src/integrations/supabase/client.ts`
- **Types Database** : `src/types/database.ts`
- **Hooks** : `src/hooks/useAuth.tsx`, `src/hooks/usePigs.ts`
- **Design System** : `src/index.css` (OKLCH)

---

## 💡 Conseils

1. **Commencer petit** : Intégrer un composant à la fois
2. **Tester souvent** : Vérifier après chaque intégration
3. **Préserver la fonctionnalité** : Ne pas casser l'existant
4. **Documenter** : Noter les changements importants
5. **Versionner** : Utiliser Git pour revenir en arrière si besoin

---

**Bon courage avec l'intégration ! 🚀**

