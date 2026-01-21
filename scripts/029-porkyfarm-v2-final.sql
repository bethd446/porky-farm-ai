-- ================================================
-- PORKYFARM V2.0 - MIGRATION FINALE CONSOLIDÉE
-- ================================================
-- Script de vérification et correction complète
-- À exécuter après tous les autres scripts
-- ================================================

-- ====================
-- 1. VÉRIFICATION/CRÉATION TABLE GESTATIONS
-- ====================

-- Ajouter les colonnes manquantes pour les alertes
ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS expected_farrowing_date DATE;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS actual_farrowing_date DATE;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS piglets_born_alive INTEGER DEFAULT 0;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS piglets_born_dead INTEGER DEFAULT 0;

-- Mettre à jour expected_farrowing_date si manquant (114 jours après saillie)
UPDATE public.gestations
SET expected_farrowing_date = mating_date + INTERVAL '114 days'
WHERE expected_farrowing_date IS NULL
  AND mating_date IS NOT NULL;

-- Index pour alertes gestations
CREATE INDEX IF NOT EXISTS idx_gestations_expected_date ON gestations(expected_farrowing_date);
CREATE INDEX IF NOT EXISTS idx_gestations_farm_status ON gestations(farm_id, status);

-- ====================
-- 2. VÉRIFICATION TABLE HEALTH_CASES
-- ====================

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium';

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS treatment_notes TEXT;

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Index
CREATE INDEX IF NOT EXISTS idx_health_cases_farm_status ON health_cases(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_health_cases_animal ON health_cases(animal_id);

-- ====================
-- 3. VÉRIFICATION TABLE TASKS
-- ====================

-- S'assurer que la table tasks existe avec toutes les colonnes
DO $$
BEGIN
  -- Créer la table si elle n'existe pas
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    CREATE TABLE public.tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'other' CHECK (type IN ('health', 'feeding', 'cleaning', 'reproduction', 'admin', 'other')),
      frequency TEXT DEFAULT 'one_time' CHECK (frequency IN ('daily', 'weekly', 'event_based', 'one_time')),
      due_date DATE,
      due_time TIME,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      related_animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
      related_health_case_id UUID REFERENCES health_cases(id) ON DELETE SET NULL,
      related_gestation_id UUID REFERENCES gestations(id) ON DELETE SET NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Ajouter les colonnes manquantes si la table existe déjà
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'other';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'one_time';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_time TIME;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS related_animal_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS related_health_case_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS related_gestation_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Index pour tasks
CREATE INDEX IF NOT EXISTS idx_tasks_farm_completed ON tasks(farm_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);

-- RLS pour tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks FOR SELECT TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tasks_insert" ON tasks FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tasks_update" ON tasks FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tasks_delete" ON tasks FOR DELETE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ====================
-- 4. VÉRIFICATION TABLE COSTS
-- ====================

ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense';
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS cost_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS supplier TEXT;
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Index
CREATE INDEX IF NOT EXISTS idx_costs_farm_type ON costs(farm_id, type);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(cost_date);

-- ====================
-- 5. FONCTION ALERTES GESTATIONS
-- ====================

CREATE OR REPLACE FUNCTION get_gestation_alerts(p_farm_id UUID, p_days_ahead INTEGER DEFAULT 14)
RETURNS TABLE (
  id UUID,
  sow_name TEXT,
  sow_identifier TEXT,
  days_remaining INTEGER,
  expected_date DATE,
  alert_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    COALESCE(p.name, p.identifier, 'Truie') as sow_name,
    p.identifier as sow_identifier,
    (g.expected_farrowing_date - CURRENT_DATE)::INTEGER as days_remaining,
    g.expected_farrowing_date::DATE as expected_date,
    CASE
      WHEN (g.expected_farrowing_date - CURRENT_DATE) <= 2 THEN 'critical'
      WHEN (g.expected_farrowing_date - CURRENT_DATE) <= 5 THEN 'warning'
      ELSE 'info'
    END as alert_level
  FROM gestations g
  LEFT JOIN pigs p ON p.id = g.sow_id
  WHERE g.farm_id = p_farm_id
    AND g.status = 'en_cours'
    AND g.expected_farrowing_date IS NOT NULL
    AND g.expected_farrowing_date >= CURRENT_DATE
    AND (g.expected_farrowing_date - CURRENT_DATE) <= p_days_ahead
  ORDER BY g.expected_farrowing_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 6. FONCTION STATS SANTÉ
-- ====================

CREATE OR REPLACE FUNCTION get_health_stats(p_farm_id UUID)
RETURNS TABLE (
  total_animals INTEGER,
  healthy_count INTEGER,
  sick_count INTEGER,
  open_cases INTEGER
) AS $$
DECLARE
  v_total INTEGER;
  v_sick_pigs INTEGER;
  v_open_cases INTEGER;
BEGIN
  -- Total animaux actifs
  SELECT COUNT(*) INTO v_total
  FROM pigs
  WHERE farm_id = p_farm_id
    AND status = 'actif';

  -- Animaux avec cas ouverts
  SELECT COUNT(DISTINCT animal_id) INTO v_sick_pigs
  FROM health_cases
  WHERE farm_id = p_farm_id
    AND status IN ('active', 'ongoing', 'open');

  -- Nombre de cas ouverts
  SELECT COUNT(*) INTO v_open_cases
  FROM health_cases
  WHERE farm_id = p_farm_id
    AND status IN ('active', 'ongoing', 'open');

  RETURN QUERY SELECT
    v_total,
    GREATEST(0, v_total - v_sick_pigs),
    v_sick_pigs,
    v_open_cases;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 7. FONCTION STATS DASHBOARD
-- ====================

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_farm_id UUID)
RETURNS TABLE (
  total_animals INTEGER,
  healthy_count INTEGER,
  care_required INTEGER,
  active_gestations INTEGER,
  pending_tasks INTEGER,
  overdue_tasks INTEGER
) AS $$
DECLARE
  v_total INTEGER;
  v_healthy INTEGER;
  v_care INTEGER;
  v_gestations INTEGER;
  v_pending INTEGER;
  v_overdue INTEGER;
BEGIN
  -- Stats santé
  SELECT t.total_animals, t.healthy_count, t.open_cases
  INTO v_total, v_healthy, v_care
  FROM get_health_stats(p_farm_id) t;

  -- Gestations en cours
  SELECT COUNT(*) INTO v_gestations
  FROM gestations
  WHERE farm_id = p_farm_id
    AND status = 'en_cours';

  -- Tâches en attente
  SELECT COUNT(*) INTO v_pending
  FROM tasks
  WHERE farm_id = p_farm_id
    AND completed = FALSE;

  -- Tâches en retard
  SELECT COUNT(*) INTO v_overdue
  FROM tasks
  WHERE farm_id = p_farm_id
    AND completed = FALSE
    AND due_date < CURRENT_DATE;

  RETURN QUERY SELECT
    COALESCE(v_total, 0),
    COALESCE(v_healthy, 0),
    COALESCE(v_care, 0),
    COALESCE(v_gestations, 0),
    COALESCE(v_pending, 0),
    COALESCE(v_overdue, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 8. TRIGGER UPDATED_AT GLOBAL
-- ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables principales
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['pigs', 'health_cases', 'gestations', 'tasks', 'costs', 'feed_stock', 'feed_ingredients', 'feed_formulas']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%s_updated_at ON %s', t, t);
    EXECUTE format('
      CREATE TRIGGER set_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    ', t, t);
  END LOOP;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Certaines tables n''existent pas encore, triggers ignorés';
END $$;

-- ====================
-- 9. DONNÉES DE TEST (optionnel)
-- ====================

-- Insérer des tâches quotidiennes par défaut pour les nouvelles fermes
CREATE OR REPLACE FUNCTION create_default_tasks(p_farm_id UUID)
RETURNS void AS $$
BEGIN
  -- Vérifier si des tâches existent déjà
  IF EXISTS (SELECT 1 FROM tasks WHERE farm_id = p_farm_id LIMIT 1) THEN
    RETURN;
  END IF;

  -- Tâches par défaut
  INSERT INTO tasks (farm_id, title, description, type, frequency, due_time)
  VALUES
    (p_farm_id, 'Nettoyage des enclos', 'Nettoyer et désinfecter les cases', 'cleaning', 'daily', '08:00'),
    (p_farm_id, 'Distribution nourriture matin', 'Distribuer la ration du matin', 'feeding', 'daily', '07:30'),
    (p_farm_id, 'Vérification état sanitaire', 'Inspecter les animaux pour signes de maladie', 'health', 'daily', '09:00'),
    (p_farm_id, 'Distribution nourriture soir', 'Distribuer la ration du soir', 'feeding', 'daily', '17:00'),
    (p_farm_id, 'Vérification eau', 'S''assurer que tous les abreuvoirs fonctionnent', 'other', 'daily', '10:00');
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 10. VÉRIFICATION FINALE
-- ====================

SELECT 'VÉRIFICATION DES TABLES' as section;

SELECT
  tablename,
  CASE WHEN rowsecurity THEN 'Oui' ELSE 'Non' END as "RLS Activé"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pigs', 'health_cases', 'gestations', 'tasks', 'costs', 'farms', 'feed_ingredients', 'feed_formulas')
ORDER BY tablename;

SELECT 'VÉRIFICATION DES FONCTIONS' as section;

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_gestation_alerts', 'get_health_stats', 'get_dashboard_stats', 'create_default_tasks')
ORDER BY routine_name;

SELECT 'MIGRATION V2.0 TERMINÉE AVEC SUCCÈS!' as status;
