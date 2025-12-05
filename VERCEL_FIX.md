# 🔧 Correction Problème Vercel - Variables d'Environnement

## ❌ Problème Identifié

Le code utilise `VITE_SUPABASE_PUBLISHABLE_KEY` mais les variables d'environnement Vercel utilisent `VITE_SUPABASE_ANON_KEY`.

## ✅ Solution

### Dans Vercel - Settings → Environment Variables

**Supprimez** la variable :
- `VITE_SUPABASE_ANON_KEY`

**Ajoutez** la variable :
- **Key**: `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A`
- **Environments**: Production, Preview, Development

### Variables Requises

Vous devez avoir **exactement** ces deux variables :

1. **VITE_SUPABASE_URL**
   - Value: `https://cjzyvcrnwqejlplbkexg.supabase.co`

2. **VITE_SUPABASE_PUBLISHABLE_KEY** (⚠️ IMPORTANT : pas ANON_KEY)
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A`

## 📋 Étapes de Correction

1. Allez dans **Vercel Dashboard** → Votre projet
2. **Settings** → **Environment Variables**
3. Supprimez `VITE_SUPABASE_ANON_KEY` si elle existe
4. Ajoutez `VITE_SUPABASE_PUBLISHABLE_KEY` avec la valeur ci-dessus
5. Vérifiez que `VITE_SUPABASE_URL` est bien présente
6. Allez dans **Deployments**
7. Cliquez sur **⋯** (trois points) du dernier déploiement
8. Sélectionnez **Redeploy**

## 🔍 Vérification

Après le redéploiement, votre application devrait fonctionner correctement.

Si le problème persiste :
- Vérifiez les logs de build dans Vercel
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que les variables sont bien définies dans Vercel

