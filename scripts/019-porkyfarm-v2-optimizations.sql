-- ================================================
-- OPTIMISATIONS PORKYFARM v2.0
-- ================================================
-- Corrections RLS avec (SELECT auth.uid())
-- Index farms(user_id) pour performances RLS
-- Permissions SECURITY DEFINER limitées
-- ================================================

-- ====================
-- 1. INDEX FARMS USER_ID
-- ====================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);

-- ====================
-- 2. RLS TASKS OPTIMISÉES
-- ====================
-- Recréer les policies avec (SELECT auth.uid()) pour éviter réévaluation par ligne

DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;

CREATE POLICY "tasks_select_policy" ON tasks
FOR SELECT TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tasks_insert_policy" ON tasks
FOR INSERT TO authenticated
WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tasks_update_policy" ON tasks
FOR UPDATE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tasks_delete_policy" ON tasks
FOR DELETE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ====================
-- 3. RLS GESTATIONS OPTIMISÉES
-- ====================
DROP POLICY IF EXISTS "Users can view gestations from own farm" ON gestations;
DROP POLICY IF EXISTS "Users can insert gestations to own farm" ON gestations;
DROP POLICY IF EXISTS "Users can update gestations from own farm" ON gestations;
DROP POLICY IF EXISTS "Users can delete gestations from own farm" ON gestations;
DROP POLICY IF EXISTS "gestations_select_policy" ON gestations;
DROP POLICY IF EXISTS "gestations_insert_policy" ON gestations;
DROP POLICY IF EXISTS "gestations_update_policy" ON gestations;
DROP POLICY IF EXISTS "gestations_delete_policy" ON gestations;

CREATE POLICY "gestations_select_policy" ON gestations
FOR SELECT TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "gestations_insert_policy" ON gestations
FOR INSERT TO authenticated
WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "gestations_update_policy" ON gestations
FOR UPDATE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "gestations_delete_policy" ON gestations
FOR DELETE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ====================
-- 4. RLS HEALTH_CASES OPTIMISÉES
-- ====================
DROP POLICY IF EXISTS "Users can view health_cases from own farm" ON health_cases;
DROP POLICY IF EXISTS "Users can insert health_cases to own farm" ON health_cases;
DROP POLICY IF EXISTS "Users can update health_cases from own farm" ON health_cases;
DROP POLICY IF EXISTS "Users can delete health_cases from own farm" ON health_cases;
DROP POLICY IF EXISTS "health_cases_select_policy" ON health_cases;
DROP POLICY IF EXISTS "health_cases_insert_policy" ON health_cases;
DROP POLICY IF EXISTS "health_cases_update_policy" ON health_cases;
DROP POLICY IF EXISTS "health_cases_delete_policy" ON health_cases;

CREATE POLICY "health_cases_select_policy" ON health_cases
FOR SELECT TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "health_cases_insert_policy" ON health_cases
FOR INSERT TO authenticated
WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "health_cases_update_policy" ON health_cases
FOR UPDATE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "health_cases_delete_policy" ON health_cases
FOR DELETE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ====================
-- 5. RLS PIGS OPTIMISÉES
-- ====================
DROP POLICY IF EXISTS "Users can view pigs from own farm" ON pigs;
DROP POLICY IF EXISTS "Users can insert pigs to own farm" ON pigs;
DROP POLICY IF EXISTS "Users can update pigs from own farm" ON pigs;
DROP POLICY IF EXISTS "Users can delete pigs from own farm" ON pigs;
DROP POLICY IF EXISTS "pigs_select_policy" ON pigs;
DROP POLICY IF EXISTS "pigs_insert_policy" ON pigs;
DROP POLICY IF EXISTS "pigs_update_policy" ON pigs;
DROP POLICY IF EXISTS "pigs_delete_policy" ON pigs;

CREATE POLICY "pigs_select_policy" ON pigs
FOR SELECT TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "pigs_insert_policy" ON pigs
FOR INSERT TO authenticated
WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "pigs_update_policy" ON pigs
FOR UPDATE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "pigs_delete_policy" ON pigs
FOR DELETE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ====================
-- 6. PERMISSIONS FONCTIONS SECURITY DEFINER
-- ====================
-- Révoquer l'accès anon aux fonctions sensibles
REVOKE EXECUTE ON FUNCTION get_gestation_alerts(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION get_health_stats(uuid) FROM anon;

-- S'assurer que authenticated peut les exécuter
GRANT EXECUTE ON FUNCTION get_gestation_alerts(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_health_stats(uuid) TO authenticated;

-- ====================
-- 7. CONTRAINTE STATUS HEALTH_CASES
-- ====================
-- Ajouter une contrainte CHECK explicite pour status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'health_cases_status_valid'
    AND conrelid = 'health_cases'::regclass
  ) THEN
    ALTER TABLE public.health_cases
    ADD CONSTRAINT health_cases_status_valid
    CHECK (status IS NULL OR status IN ('active', 'ongoing', 'resolved', 'closed'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- ====================
-- 8. VÉRIFICATION
-- ====================
SELECT 'Optimisations appliquées avec succès' as status;

-- Lister les policies actives
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('pigs', 'health_cases', 'gestations', 'tasks', 'farms')
ORDER BY tablename, policyname;
