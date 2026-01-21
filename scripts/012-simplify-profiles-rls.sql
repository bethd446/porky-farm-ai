-- =====================================================
-- Script : Simplification des politiques RLS pour profiles
-- =====================================================
-- Objectif : Nettoyer les politiques RLS pour profiles et ne garder
-- que les 2 politiques essentielles : "read own" et "update own"
-- 
-- La RPC complete_onboarding utilise SECURITY DEFINER, donc elle
-- contourne les politiques RLS de toute façon.

-- 1. Supprimer toutes les politiques existantes pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_write_all_profiles" ON public.profiles;

-- 2. Créer les 2 politiques essentielles uniquement

-- Politique 1 : Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Politique 2 : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Vérification : Afficher les politiques actives
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Note : 
-- - La RPC complete_onboarding utilise SECURITY DEFINER, donc elle
--   contourne les politiques RLS et peut mettre à jour le profil
--   même si l'utilisateur n'a pas directement les permissions UPDATE.
-- - Pour les mises à jour directes (sans RPC), l'utilisateur doit
--   avoir les permissions UPDATE via la politique "Users can update own profile".

