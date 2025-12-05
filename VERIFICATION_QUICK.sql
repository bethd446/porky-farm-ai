-- ============================================
-- SCRIPT DE VÉRIFICATION RAPIDE - PorcPro
-- Copiez et exécutez dans Supabase SQL Editor
-- ============================================

-- 1. Vérifier les Tables (doit retourner 5)
SELECT '✅ TABLES' as verification, COUNT(*) as count, 
  CASE WHEN COUNT(*) = 5 THEN 'OK' ELSE 'MANQUANT' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions');

-- 2. Vérifier RLS activé (doit retourner 5)
SELECT '✅ RLS ENABLED' as verification, COUNT(*) as count,
  CASE WHEN COUNT(*) = 5 THEN 'OK' ELSE 'MANQUANT' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
  AND rowsecurity = true;

-- 3. Vérifier les Politiques RLS (doit retourner 18)
SELECT '✅ RLS POLICIES' as verification, COUNT(*) as count,
  CASE WHEN COUNT(*) >= 18 THEN 'OK' ELSE 'MANQUANT' END as status
FROM pg_policies
WHERE schemaname = 'public';

-- 4. Vérifier les Indexes (doit retourner au moins 6)
SELECT '✅ INDEXES' as verification, COUNT(*) as count,
  CASE WHEN COUNT(*) >= 6 THEN 'OK' ELSE 'MANQUANT' END as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions');

-- 5. Vérifier les Fonctions (doit retourner 2)
SELECT '✅ FUNCTIONS' as verification, COUNT(*) as count,
  CASE WHEN COUNT(*) = 2 THEN 'OK' ELSE 'MANQUANT' END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at_column');

-- 6. Vérifier les Triggers (doit retourner 3)
SELECT '✅ TRIGGERS' as verification, COUNT(*) as count,
  CASE WHEN COUNT(*) >= 3 THEN 'OK' ELSE 'MANQUANT' END as status
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
  AND trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at', 'update_pigs_updated_at');

-- ============================================
-- DÉTAILS PAR TABLE
-- ============================================

-- Détails des tables
SELECT 
  '📋 TABLE: ' || table_name as info,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = t.table_name) || ' colonnes' as details
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'pigs', 'feed_formulations', 'events', 'transactions')
ORDER BY table_name;

-- Détails des politiques par table
SELECT 
  '🔒 POLICIES: ' || tablename as info,
  COUNT(*) || ' politiques' as details
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

