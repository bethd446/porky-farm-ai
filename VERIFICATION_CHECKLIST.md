# Checklist de Vérification - PorcPro Supabase

## ✅ Étape 1 : Vérifier les Tables

Exécutez ce SQL dans Supabase SQL Editor pour vérifier que toutes les tables existent :

```sql
-- Vérifier l'existence des tables
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
ORDER BY table_name;
```

**Résultat attendu :** 5 tables listées

---

## ✅ Étape 2 : Vérifier les Colonnes

### Table: profiles
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```

**Colonnes attendues :**
- id (uuid)
- full_name (text)
- phone (text)
- farm_name (text)
- subscription_tier (text)
- formulations_count (integer)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

### Table: pigs
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pigs'
ORDER BY ordinal_position;
```

**Colonnes attendues :** 13 colonnes (id, user_id, tag_number, birth_date, sex, breed, status, weight_history, photo_url, mother_id, father_id, notes, created_at, updated_at)

---

## ✅ Étape 3 : Vérifier RLS (Row Level Security)

```sql
-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
ORDER BY tablename;
```

**Résultat attendu :** `rowsecurity = true` pour toutes les tables

---

## ✅ Étape 4 : Vérifier les Politiques RLS

```sql
-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Politiques attendues :**
- **profiles** : 3 politiques (SELECT, INSERT, UPDATE)
- **pigs** : 4 politiques (SELECT, INSERT, UPDATE, DELETE)
- **feed_formulations** : 3 politiques (SELECT, INSERT, DELETE)
- **events** : 4 politiques (SELECT, INSERT, UPDATE, DELETE)
- **transactions** : 4 politiques (SELECT, INSERT, UPDATE, DELETE)

**Total attendu :** 18 politiques

---

## ✅ Étape 5 : Vérifier les Indexes

```sql
-- Vérifier les index
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
ORDER BY tablename, indexname;
```

**Indexes attendus :**
- **pigs** : idx_pigs_user_id, idx_pigs_status
- **events** : idx_events_user_id, idx_events_event_date
- **transactions** : idx_transactions_user_id, idx_transactions_date

---

## ✅ Étape 6 : Vérifier les Fonctions

```sql
-- Vérifier les fonctions
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at_column')
ORDER BY routine_name;
```

**Fonctions attendues :**
- `handle_new_user` (FUNCTION)
- `update_updated_at_column` (FUNCTION)

---

## ✅ Étape 7 : Vérifier les Triggers

```sql
-- Vérifier les triggers
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Triggers attendus :**
- `on_auth_user_created` sur `auth.users` (AFTER INSERT)
- `update_profiles_updated_at` sur `public.profiles` (BEFORE UPDATE)
- `update_pigs_updated_at` sur `public.pigs` (BEFORE UPDATE)

---

## ✅ Étape 8 : Vérifier les Clés Étrangères

```sql
-- Vérifier les foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

**Foreign keys attendues :**
- `profiles.id` → `auth.users.id` (CASCADE)
- `pigs.user_id` → `auth.users.id` (CASCADE)
- `pigs.mother_id` → `pigs.id` (SET NULL)
- `pigs.father_id` → `pigs.id` (SET NULL)
- `feed_formulations.user_id` → `auth.users.id` (CASCADE)
- `events.user_id` → `auth.users.id` (CASCADE)
- `events.pig_id` → `pigs.id` (SET NULL)
- `transactions.user_id` → `auth.users.id` (CASCADE)

---

## ✅ Étape 9 : Test Complet (Script Unique)

Exécutez ce script complet pour une vérification rapide :

```sql
-- ============================================
-- SCRIPT DE VÉRIFICATION COMPLÈTE
-- ============================================

-- 1. Tables
SELECT 'TABLES' as check_type, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
UNION ALL

-- 2. RLS activé
SELECT 'RLS ENABLED', COUNT(*)
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
  AND rowsecurity = true
UNION ALL

-- 3. Politiques RLS
SELECT 'RLS POLICIES', COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL

-- 4. Indexes
SELECT 'INDEXES', COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
UNION ALL

-- 5. Fonctions
SELECT 'FUNCTIONS', COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at_column')
UNION ALL

-- 6. Triggers
SELECT 'TRIGGERS', COUNT(*)
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
  AND trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at', 'update_pigs_updated_at');
```

**Résultats attendus :**
- TABLES: 5
- RLS ENABLED: 5
- RLS POLICIES: 18
- INDEXES: 6+ (incluant les primary keys)
- FUNCTIONS: 2
- TRIGGERS: 3

---

## 🎯 Checklist Rapide

- [ ] 5 tables créées
- [ ] RLS activé sur toutes les tables
- [ ] 18 politiques RLS créées
- [ ] 6+ indexes créés
- [ ] 2 fonctions créées
- [ ] 3 triggers créés
- [ ] 8 foreign keys créées

---

## 🚨 Si quelque chose manque

Si un élément manque, indiquez lequel et je vous aiderai à le créer manuellement.

