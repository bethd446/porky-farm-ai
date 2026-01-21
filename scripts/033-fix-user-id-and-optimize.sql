-- ================================================================
-- CORRECTION URGENTE - ERREUR user_id NOT NULL
-- L'app utilise farm_id, pas user_id pour les animaux
-- ================================================================

-- 1. Rendre user_id nullable sur pigs (car on utilise farm_id)
ALTER TABLE public.pigs ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ou mieux : supprimer la colonne user_id si elle n'est pas utilisée
-- D'abord vérifier si elle contient des données
SELECT COUNT(*) FROM public.pigs WHERE user_id IS NOT NULL;

-- Si 0, on peut la supprimer
-- ALTER TABLE public.pigs DROP COLUMN IF EXISTS user_id;

-- 3. S'assurer que farm_id est bien NOT NULL
ALTER TABLE public.pigs ALTER COLUMN farm_id SET NOT NULL;

-- ================================================================
-- OPTIMISATION - INDEX POUR PERFORMANCE
-- ================================================================

-- Index principaux pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_pigs_farm_id ON public.pigs(farm_id);
CREATE INDEX IF NOT EXISTS idx_pigs_status ON public.pigs(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_pigs_category ON public.pigs(farm_id, category);
CREATE INDEX IF NOT EXISTS idx_pigs_created ON public.pigs(farm_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.tasks(farm_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON public.tasks(farm_id, scheduled_time);

CREATE INDEX IF NOT EXISTS idx_costs_farm_id ON public.costs(farm_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON public.costs(farm_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_costs_category ON public.costs(farm_id, category);

CREATE INDEX IF NOT EXISTS idx_gestations_farm ON public.gestations(farm_id);
CREATE INDEX IF NOT EXISTS idx_gestations_expected ON public.gestations(farm_id, expected_farrowing_date);
CREATE INDEX IF NOT EXISTS idx_gestations_status ON public.gestations(farm_id, status);

CREATE INDEX IF NOT EXISTS idx_health_cases_farm ON public.health_cases(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_status ON public.health_cases(farm_id, status);

-- ================================================================
-- AMÉLIORER TABLE TASKS POUR NOTIFICATIONS
-- ================================================================

-- Ajouter colonnes pour notifications si manquantes
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notification_minutes_before INTEGER DEFAULT 15;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMPTZ;

-- ================================================================
-- AMÉLIORER TABLE COSTS
-- ================================================================

-- S'assurer que la table costs a toutes les colonnes nécessaires
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' 
  CHECK (type IN ('expense', 'income'));
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS animal_id UUID REFERENCES public.pigs(id) ON DELETE SET NULL;

-- ================================================================
-- RLS ET POLICIES CONSOLIDÉES
-- ================================================================

-- Activer RLS
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "pigs_policy" ON public.pigs;
DROP POLICY IF EXISTS "pigs_farm_access" ON public.pigs;
DROP POLICY IF EXISTS "tasks_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_farm_access" ON public.tasks;
DROP POLICY IF EXISTS "costs_policy" ON public.costs;
DROP POLICY IF EXISTS "costs_farm_access" ON public.costs;

-- Créer policies unifiées
CREATE POLICY "pigs_access" ON public.pigs FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "tasks_access" ON public.tasks FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

CREATE POLICY "costs_access" ON public.costs FOR ALL TO authenticated
USING (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()))
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid()));

SELECT 'CORRECTIONS SUPABASE APPLIQUÉES' as status;

