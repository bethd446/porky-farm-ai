-- ================================================
-- NETTOYAGE POLICIES RLS PORKYFARM
-- ================================================
-- Supprime les policies ALL redondantes
-- Active RLS sur toutes les tables critiques
-- ================================================

-- ====================
-- 1. SUPPRIMER LES POLICIES ALL REDONDANTES
-- ====================

-- PIGS: Supprimer policy ALL générique
DROP POLICY IF EXISTS "pigs_policy" ON pigs;
DROP POLICY IF EXISTS "Users can manage their own pigs" ON pigs;

-- GESTATIONS: Supprimer policy ALL générique
DROP POLICY IF EXISTS "gestations_policy" ON gestations;
DROP POLICY IF EXISTS "Users can manage their own gestations" ON gestations;

-- HEALTH_CASES: Supprimer policy ALL générique
DROP POLICY IF EXISTS "health_cases_policy" ON health_cases;
DROP POLICY IF EXISTS "Users can manage their own health_cases" ON health_cases;

-- TASKS: Supprimer policy ALL générique
DROP POLICY IF EXISTS "tasks_policy" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;

-- FARMS: Garder la policy mais vérifier qu'elle est correcte
DROP POLICY IF EXISTS "farms_policy" ON farms;

-- ====================
-- 2. RECRÉER POLICY FARMS OPTIMISÉE
-- ====================
DROP POLICY IF EXISTS "farms_select_policy" ON farms;
DROP POLICY IF EXISTS "farms_insert_policy" ON farms;
DROP POLICY IF EXISTS "farms_update_policy" ON farms;
DROP POLICY IF EXISTS "farms_delete_policy" ON farms;

CREATE POLICY "farms_select_policy" ON farms
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "farms_insert_policy" ON farms
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "farms_update_policy" ON farms
FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "farms_delete_policy" ON farms
FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()));

-- ====================
-- 3. ACTIVER RLS SUR TOUTES LES TABLES
-- ====================
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- ====================
-- 4. VÉRIFICATION FINALE
-- ====================

-- Afficher les tables avec RLS activée
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pigs', 'gestations', 'health_cases', 'tasks', 'farms')
ORDER BY tablename;

-- Afficher toutes les policies actives
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('pigs', 'gestations', 'health_cases', 'tasks', 'farms')
ORDER BY tablename, cmd, policyname;

-- Comptage des policies par table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('pigs', 'gestations', 'health_cases', 'tasks', 'farms')
GROUP BY tablename
ORDER BY tablename;

SELECT 'Nettoyage RLS terminé - Policies ALL supprimées, RLS activée' as status;
