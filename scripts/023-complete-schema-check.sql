-- ================================================
-- VERIFICATION COMPLETE DU SCHEMA PORKYFARM V2.0
-- ================================================
-- Ce script vérifie et corrige toutes les tables
-- nécessaires pour le fonctionnement de l'application
-- ================================================

-- ============================================
-- 1. TABLE FARMS (base)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farms' AND table_schema = 'public') THEN
    CREATE TABLE public.farms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      location TEXT,
      farm_type VARCHAR(50) DEFAULT 'porcine',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_farms_user_id ON farms(user_id);
    RAISE NOTICE 'Table farms créée';
  ELSE
    RAISE NOTICE 'Table farms existe déjà';
  END IF;
END $$;

-- ============================================
-- 2. TABLE PIGS (animaux)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pigs' AND table_schema = 'public') THEN
    CREATE TABLE public.pigs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id),
      identifier VARCHAR(100),
      tag_number VARCHAR(100),
      name VARCHAR(255),
      sex VARCHAR(20) CHECK (sex IN ('male', 'female', 'castrated')),
      gender VARCHAR(20),
      breed VARCHAR(100),
      birth_date DATE,
      weight_kg DECIMAL(10,2),
      status VARCHAR(20) NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'active', 'vendu', 'mort', 'reforme')),
      origin VARCHAR(100),
      mother_id UUID REFERENCES pigs(id),
      father_id UUID REFERENCES pigs(id),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_pigs_farm_id ON pigs(farm_id);
    CREATE INDEX idx_pigs_status ON pigs(status);
    RAISE NOTICE 'Table pigs créée';
  ELSE
    -- Vérifier la contrainte status
    ALTER TABLE public.pigs DROP CONSTRAINT IF EXISTS pigs_status_check;
    ALTER TABLE public.pigs ADD CONSTRAINT pigs_status_check
      CHECK (status IN ('actif', 'active', 'vendu', 'mort', 'reforme'));
    RAISE NOTICE 'Table pigs existe déjà, contrainte status mise à jour';
  END IF;
END $$;

-- ============================================
-- 3. TABLE GESTATIONS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gestations' AND table_schema = 'public') THEN
    CREATE TABLE public.gestations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      sow_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
      boar_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
      mating_date DATE NOT NULL,
      expected_farrowing_date DATE,
      actual_farrowing_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'terminee', 'avortee')),
      piglets_born_alive INTEGER,
      piglets_born_dead INTEGER,
      piglets_weaned INTEGER,
      weaning_date DATE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_gestations_farm_id ON gestations(farm_id);
    CREATE INDEX idx_gestations_status ON gestations(status);
    CREATE INDEX idx_gestations_expected_date ON gestations(expected_farrowing_date);
    RAISE NOTICE 'Table gestations créée';
  ELSE
    RAISE NOTICE 'Table gestations existe déjà';
  END IF;
END $$;

-- ============================================
-- 4. TABLE HEALTH_CASES
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_cases' AND table_schema = 'public') THEN
    CREATE TABLE public.health_cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
      title VARCHAR(255),
      description TEXT,
      severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
      status VARCHAR(20) DEFAULT 'active',
      symptoms TEXT[],
      suspected_disease_id UUID,
      confirmed_disease_id UUID,
      temperature DECIMAL(4,1),
      affected_count INTEGER DEFAULT 1,
      quarantine_applied BOOLEAN DEFAULT FALSE,
      vet_consulted BOOLEAN DEFAULT FALSE,
      vet_visit_date DATE,
      lab_results TEXT,
      treatment TEXT,
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      resolution_date DATE,
      resolution_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_health_cases_farm_id ON health_cases(farm_id);
    CREATE INDEX idx_health_cases_status ON health_cases(status);
    CREATE INDEX idx_health_cases_animal_id ON health_cases(animal_id);
    RAISE NOTICE 'Table health_cases créée';
  ELSE
    RAISE NOTICE 'Table health_cases existe déjà';
  END IF;
END $$;

-- ============================================
-- 5. TABLE TASKS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
    CREATE TABLE public.tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (type IN ('health', 'feeding', 'cleaning', 'reproduction', 'admin', 'other')),
      frequency VARCHAR(20) DEFAULT 'one_time' CHECK (frequency IN ('daily', 'weekly', 'event_based', 'one_time')),
      due_date DATE,
      due_time TIME,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      related_animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
      related_health_case_id UUID REFERENCES health_cases(id) ON DELETE SET NULL,
      related_gestation_id UUID REFERENCES gestations(id) ON DELETE SET NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_tasks_farm_id ON tasks(farm_id);
    CREATE INDEX idx_tasks_completed ON tasks(completed);
    CREATE INDEX idx_tasks_due_date ON tasks(due_date);
    RAISE NOTICE 'Table tasks créée';
  ELSE
    RAISE NOTICE 'Table tasks existe déjà';
  END IF;
END $$;

-- ============================================
-- 6. TABLE COSTS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'costs' AND table_schema = 'public') THEN
    CREATE TABLE public.costs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
      category VARCHAR(50) NOT NULL DEFAULT 'autre' CHECK (category IN ('alimentation', 'veterinaire', 'equipement', 'main_oeuvre', 'transport', 'vente', 'autre')),
      amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      description TEXT,
      cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
      supplier VARCHAR(255),
      invoice_number VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_costs_farm_id ON costs(farm_id);
    CREATE INDEX idx_costs_cost_date ON costs(cost_date);
    CREATE INDEX idx_costs_type ON costs(type);
    CREATE INDEX idx_costs_category ON costs(category);
    RAISE NOTICE 'Table costs créée';
  ELSE
    -- Ajouter les colonnes manquantes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'costs' AND column_name = 'type') THEN
      ALTER TABLE public.costs ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'expense';
      ALTER TABLE public.costs ADD CONSTRAINT costs_type_check CHECK (type IN ('expense', 'income'));
      RAISE NOTICE 'Colonne type ajoutée à costs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'costs' AND column_name = 'category') THEN
      ALTER TABLE public.costs ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'autre';
      RAISE NOTICE 'Colonne category ajoutée à costs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'costs' AND column_name = 'cost_date') THEN
      ALTER TABLE public.costs ADD COLUMN cost_date DATE NOT NULL DEFAULT CURRENT_DATE;
      RAISE NOTICE 'Colonne cost_date ajoutée à costs';
    END IF;

    RAISE NOTICE 'Table costs existe déjà, colonnes vérifiées';
  END IF;
END $$;

-- ============================================
-- 7. TABLE FEED_STOCK
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_stock' AND table_schema = 'public') THEN
    CREATE TABLE public.feed_stock (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      feed_type VARCHAR(100) NOT NULL,
      quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
      unit_price DECIMAL(10,2),
      supplier VARCHAR(255),
      purchase_date DATE,
      expiry_date DATE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_feed_stock_farm_id ON feed_stock(farm_id);
    CREATE INDEX idx_feed_stock_feed_type ON feed_stock(feed_type);
    RAISE NOTICE 'Table feed_stock créée';
  ELSE
    RAISE NOTICE 'Table feed_stock existe déjà';
  END IF;
END $$;

-- ============================================
-- 8. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_stock ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. POLICIES RLS (basées sur farm_id)
-- ============================================

-- Helper function pour obtenir les farm_ids de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_farm_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM farms WHERE user_id = auth.uid();
$$;

-- FARMS policies
DROP POLICY IF EXISTS "farms_select" ON farms;
DROP POLICY IF EXISTS "farms_insert" ON farms;
DROP POLICY IF EXISTS "farms_update" ON farms;
DROP POLICY IF EXISTS "farms_delete" ON farms;

CREATE POLICY "farms_select" ON farms FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "farms_insert" ON farms FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "farms_update" ON farms FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "farms_delete" ON farms FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- PIGS policies
DROP POLICY IF EXISTS "pigs_select" ON pigs;
DROP POLICY IF EXISTS "pigs_insert" ON pigs;
DROP POLICY IF EXISTS "pigs_update" ON pigs;
DROP POLICY IF EXISTS "pigs_delete" ON pigs;

CREATE POLICY "pigs_select" ON pigs FOR SELECT TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "pigs_insert" ON pigs FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "pigs_update" ON pigs FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "pigs_delete" ON pigs FOR DELETE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));

-- GESTATIONS policies
DROP POLICY IF EXISTS "gestations_select" ON gestations;
DROP POLICY IF EXISTS "gestations_insert" ON gestations;
DROP POLICY IF EXISTS "gestations_update" ON gestations;
DROP POLICY IF EXISTS "gestations_delete" ON gestations;

CREATE POLICY "gestations_select" ON gestations FOR SELECT TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "gestations_insert" ON gestations FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "gestations_update" ON gestations FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "gestations_delete" ON gestations FOR DELETE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));

-- HEALTH_CASES policies
DROP POLICY IF EXISTS "health_cases_select" ON health_cases;
DROP POLICY IF EXISTS "health_cases_insert" ON health_cases;
DROP POLICY IF EXISTS "health_cases_update" ON health_cases;
DROP POLICY IF EXISTS "health_cases_delete" ON health_cases;

CREATE POLICY "health_cases_select" ON health_cases FOR SELECT TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "health_cases_insert" ON health_cases FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "health_cases_update" ON health_cases FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "health_cases_delete" ON health_cases FOR DELETE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));

-- TASKS policies
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks FOR SELECT TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "tasks_insert" ON tasks FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "tasks_update" ON tasks FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "tasks_delete" ON tasks FOR DELETE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));

-- COSTS policies
DROP POLICY IF EXISTS "costs_select" ON costs;
DROP POLICY IF EXISTS "costs_insert" ON costs;
DROP POLICY IF EXISTS "costs_update" ON costs;
DROP POLICY IF EXISTS "costs_delete" ON costs;

CREATE POLICY "costs_select" ON costs FOR SELECT TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "costs_insert" ON costs FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "costs_update" ON costs FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "costs_delete" ON costs FOR DELETE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));

-- FEED_STOCK policies
DROP POLICY IF EXISTS "feed_stock_select" ON feed_stock;
DROP POLICY IF EXISTS "feed_stock_insert" ON feed_stock;
DROP POLICY IF EXISTS "feed_stock_update" ON feed_stock;
DROP POLICY IF EXISTS "feed_stock_delete" ON feed_stock;

CREATE POLICY "feed_stock_select" ON feed_stock FOR SELECT TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "feed_stock_insert" ON feed_stock FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "feed_stock_update" ON feed_stock FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));
CREATE POLICY "feed_stock_delete" ON feed_stock FOR DELETE TO authenticated
  USING (farm_id IN (SELECT get_user_farm_ids()));

-- ============================================
-- 10. VERIFICATION FINALE
-- ============================================

-- Afficher toutes les tables créées
SELECT
  tablename,
  rowsecurity as "RLS activée"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('farms', 'pigs', 'gestations', 'health_cases', 'tasks', 'costs', 'feed_stock')
ORDER BY tablename;

-- Compter les policies par table
SELECT
  tablename,
  COUNT(*) as policies_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('farms', 'pigs', 'gestations', 'health_cases', 'tasks', 'costs', 'feed_stock')
GROUP BY tablename
ORDER BY tablename;

SELECT 'Schema PorkyFarm V2.0 vérifié et corrigé avec succès!' as status;
