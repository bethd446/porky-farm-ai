-- ================================================================
-- 🔐 PORKYFARM - CONFIGURATION SÉCURITÉ COMPLÈTE
-- Version: 2.0 - Janvier 2026
-- Exécuter CE SCRIPT EN ENTIER avant toute autre action
-- ================================================================

-- ============================================
-- ÉTAPE 1: NETTOYER LES POLICIES EXISTANTES
-- ============================================

-- Désactiver RLS temporairement pour nettoyer
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('farms', 'profiles', 'pigs', 'gestations', 'health_cases', 
                          'tasks', 'costs', 'treatments', 'feed_ingredients', 
                          'feed_formulas', 'feed_formula_ingredients', 'feed_stock', 
                          'feed_productions', 'events')
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS public.%I DISABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Supprimer TOUTES les anciennes policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- ÉTAPE 2: CORRIGER LES CONTRAINTES DE TABLES
-- ============================================

-- Rendre user_id nullable sur pigs (on utilise farm_id)
ALTER TABLE public.pigs ALTER COLUMN user_id DROP NOT NULL;

-- S'assurer que farm_id est NOT NULL
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'pigs' 
               AND column_name = 'farm_id') THEN
        ALTER TABLE public.pigs ALTER COLUMN farm_id SET NOT NULL;
    END IF;
END $$;

-- Ajouter colonnes manquantes sur pigs
ALTER TABLE public.pigs ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.pigs ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.pigs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ajouter colonnes pour notifications sur tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notification_minutes_before INTEGER DEFAULT 15;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_time TIME;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly'));

-- Ajouter colonnes sur costs
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income'));
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- ÉTAPE 3: CRÉER LA FONCTION TRIGGER updated_at
-- ============================================

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

-- Appliquer le trigger aux tables principales
DROP TRIGGER IF EXISTS pigs_updated_at ON public.pigs;
CREATE TRIGGER pigs_updated_at BEFORE UPDATE ON public.pigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS costs_updated_at ON public.costs;
CREATE TRIGGER costs_updated_at BEFORE UPDATE ON public.costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ÉTAPE 4: CRÉER LES INDEX POUR PERFORMANCE
-- ============================================

-- Index sur farm_id pour toutes les tables
CREATE INDEX IF NOT EXISTS idx_pigs_farm_id ON public.pigs(farm_id);
CREATE INDEX IF NOT EXISTS idx_pigs_farm_status ON public.pigs(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_pigs_farm_category ON public.pigs(farm_id, category);
CREATE INDEX IF NOT EXISTS idx_pigs_tags ON public.pigs USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_gestations_farm_id ON public.gestations(farm_id);
CREATE INDEX IF NOT EXISTS idx_gestations_farm_status ON public.gestations(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_gestations_expected ON public.gestations(expected_farrowing_date);

CREATE INDEX IF NOT EXISTS idx_health_cases_farm_id ON public.health_cases(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_farm_status ON public.health_cases(farm_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_farm_completed ON public.tasks(farm_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(farm_id, due_date);

CREATE INDEX IF NOT EXISTS idx_costs_farm_id ON public.costs(farm_id);
CREATE INDEX IF NOT EXISTS idx_costs_farm_date ON public.costs(farm_id, cost_date DESC);
CREATE INDEX IF NOT EXISTS idx_costs_farm_category ON public.costs(farm_id, category);

CREATE INDEX IF NOT EXISTS idx_treatments_farm_id ON public.treatments(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_farm_id ON public.feed_ingredients(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_formulas_farm_id ON public.feed_formulas(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_stock_farm_id ON public.feed_stock(farm_id);
CREATE INDEX IF NOT EXISTS idx_events_farm_id ON public.events(farm_id);

-- ============================================
-- ÉTAPE 5: ACTIVER RLS ET CRÉER LES POLICIES
-- ============================================

-- Activer RLS sur toutes les tables
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

-- FORCER RLS (même pour les admins)
ALTER TABLE public.farms FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pigs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.gestations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.costs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.treatments FORCE ROW LEVEL SECURITY;

-- ============================================
-- CRÉER LES POLICIES (UNE PAR TABLE)
-- ============================================

-- FARMS - L'utilisateur accède uniquement à SES fermes
CREATE POLICY "farms_access" ON public.farms
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- PROFILES - L'utilisateur accède uniquement à SON profil
CREATE POLICY "profiles_access" ON public.profiles
FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern pour toutes les tables avec farm_id
-- L'utilisateur accède aux données de SES fermes uniquement

CREATE POLICY "pigs_access" ON public.pigs
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "gestations_access" ON public.gestations
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "health_cases_access" ON public.health_cases
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "tasks_access" ON public.tasks
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "costs_access" ON public.costs
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "treatments_access" ON public.treatments
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_ingredients_access" ON public.feed_ingredients
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_formulas_access" ON public.feed_formulas
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_formula_ingredients_access" ON public.feed_formula_ingredients
FOR ALL TO authenticated
USING (formula_id IN (SELECT id FROM public.feed_formulas WHERE farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())))
WITH CHECK (formula_id IN (SELECT id FROM public.feed_formulas WHERE farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())));

CREATE POLICY "feed_stock_access" ON public.feed_stock
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "feed_productions_access" ON public.feed_productions
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "events_access" ON public.events
FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

-- ============================================
-- ÉTAPE 6: CONFIGURER LE STORAGE
-- ============================================

-- Créer le bucket pour les photos d'animaux
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'animals',
  'animals',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Policy pour le storage
DROP POLICY IF EXISTS "animals_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "animals_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "animals_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "animals_storage_delete" ON storage.objects;

CREATE POLICY "animals_storage_select" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'animals');

CREATE POLICY "animals_storage_insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'animals');

CREATE POLICY "animals_storage_update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'animals');

CREATE POLICY "animals_storage_delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'animals');

-- ============================================
-- ÉTAPE 7: FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour récupérer les alertes de gestation
DROP FUNCTION IF EXISTS public.get_gestation_alerts(UUID);
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

-- Fonction pour les stats du dashboard
DROP FUNCTION IF EXISTS public.get_dashboard_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_farm_id UUID)
RETURNS TABLE (
  total_animals INTEGER,
  healthy_animals INTEGER,
  sick_animals INTEGER,
  active_gestations INTEGER,
  pending_tasks INTEGER,
  overdue_tasks INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_total INTEGER;
  v_sick INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM public.pigs WHERE farm_id = p_farm_id AND status = 'actif';
  SELECT COUNT(DISTINCT animal_id) INTO v_sick FROM public.health_cases WHERE farm_id = p_farm_id AND status IN ('open', 'active', 'ongoing');
  
  RETURN QUERY SELECT
    v_total,
    v_total - COALESCE(v_sick, 0),
    COALESCE(v_sick, 0),
    (SELECT COUNT(*)::INTEGER FROM public.gestations WHERE farm_id = p_farm_id AND status = 'en_cours'),
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE farm_id = p_farm_id AND completed = false),
    (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE farm_id = p_farm_id AND completed = false AND due_date < CURRENT_DATE);
END;
$$;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT '✅ CONFIGURATION TERMINÉE' as status;

-- Afficher les policies créées
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Vérifier RLS activé
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('farms', 'pigs', 'gestations', 'health_cases', 'tasks', 'costs')
ORDER BY tablename;

