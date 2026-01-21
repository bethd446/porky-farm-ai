-- ================================================================
-- 🔐 SÉCURITÉ SUPABASE - SCRIPT COMPLET
-- Exécuter dans: Supabase Dashboard > SQL Editor > New Query
-- ================================================================

-- ============================================
-- ÉTAPE 1: CORRIGER LES FONCTIONS (search_path)
-- ============================================

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
STABLE
AS $$
BEGIN
  RETURN QUERY SELECT id FROM public.farms WHERE user_id = auth.uid();
END;
$$;

-- 3. get_gestation_alerts
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
STABLE
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

-- 4. get_dashboard_stats
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
STABLE
AS $$
DECLARE
  v_total INTEGER;
  v_sick_count INTEGER;
BEGIN
  -- Total animaux actifs
  SELECT COUNT(*) INTO v_total 
  FROM public.pigs 
  WHERE farm_id = p_farm_id AND status = 'actif';
  
  -- Animaux avec cas ouverts
  SELECT COUNT(DISTINCT pig_id) INTO v_sick_count
  FROM public.health_cases 
  WHERE farm_id = p_farm_id AND status IN ('open', 'in_progress');
  
  RETURN QUERY SELECT
    v_total,
    v_total - COALESCE(v_sick_count, 0),
    COALESCE(v_sick_count, 0),
    (SELECT COUNT(*)::INTEGER FROM public.gestations WHERE farm_id = p_farm_id AND status = 'en_cours'),
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE farm_id = p_farm_id AND status = 'pending');
END;
$$;

-- ============================================
-- ÉTAPE 2: ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 3: SUPPRIMER TOUTES LES ANCIENNES POLICIES
-- ============================================

-- FARMS
DROP POLICY IF EXISTS "farms_select_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_insert_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_update_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_delete_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_policy" ON public.farms;
DROP POLICY IF EXISTS "farms_all_operations" ON public.farms;

-- PIGS
DROP POLICY IF EXISTS "pigs_select_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_insert_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_update_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_delete_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_all_operations" ON public.pigs;

-- HEALTH_CASES
DROP POLICY IF EXISTS "health_cases_select_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_insert_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_update_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_delete_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_policy" ON public.health_cases;
DROP POLICY IF EXISTS "health_cases_all_operations" ON public.health_cases;

-- GESTATIONS
DROP POLICY IF EXISTS "gestations_select_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_insert_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_update_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_delete_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_policy" ON public.gestations;
DROP POLICY IF EXISTS "gestations_all_operations" ON public.gestations;

-- COSTS
DROP POLICY IF EXISTS "costs_select_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_insert_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_update_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_delete_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_all_operations" ON public.costs;

-- TASKS
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_all_operations" ON public.tasks;

-- TREATMENTS
DROP POLICY IF EXISTS "treatments_select_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_insert_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_update_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_delete_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_policy" ON public.treatments;
DROP POLICY IF EXISTS "treatments_all_operations" ON public.treatments;

-- FEED_INGREDIENTS
DROP POLICY IF EXISTS "feed_ingredients_select_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_insert_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_update_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_delete_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_policy" ON public.feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_all_operations" ON public.feed_ingredients;

-- FEED_FORMULAS
DROP POLICY IF EXISTS "feed_formulas_select_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_insert_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_update_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_delete_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_policy" ON public.feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_all_operations" ON public.feed_formulas;

-- FEED_FORMULA_INGREDIENTS
DROP POLICY IF EXISTS "feed_formula_ingredients_select_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_insert_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_update_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_delete_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_policy" ON public.feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_all_operations" ON public.feed_formula_ingredients;

-- FEED_STOCK
DROP POLICY IF EXISTS "feed_stock_select_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_insert_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_update_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_delete_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_policy" ON public.feed_stock;
DROP POLICY IF EXISTS "feed_stock_all_operations" ON public.feed_stock;

-- FEED_PRODUCTIONS
DROP POLICY IF EXISTS "feed_productions_select_policy" ON public.feed_productions;
DROP POLICY IF EXISTS "feed_productions_insert_policy" ON public.feed_productions;
DROP POLICY IF EXISTS "feed_productions_update_policy" ON public.feed_productions;
DROP POLICY IF EXISTS "feed_productions_delete_policy" ON public.feed_productions;
DROP POLICY IF EXISTS "feed_productions_policy" ON public.feed_productions;
DROP POLICY IF EXISTS "feed_productions_all_operations" ON public.feed_productions;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_operations" ON public.profiles;

-- EVENTS
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
DROP POLICY IF EXISTS "events_policy" ON public.events;
DROP POLICY IF EXISTS "events_all_operations" ON public.events;

-- ============================================
-- ÉTAPE 4: CRÉER LES NOUVELLES POLICIES (UNE SEULE PAR TABLE)
-- ============================================

-- FARMS - Accès uniquement aux fermes de l'utilisateur
CREATE POLICY "farms_user_access" ON public.farms
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- PROFILES - Accès uniquement à son propre profil
CREATE POLICY "profiles_user_access" ON public.profiles
FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- PIGS - Accès via farm_id
CREATE POLICY "pigs_farm_access" ON public.pigs
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- HEALTH_CASES - Accès via farm_id
CREATE POLICY "health_cases_farm_access" ON public.health_cases
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- GESTATIONS - Accès via farm_id
CREATE POLICY "gestations_farm_access" ON public.gestations
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- COSTS - Accès via farm_id
CREATE POLICY "costs_farm_access" ON public.costs
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- TASKS - Accès via farm_id
CREATE POLICY "tasks_farm_access" ON public.tasks
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- TREATMENTS - Accès via farm_id
CREATE POLICY "treatments_farm_access" ON public.treatments
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_INGREDIENTS - Accès via farm_id
CREATE POLICY "feed_ingredients_farm_access" ON public.feed_ingredients
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_FORMULAS - Accès via farm_id
CREATE POLICY "feed_formulas_farm_access" ON public.feed_formulas
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_FORMULA_INGREDIENTS - Accès via farm_id
CREATE POLICY "feed_formula_ingredients_farm_access" ON public.feed_formula_ingredients
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_STOCK - Accès via farm_id
CREATE POLICY "feed_stock_farm_access" ON public.feed_stock
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- FEED_PRODUCTIONS - Accès via farm_id
CREATE POLICY "feed_productions_farm_access" ON public.feed_productions
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- EVENTS - Accès via farm_id
CREATE POLICY "events_farm_access" ON public.events
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- ============================================
-- ÉTAPE 5: CONFIGURER LE STORAGE POUR LES PHOTOS
-- ============================================

-- Créer le bucket pour les photos d'animaux (si pas déjà fait)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'animals',
  'animals',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Policy pour le storage
DROP POLICY IF EXISTS "animals_storage_policy" ON storage.objects;
CREATE POLICY "animals_storage_policy" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'animals')
WITH CHECK (bucket_id = 'animals');

-- ============================================
-- ÉTAPE 6: AJOUTER COLONNES MANQUANTES SI NÉCESSAIRE
-- ============================================

-- Pigs - Ajouter photo_url et tags si manquants
ALTER TABLE public.pigs ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.pigs ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.pigs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger pour updated_at sur pigs
DROP TRIGGER IF EXISTS pigs_updated_at ON public.pigs;
CREATE TRIGGER pigs_updated_at
  BEFORE UPDATE ON public.pigs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Costs - Ajouter updated_at si manquant
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger pour updated_at sur costs
DROP TRIGGER IF EXISTS costs_updated_at ON public.costs;
CREATE TRIGGER costs_updated_at
  BEFORE UPDATE ON public.costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ÉTAPE 7: INDEX POUR PERFORMANCE
-- ============================================

-- Supprimer les index dupliqués potentiels
DROP INDEX IF EXISTS public.idx_pigs_farm_id_dup;
DROP INDEX IF EXISTS public.idx_health_cases_farm_id_dup;
DROP INDEX IF EXISTS public.idx_gestations_farm_id_dup;

-- Créer les index optimaux (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_pigs_farm_status ON public.pigs(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_pigs_tags ON public.pigs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_health_cases_farm_status ON public.health_cases(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_gestations_farm_status ON public.gestations(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_gestations_expected ON public.gestations(expected_farrowing_date);
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON public.tasks(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_costs_farm_date ON public.costs(farm_id, date);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT 'SÉCURITÉ CONFIGURÉE' as status;

-- Vérifier RLS activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('farms', 'pigs', 'health_cases', 'gestations', 'costs', 'tasks', 'profiles')
ORDER BY tablename;

-- Vérifier les policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

