# Guide d'exécution des migrations SQL - Supabase

## ⚠️ Important : Ne copiez PAS le nom du fichier !

Vous devez copier le **CONTENU** du fichier SQL, pas son nom.

## 📋 Instructions étape par étape

### Étape 1 : Ouvrir le fichier de migration

1. Ouvrez le fichier : `supabase/migrations/20251205164658_6d1bd718-acac-42e6-9f12-3a85afb7a2c9.sql`
2. **Sélectionnez TOUT le contenu** (Cmd+A ou Ctrl+A)
3. **Copiez** le contenu (Cmd+C ou Ctrl+C)

### Étape 2 : Aller dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche

### Étape 3 : Coller et exécuter

1. Dans l'éditeur SQL, **collez le contenu** que vous avez copié (Cmd+V ou Ctrl+V)
2. Cliquez sur **Run** ou appuyez sur Cmd+Enter (Mac) / Ctrl+Enter (Windows)

### Étape 4 : Répéter pour la deuxième migration

1. Ouvrez le fichier : `supabase/migrations/20251205164724_965a0271-2793-4cfa-bd20-37f29078d04b.sql`
2. Copiez son contenu
3. Collez dans SQL Editor
4. Exécutez

## ✅ Vérification

Après avoir exécuté les deux migrations, vous devriez voir :
- ✅ 5 tables créées (profiles, pigs, feed_formulations, events, transactions)
- ✅ RLS activé sur toutes les tables
- ✅ Politiques de sécurité créées
- ✅ Triggers et fonctions créés

## 🚫 Erreurs courantes à éviter

### ❌ MAUVAIS : Copier le nom du fichier
```
20251205164658_6d1bd718-acac-42e6-9f12-3a85afb7a2c9.sql
```

### ✅ BON : Copier le contenu du fichier
```sql
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
);
```

## 📝 Alternative : Utiliser le contenu ci-dessous

Si vous préférez, vous pouvez copier directement le contenu ci-dessous dans Supabase SQL Editor.

