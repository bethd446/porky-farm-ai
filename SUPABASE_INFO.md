# 📊 Informations Supabase - PorcPro

## 🔑 Identifiants de connexion

### URL Supabase
```
https://cjzyvcrnwqejlplbkexg.supabase.co
```

### Clé API Publique (Anon Key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A
```

---

## 🔐 Variables d'environnement

### Pour le développement local (`.env`)
```env
VITE_SUPABASE_URL=https://cjzyvcrnwqejlplbkexg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A
```

### Pour Vercel (Environment Variables)
1. **VITE_SUPABASE_URL**
   - Value: `https://cjzyvcrnwqejlplbkexg.supabase.co`

2. **VITE_SUPABASE_PUBLISHABLE_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A`

---

## 📁 Structure de la base de données

### Tables principales
- `profiles` - Profils utilisateurs
- `pigs` - Porcs
- `feed_formulations` - Formulations d'aliments
- `events` - Événements (vaccinations, pesées, etc.)
- `transactions` - Transactions financières
- `gestations` - Suivi des gestations
- `health_records` - Dossiers de santé
- `pig_photos` - Photos des porcs
- `ai_insights` - Insights IA
- `breeding_records` - Dossiers de reproduction

### Migrations disponibles
- `20251205164658_6d1bd718-acac-42e6-9f12-3a85afb7a2c9.sql` - Tables initiales
- `20251205164724_965a0271-2793-4cfa-bd20-37f29078d04b.sql` - Fix search_path
- `20251207000000_advanced_features.sql` - Fonctionnalités avancées

---

## 🔧 Edge Functions

### Fonction disponible
- `generate-feed-formulation` - Génération de formulation d'aliment par IA
  - Path: `supabase/functions/generate-feed-formulation/index.ts`

---

## 🔒 Sécurité

### Row Level Security (RLS)
- ✅ Activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Politiques RLS configurées pour chaque table

### Protection des mots de passe
- ✅ Protection contre les mots de passe compromis activée
- Vérification via HaveIBeenPwned.org

---

## 📝 Compte de test

### Identifiants
- **Email**: `openformac@gmail.com`
- **Mot de passe**: `Paname12@@`

---

## 🔗 Liens utiles

### Dashboard Supabase
```
https://supabase.com/dashboard/project/cjzyvcrnwqejlplbkexg
```

### API REST
```
https://cjzyvcrnwqejlplbkexg.supabase.co/rest/v1/
```

### Documentation API
```
https://cjzyvcrnwqejlplbkexg.supabase.co/docs
```

---

## ⚙️ Configuration

### Client Supabase
- Fichier: `src/integrations/supabase/client.ts`
- Import: `import { supabase } from '@/integrations/supabase/client'`
- TypeScript: Types générés dans `src/integrations/supabase/types.ts`

### Options d'authentification
- `persistSession: true` - Session persistée dans localStorage
- `autoRefreshToken: true` - Rafraîchissement automatique des tokens
- `detectSessionInUrl: true` - Détection de session dans l'URL

---

## 📊 Statut du projet

- ✅ Base de données configurée
- ✅ Migrations appliquées
- ✅ RLS activé
- ✅ Edge Functions déployées
- ✅ Authentification fonctionnelle
- ✅ Protection des mots de passe activée

---

**⚠️ Note de sécurité**: La clé publique (anon key) peut être partagée publiquement. Elle est sécurisée par Row Level Security (RLS). Ne jamais exposer la clé secrète (service_role key) !

