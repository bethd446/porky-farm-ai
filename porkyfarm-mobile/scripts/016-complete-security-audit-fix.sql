-- =====================================================
-- SCRIPT COMPLET AUDIT SECURITE PORKYFARM
-- Version: 1.0
-- Date: 2026-01-01
-- Objectif: Corriger tous les problemes de securite RLS
--           et creer les tables manquantes
-- =====================================================

-- =====================================================
-- PARTIE 1: TABLE TASKS (MANQUANTE)
-- Utilisee par tasksService.ts
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('health', 'feeding', 'cleaning', 'reproduction', 'admin', 'other')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'event_based', 'one_time')),
  due_date DATE,
  due_time TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  related_animal_id UUID REFERENCES public.pigs(id) ON DELETE SET NULL,
  related_health_case_id UUID REFERENCES public.health_records(id) ON DELETE SET NULL,
  related_gestation_id UUID REFERENCES public.gestations(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_frequency ON public.tasks(frequency);

-- RLS pour tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies pour tasks (CRUD complet)
CREATE POLICY "tasks_select_own" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PARTIE 2: TABLE EVENTS (MANQUANTE)
-- Utilisee par eventsService.ts
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('vaccination', 'weighing', 'birth', 'sale', 'treatment', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  event_date DATE NOT NULL,
  pig_id UUID REFERENCES public.pigs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_pig_id ON public.events(pig_id);

-- RLS pour events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies pour events (CRUD complet)
CREATE POLICY "events_select_own" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "events_insert_own" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update_own" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "events_delete_own" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PARTIE 3: POLICIES MANQUANTES POUR FEEDING_RECORDS
-- =====================================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can update own feeding_records" ON public.feeding_records;
DROP POLICY IF EXISTS "Users can delete own feeding_records" ON public.feeding_records;
DROP POLICY IF EXISTS "feeding_records_update_own" ON public.feeding_records;
DROP POLICY IF EXISTS "feeding_records_delete_own" ON public.feeding_records;

-- Creer les policies manquantes
CREATE POLICY "feeding_records_update_own" ON public.feeding_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "feeding_records_delete_own" ON public.feeding_records
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PARTIE 4: COLONNES MANQUANTES POUR TABLE PIGS
-- Aligner avec les services TypeScript
-- =====================================================

-- Ajouter tag_number si manquant (alias de identifier)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pigs' AND column_name = 'tag_number'
  ) THEN
    ALTER TABLE public.pigs ADD COLUMN tag_number TEXT;
    -- Copier les donnees de identifier vers tag_number
    UPDATE public.pigs SET tag_number = identifier WHERE tag_number IS NULL;
  END IF;
END $$;

-- Ajouter photo_url si manquant (alias de image_url)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pigs' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.pigs ADD COLUMN photo_url TEXT;
    -- Copier les donnees de image_url vers photo_url
    UPDATE public.pigs SET photo_url = image_url WHERE photo_url IS NULL;
  END IF;
END $$;

-- Ajouter weight_history si manquant (JSONB pour historique des poids)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pigs' AND column_name = 'weight_history'
  ) THEN
    ALTER TABLE public.pigs ADD COLUMN weight_history JSONB;
  END IF;
END $$;

-- Ajouter sex si manquant (utilise par services au lieu de category)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pigs' AND column_name = 'sex'
  ) THEN
    ALTER TABLE public.pigs ADD COLUMN sex TEXT CHECK (sex IN ('male', 'female', 'unknown'));
    -- Mapper category vers sex
    UPDATE public.pigs SET sex =
      CASE
        WHEN category = 'sow' THEN 'female'
        WHEN category = 'boar' THEN 'male'
        ELSE 'unknown'
      END
    WHERE sex IS NULL;
  END IF;
END $$;

-- =====================================================
-- PARTIE 5: RPC FUNCTIONS SECURISEES
-- =====================================================

-- RPC: get_dashboard_stats
-- Retourne les statistiques du dashboard de maniere securisee
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
  v_total_pigs INTEGER;
  v_active_pigs INTEGER;
  v_sick_pigs INTEGER;
  v_pregnant_sows INTEGER;
  v_pending_tasks INTEGER;
  v_recent_health_cases INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Compter les animaux
  SELECT COUNT(*) INTO v_total_pigs FROM pigs WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_active_pigs FROM pigs WHERE user_id = v_user_id AND status = 'active';
  SELECT COUNT(*) INTO v_sick_pigs FROM pigs WHERE user_id = v_user_id AND status = 'sick';
  SELECT COUNT(*) INTO v_pregnant_sows FROM pigs WHERE user_id = v_user_id AND status = 'pregnant';

  -- Compter les taches en attente
  SELECT COUNT(*) INTO v_pending_tasks FROM tasks
  WHERE user_id = v_user_id AND completed = false;

  -- Compter les cas de sante recents (7 derniers jours)
  SELECT COUNT(*) INTO v_recent_health_cases FROM health_records
  WHERE user_id = v_user_id AND created_at > NOW() - INTERVAL '7 days';

  v_result := jsonb_build_object(
    'total_pigs', COALESCE(v_total_pigs, 0),
    'active_pigs', COALESCE(v_active_pigs, 0),
    'sick_pigs', COALESCE(v_sick_pigs, 0),
    'pregnant_sows', COALESCE(v_pregnant_sows, 0),
    'pending_tasks', COALESCE(v_pending_tasks, 0),
    'recent_health_cases', COALESCE(v_recent_health_cases, 0)
  );

  RETURN v_result;
END;
$$;

-- Grant pour authenticated
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

-- RPC: get_upcoming_events
-- Retourne les evenements a venir
CREATE OR REPLACE FUNCTION public.get_upcoming_events(p_days INTEGER DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Recuperer les gestations proches du terme
  SELECT jsonb_build_object(
    'upcoming_farrowings', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'gestation_id', g.id,
        'sow_id', g.sow_id,
        'expected_date', g.expected_farrowing_date
      ))
      FROM gestations g
      WHERE g.user_id = v_user_id
        AND g.status = 'pregnant'
        AND g.expected_farrowing_date IS NOT NULL
        AND g.expected_farrowing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    ), '[]'::jsonb),
    'scheduled_vaccinations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'vaccination_id', v.id,
        'pig_id', v.pig_id,
        'vaccine_name', v.vaccine_name,
        'due_date', v.next_due_date
      ))
      FROM vaccinations v
      WHERE v.user_id = v_user_id
        AND v.next_due_date IS NOT NULL
        AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant pour authenticated
GRANT EXECUTE ON FUNCTION public.get_upcoming_events(INTEGER) TO authenticated;

-- =====================================================
-- PARTIE 6: VERIFICATION FINALE
-- =====================================================

-- Afficher toutes les tables avec leur statut RLS
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Afficher toutes les policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- FIN DU SCRIPT
-- Executer dans Supabase SQL Editor
-- =====================================================
