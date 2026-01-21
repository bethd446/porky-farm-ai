-- ================================================================
-- 🚨 FIX URGENT - PERMISSIONS RLS PORKYFARM
-- ================================================================

-- ÉTAPE 1: Désactiver RLS temporairement
ALTER TABLE IF EXISTS public.gestations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pigs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_formulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_formula_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_productions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer TOUTES les anciennes policies (évite les conflits)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ÉTAPE 3: Réactiver RLS
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer les policies (une seule par table, FOR ALL)
CREATE POLICY "farms_access" ON public.farms FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_access" ON public.profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "pigs_access" ON public.pigs FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "gestations_access" ON public.gestations FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "health_cases_access" ON public.health_cases FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "tasks_access" ON public.tasks FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "costs_access" ON public.costs FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "treatments_access" ON public.treatments FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_ingredients_access" ON public.feed_ingredients FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_formulas_access" ON public.feed_formulas FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_formula_ingredients_access" ON public.feed_formula_ingredients FOR ALL TO authenticated
USING (formula_id IN (SELECT id FROM public.feed_formulas WHERE farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())))
WITH CHECK (formula_id IN (SELECT id FROM public.feed_formulas WHERE farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())));

CREATE POLICY "feed_stock_access" ON public.feed_stock FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_productions_access" ON public.feed_productions FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "events_access" ON public.events FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- VÉRIFICATION
SELECT '✅ POLICIES CONFIGURÉES' as status;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

