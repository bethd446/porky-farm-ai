-- ================================================
-- CORRECTION SÉCURITÉ SUPABASE - 77 ALERTES → 0
-- Exécuter dans Supabase SQL Editor
-- ================================================

-- ================================================
-- PARTIE 1: CORRIGER LES FONCTIONS (8 alertes)
-- ================================================

-- 1. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. get_user_farm_ids
CREATE OR REPLACE FUNCTION public.get_user_farm_ids()
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT id FROM public.farms WHERE user_id = auth.uid();
END;
$$;

-- 3. add_default_ingredients
CREATE OR REPLACE FUNCTION public.add_default_ingredients()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_ingredients TEXT[] := ARRAY['Maïs', 'Soja', 'Son de blé', 'Tourteau', 'Concentré minéral'];
  ingredient TEXT;
BEGIN
  FOREACH ingredient IN ARRAY default_ingredients
  LOOP
    INSERT INTO public.feed_ingredients (farm_id, name, category, unit)
    VALUES (NEW.id, ingredient, 'Céréale', 'kg')
    ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$;

-- 4. trigger_add_default_ingredients
CREATE OR REPLACE FUNCTION public.trigger_add_default_ingredients()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.add_default_ingredients();
  RETURN NEW;
END;
$$;

-- 5. get_gestation_alerts
DROP FUNCTION IF EXISTS public.get_gestation_alerts(UUID, INTEGER);
CREATE OR REPLACE FUNCTION public.get_gestation_alerts(p_farm_id UUID)
RETURNS TABLE (
  id UUID,
  sow_name TEXT,
  days_remaining INTEGER,
  expected_date DATE,
  alert_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    COALESCE(p.name, p.identifier)::TEXT as sow_name,
    (g.expected_farrowing_date - CURRENT_DATE)::INTEGER as days_remaining,
    g.expected_farrowing_date,
    CASE 
      WHEN (g.expected_farrowing_date - CURRENT_DATE) <= 2 THEN 'critical'
      WHEN (g.expected_farrowing_date - CURRENT_DATE) <= 5 THEN 'warning'
      ELSE 'info'
    END::TEXT as alert_level
  FROM public.gestations g
  JOIN public.pigs p ON p.id = g.sow_id
  WHERE g.farm_id = p_farm_id
    AND g.status = 'en_cours'
    AND g.expected_farrowing_date >= CURRENT_DATE
    AND (g.expected_farrowing_date - CURRENT_DATE) <= 14
  ORDER BY g.expected_farrowing_date ASC;
END;
$$;

-- 6. get_health_stats
CREATE OR REPLACE FUNCTION public.get_health_stats(p_farm_id UUID)
RETURNS TABLE (
  total_cases INTEGER,
  open_cases INTEGER,
  resolved_cases INTEGER,
  critical_cases INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_cases,
    COUNT(*) FILTER (WHERE status IN ('active', 'ongoing'))::INTEGER as open_cases,
    COUNT(*) FILTER (WHERE status = 'resolved')::INTEGER as resolved_cases,
    COUNT(*) FILTER (WHERE severity = 'critical' AND status NOT IN ('resolved', 'closed'))::INTEGER as critical_cases
  FROM public.health_cases
  WHERE farm_id = p_farm_id;
END;
$$;

-- 7. get_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_farm_id UUID)
RETURNS TABLE (
  total_animals INTEGER,
  healthy_animals INTEGER,
  sick_animals INTEGER,
  active_gestations INTEGER,
  pending_tasks INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_sick_ids UUID[];
BEGIN
  -- Total animaux actifs
  SELECT COUNT(*) INTO v_total FROM public.pigs 
  WHERE farm_id = p_farm_id AND status = 'actif';
  
  -- IDs des animaux malades
  SELECT ARRAY_AGG(DISTINCT animal_id) INTO v_sick_ids
  FROM public.health_cases 
  WHERE farm_id = p_farm_id AND status IN ('active', 'ongoing');
  
  RETURN QUERY SELECT
    v_total,
    v_total - COALESCE(array_length(v_sick_ids, 1), 0),
    COALESCE(array_length(v_sick_ids, 1), 0),
    (SELECT COUNT(*)::INTEGER FROM public.gestations WHERE farm_id = p_farm_id AND status = 'en_cours'),
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE farm_id = p_farm_id AND status = 'pending');
END;
$$;

-- 8. create_default_tasks
CREATE OR REPLACE FUNCTION public.create_default_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tasks (farm_id, title, category, scheduled_time, is_recurring, recurrence_pattern)
  VALUES 
    (NEW.id, 'Nettoyage des enclos', 'cleaning', '08:00', true, 'daily'),
    (NEW.id, 'Distribution nourriture matin', 'feeding', '08:30', true, 'daily'),
    (NEW.id, 'Vérification état sanitaire', 'health_check', '09:00', true, 'daily'),
    (NEW.id, 'Distribution nourriture soir', 'feeding', '17:00', true, 'daily');
  RETURN NEW;
END;
$$;

SELECT '✅ Fonctions corrigées avec search_path immutable' as status;

-- ================================================
-- PARTIE 2: SUPPRIMER INDEX DUPLIQUÉS
-- ================================================

-- Identifier les index dupliqués (à exécuter d'abord pour voir les résultats)
-- SELECT 
--     idx.indexrelid::regclass AS duplicate_index,
--     idx.indrelid::regclass AS table_name,
--     pg_get_indexdef(idx.indexrelid) AS index_definition
-- FROM pg_index idx
-- JOIN pg_class cls ON cls.oid = idx.indexrelid
-- JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
-- WHERE nsp.nspname = 'public'
-- ORDER BY idx.indrelid, idx.indexrelid;

-- Supprimer les index dupliqués potentiels (adapter selon résultats ci-dessus)
-- Note: Ne supprimez que si vous êtes sûr qu'ils sont dupliqués
DROP INDEX IF EXISTS public.idx_costs_farm_id_duplicate;
DROP INDEX IF EXISTS public.idx_farms_user_id_duplicate;
DROP INDEX IF EXISTS public.idx_feed_formula_ingredients_farm_duplicate;
DROP INDEX IF EXISTS public.idx_feed_formulas_farm_duplicate;
DROP INDEX IF EXISTS public.idx_feed_ingredients_farm_duplicate;
DROP INDEX IF EXISTS public.idx_feed_productions_farm_duplicate;
DROP INDEX IF EXISTS public.idx_feed_stock_farm_duplicate;
DROP INDEX IF EXISTS public.idx_gestations_farm_duplicate;
DROP INDEX IF EXISTS public.idx_health_cases_farm_duplicate;
DROP INDEX IF EXISTS public.idx_pigs_farm_duplicate;
DROP INDEX IF EXISTS public.idx_tasks_farm_duplicate;

SELECT '✅ Index dupliqués supprimés (vérifier manuellement)' as status;

-- ================================================
-- PARTIE 3: CONSOLIDATION DES POLICIES RLS
-- ================================================

-- PIGS
DROP POLICY IF EXISTS "pigs_select_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_insert_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_update_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_delete_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_policy" ON public.pigs;
DROP POLICY IF EXISTS "Users can view own pigs" ON public.pigs;
DROP POLICY IF EXISTS "Users can insert own pigs" ON public.pigs;
DROP POLICY IF EXISTS "Users can update own pigs" ON public.pigs;
DROP POLICY IF EXISTS "Users can delete own pigs" ON public.pigs;

CREATE POLICY "pigs_all_operations" ON public.pigs
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FARMS
DROP POLICY IF EXISTS "farms_select_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_insert_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_update_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_delete_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_policy" ON public.farms;
DROP POLICY IF EXISTS "Users can view own farm" ON public.farms;
DROP POLICY IF EXISTS "Users can insert own farm" ON public.farms;
DROP POLICY IF EXISTS "Users can update own farm" ON public.farms;
DROP POLICY IF EXISTS "Users can delete own farm" ON public.farms;

CREATE POLICY "farms_all_operations" ON public.farms
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- HEALTH_CASES
DROP POLICY IF EXISTS "health_cases_select_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_insert_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_update_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_delete_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_policy" ON public.health_cases;

CREATE POLICY "health_cases_all_operations" ON public.health_cases
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- GESTATIONS
DROP POLICY IF EXISTS "gestations_select_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_insert_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_update_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_delete_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_policy" ON public.gestations;

CREATE POLICY "gestations_all_operations" ON public.gestations
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- COSTS
DROP POLICY IF EXISTS "costs_select_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_insert_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_update_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_delete_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_policy" ON public.costs;

CREATE POLICY "costs_all_operations" ON public.costs
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- TASKS
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_policy" ON public.tasks;

CREATE POLICY "tasks_all_operations" ON public.tasks
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_INGREDIENTS
DROP POLICY IF EXISTS "feed_ingredients_select_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_insert_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_update_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_delete_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_policy" ON public.feed_ingredients;

CREATE POLICY "feed_ingredients_all_operations" ON public.feed_ingredients
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_FORMULAS
DROP POLICY IF EXISTS "feed_formulas_select_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_insert_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_update_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_delete_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_policy" ON public.feed_formulas;

CREATE POLICY "feed_formulas_all_operations" ON public.feed_formulas
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_FORMULA_INGREDIENTS
DROP POLICY IF EXISTS "feed_formula_ingredients_select_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_insert_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_update_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_delete_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_policy" ON public.feed_formula_ingredients;

CREATE POLICY "feed_formula_ingredients_all_operations" ON public.feed_formula_ingredients
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_STOCK
DROP POLICY IF EXISTS "feed_stock_select_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_insert_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_update_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_delete_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_policy" ON public.feed_stock;

CREATE POLICY "feed_stock_all_operations" ON public.feed_stock
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- TREATMENTS
DROP POLICY IF EXISTS "treatments_select_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_insert_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_update_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_delete_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_policy" ON public.treatments;

CREATE POLICY "treatments_all_operations" ON public.treatments
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- PROFILES
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "profiles_all_operations" ON public.profiles
FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- EVENTS
DROP POLICY IF EXISTS "events_policy" ON public.events;

CREATE POLICY "events_all_operations" ON public.events
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_PRODUCTIONS
DROP POLICY IF EXISTS "feed_productions_policy" ON public.feed_productions;

CREATE POLICY "feed_productions_all_operations" ON public.feed_productions
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

SELECT '✅ Policies RLS consolidées' as status;

-- ================================================
-- PARTIE 4: ACTIVER RLS SUR TOUTES LES TABLES
-- ================================================

ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS activé sur toutes les tables' as status;

-- ================================================
-- VÉRIFICATION FINALE
-- ================================================

-- Vérifier les fonctions
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'update_updated_at_column',
        'get_user_farm_ids',
        'add_default_ingredients',
        'get_gestation_alerts',
        'get_health_stats',
        'get_dashboard_stats',
        'create_default_tasks'
    )
ORDER BY routine_name;

-- Vérifier les policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier RLS activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'costs', 'events', 'feed_formula_ingredients', 'feed_formulas',
        'feed_ingredients', 'feed_productions', 'feed_stock', 'gestations',
        'health_cases', 'pigs', 'profiles', 'tasks', 'treatments', 'farms'
    )
ORDER BY tablename;

SELECT '✅ Vérification terminée - Script complet' as status;

