-- ================================================
-- MIGRATION COMPLÈTE PORKYFARM v2.0
-- ================================================
-- Ce script améliore les tables existantes et ajoute
-- les fonctionnalités nécessaires pour le Dashboard intelligent
-- avec alertes gestations, suivi santé et tâches
-- ================================================

-- ====================
-- 1. TABLE PIGS - Améliorations
-- ====================

-- Ajouter les colonnes manquantes à la table pigs
ALTER TABLE public.pigs
ADD COLUMN IF NOT EXISTS weight_at_birth DECIMAL(6,2);

ALTER TABLE public.pigs
ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE public.pigs
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pigs_farm_status ON pigs(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_pigs_category ON pigs(farm_id, category);

-- ====================
-- 2. TABLE HEALTH_CASES - Améliorations
-- ====================

-- Ajouter les colonnes pour le suivi avancé
ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium'
CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS treatment_notes TEXT;

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

ALTER TABLE public.health_cases
ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Mettre à jour la contrainte de status si elle existe
-- Status valides: 'active', 'ongoing', 'resolved', 'closed'
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'health_cases_status_check'
  ) THEN
    ALTER TABLE public.health_cases DROP CONSTRAINT health_cases_status_check;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_health_cases_farm_status ON health_cases(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_health_cases_animal ON health_cases(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_severity ON health_cases(severity);

-- ====================
-- 3. TABLE GESTATIONS - Améliorations
-- ====================

-- S'assurer que expected_farrowing_date existe
ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS expected_farrowing_date DATE;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS actual_farrowing_date DATE;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS piglets_born_alive INTEGER DEFAULT 0;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS piglets_stillborn INTEGER DEFAULT 0;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS piglets_weaned INTEGER DEFAULT 0;

ALTER TABLE public.gestations
ADD COLUMN IF NOT EXISTS weaning_date DATE;

-- Mettre à jour expected_farrowing_date pour les enregistrements existants (114 jours)
UPDATE public.gestations
SET expected_farrowing_date = mating_date + INTERVAL '114 days'
WHERE expected_farrowing_date IS NULL
AND mating_date IS NOT NULL;

-- Index pour les alertes et performances
CREATE INDEX IF NOT EXISTS idx_gestations_farm_status ON gestations(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_gestations_expected_date ON gestations(expected_farrowing_date);
CREATE INDEX IF NOT EXISTS idx_gestations_sow ON gestations(sow_id);

-- ====================
-- 4. TABLE TASKS - Création/Amélioration
-- ====================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('health', 'feeding', 'cleaning', 'reproduction', 'admin', 'other')),
  frequency TEXT DEFAULT 'one_time' CHECK (frequency IN ('daily', 'weekly', 'event_based', 'one_time')),
  due_date DATE,
  due_time TIME,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  related_animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
  related_health_case_id UUID REFERENCES health_cases(id) ON DELETE SET NULL,
  related_gestation_id UUID REFERENCES gestations(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes si la table existait déjà
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'one_time';

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS due_time TIME;

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS related_animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL;

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS related_health_case_id UUID REFERENCES health_cases(id) ON DELETE SET NULL;

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS related_gestation_id UUID REFERENCES gestations(id) ON DELETE SET NULL;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON tasks(farm_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_frequency ON tasks(frequency);

-- ====================
-- 5. RLS POLICIES
-- ====================

-- Tasks RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;

CREATE POLICY "tasks_select_policy" ON tasks
FOR SELECT TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "tasks_insert_policy" ON tasks
FOR INSERT TO authenticated
WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "tasks_update_policy" ON tasks
FOR UPDATE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "tasks_delete_policy" ON tasks
FOR DELETE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- ====================
-- 6. FONCTIONS UTILITAIRES
-- ====================

-- Fonction pour récupérer les alertes de gestations
CREATE OR REPLACE FUNCTION get_gestation_alerts(p_farm_id UUID, p_max_days INTEGER DEFAULT 14)
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
    COALESCE(p.name, 'Truie') as sow_name,
    p.identifier as sow_identifier,
    (g.expected_farrowing_date - CURRENT_DATE)::INTEGER as days_remaining,
    g.expected_farrowing_date as expected_date,
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
    AND (g.expected_farrowing_date - CURRENT_DATE) <= p_max_days
  ORDER BY g.expected_farrowing_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les stats de santé
CREATE OR REPLACE FUNCTION get_health_stats(p_farm_id UUID)
RETURNS TABLE (
  total_animals INTEGER,
  healthy_count INTEGER,
  sick_count INTEGER,
  open_cases INTEGER
) AS $$
DECLARE
  v_total INTEGER;
  v_sick_animal_count INTEGER;
  v_open_cases INTEGER;
BEGIN
  -- Total animaux actifs
  SELECT COUNT(*) INTO v_total
  FROM pigs
  WHERE farm_id = p_farm_id AND status = 'actif';

  -- Animaux avec cas ouverts (uniques)
  SELECT COUNT(DISTINCT animal_id) INTO v_sick_animal_count
  FROM health_cases
  WHERE farm_id = p_farm_id
    AND status IN ('active', 'ongoing')
    AND animal_id IS NOT NULL;

  -- Nombre total de cas ouverts
  SELECT COUNT(*) INTO v_open_cases
  FROM health_cases
  WHERE farm_id = p_farm_id
    AND status IN ('active', 'ongoing');

  RETURN QUERY SELECT
    v_total as total_animals,
    GREATEST(0, v_total - v_sick_animal_count) as healthy_count,
    v_sick_animal_count as sick_count,
    v_open_cases as open_cases;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 7. TRIGGER POUR UPDATED_AT
-- ====================

-- Fonction trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer aux tables
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_cases_updated_at ON health_cases;
CREATE TRIGGER update_health_cases_updated_at
  BEFORE UPDATE ON health_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gestations_updated_at ON gestations;
CREATE TRIGGER update_gestations_updated_at
  BEFORE UPDATE ON gestations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 8. VÉRIFICATION FINALE
-- ====================

-- Afficher le résumé
DO $$
DECLARE
  pigs_count INTEGER;
  health_count INTEGER;
  gestations_count INTEGER;
  tasks_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pigs_count FROM pigs;
  SELECT COUNT(*) INTO health_count FROM health_cases;
  SELECT COUNT(*) INTO gestations_count FROM gestations;
  SELECT COUNT(*) INTO tasks_count FROM tasks;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION PORKYFARM v2.0 TERMINÉE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables mises à jour:';
  RAISE NOTICE '  - pigs: % enregistrements', pigs_count;
  RAISE NOTICE '  - health_cases: % enregistrements', health_count;
  RAISE NOTICE '  - gestations: % enregistrements', gestations_count;
  RAISE NOTICE '  - tasks: % enregistrements', tasks_count;
  RAISE NOTICE '========================================';
END $$;

-- Vérifier les colonnes
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('pigs', 'health_cases', 'gestations', 'tasks')
ORDER BY table_name, ordinal_position;
