-- =====================================================
-- PORKYFARM V2.0 - Migration Tables avec farm_id
-- =====================================================
-- Ce script crée les tables nécessaires pour la V2.0
-- avec farm_id au lieu de user_id
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLE FARMS (si elle n'existe pas déjà)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Ma ferme',
  location TEXT,
  size_hectares DECIMAL(10,2),
  farm_type TEXT DEFAULT 'mixed',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- Un utilisateur = une ferme
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farm" ON public.farms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farm" ON public.farms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farm" ON public.farms
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 2. TABLE PIGS (V2.0 avec farm_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  identifier TEXT NOT NULL,
  name TEXT,
  category TEXT NOT NULL CHECK (category IN ('truie', 'verrat', 'porcelet', 'engraissement')),
  gender TEXT CHECK (gender IN ('male', 'female')),
  breed TEXT,
  birth_date DATE,
  acquisition_date DATE,
  weight_kg DECIMAL(10,2),
  weight_history JSONB DEFAULT '[]',
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'vendu', 'mort', 'reforme')),
  mother_id UUID REFERENCES public.pigs(id),
  father_id UUID REFERENCES public.pigs(id),
  photo_url TEXT,
  tags TEXT[],
  notes TEXT,
  building TEXT,
  pen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour pigs
CREATE INDEX IF NOT EXISTS idx_pigs_farm_id ON public.pigs(farm_id);
CREATE INDEX IF NOT EXISTS idx_pigs_category ON public.pigs(category);
CREATE INDEX IF NOT EXISTS idx_pigs_status ON public.pigs(status);
CREATE INDEX IF NOT EXISTS idx_pigs_identifier ON public.pigs(identifier);

-- RLS pour pigs
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pigs from own farm" ON public.pigs
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert pigs to own farm" ON public.pigs
  FOR INSERT WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update pigs from own farm" ON public.pigs
  FOR UPDATE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete pigs from own farm" ON public.pigs
  FOR DELETE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- =====================================================
-- 3. TABLE GESTATIONS (V2.0 avec farm_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  sow_id UUID REFERENCES public.pigs(id) ON DELETE CASCADE NOT NULL,
  boar_id UUID REFERENCES public.pigs(id),
  mating_date DATE NOT NULL,
  expected_farrowing_date DATE,
  actual_farrowing_date DATE,
  piglets_born_alive INTEGER,
  piglets_stillborn INTEGER,
  piglets_weaned INTEGER,
  weaning_date DATE,
  status TEXT DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'terminee', 'avortee')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour gestations
CREATE INDEX IF NOT EXISTS idx_gestations_farm_id ON public.gestations(farm_id);
CREATE INDEX IF NOT EXISTS idx_gestations_sow_id ON public.gestations(sow_id);
CREATE INDEX IF NOT EXISTS idx_gestations_status ON public.gestations(status);

-- RLS pour gestations
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gestations from own farm" ON public.gestations
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert gestations to own farm" ON public.gestations
  FOR INSERT WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update gestations from own farm" ON public.gestations
  FOR UPDATE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete gestations from own farm" ON public.gestations
  FOR DELETE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- =====================================================
-- 4. TABLE HEALTH_CASES (V2.0 avec farm_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.health_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES public.pigs(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ongoing', 'resolved', 'chronic')),
  symptoms TEXT[],
  suspected_disease_id UUID,
  confirmed_disease_id UUID,
  temperature DECIMAL(4,1),
  affected_count INTEGER DEFAULT 1,
  quarantine_applied BOOLEAN DEFAULT false,
  vet_consulted BOOLEAN DEFAULT false,
  vet_visit_date DATE,
  lab_results TEXT,
  treatment TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resolution_date DATE,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour health_cases
CREATE INDEX IF NOT EXISTS idx_health_cases_farm_id ON public.health_cases(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_animal_id ON public.health_cases(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_status ON public.health_cases(status);
CREATE INDEX IF NOT EXISTS idx_health_cases_severity ON public.health_cases(severity);

-- RLS pour health_cases
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view health_cases from own farm" ON public.health_cases
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert health_cases to own farm" ON public.health_cases
  FOR INSERT WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update health_cases from own farm" ON public.health_cases
  FOR UPDATE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete health_cases from own farm" ON public.health_cases
  FOR DELETE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- =====================================================
-- 5. TABLE TASKS (V2.0 avec farm_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('health', 'feeding', 'cleaning', 'reproduction', 'admin', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  frequency TEXT DEFAULT 'one_time' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'event_based', 'one_time')),
  due_date DATE,
  due_time TIME,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  related_animal_id UUID REFERENCES public.pigs(id) ON DELETE SET NULL,
  related_health_case_id UUID REFERENCES public.health_cases(id) ON DELETE SET NULL,
  related_gestation_id UUID REFERENCES public.gestations(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour tasks
CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- RLS pour tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks from own farm" ON public.tasks
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert tasks to own farm" ON public.tasks
  FOR INSERT WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update tasks from own farm" ON public.tasks
  FOR UPDATE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete tasks from own farm" ON public.tasks
  FOR DELETE USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- =====================================================
-- 6. FONCTION TRIGGER updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_farms_updated_at ON public.farms;
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pigs_updated_at ON public.pigs;
CREATE TRIGGER update_pigs_updated_at
  BEFORE UPDATE ON public.pigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gestations_updated_at ON public.gestations;
CREATE TRIGGER update_gestations_updated_at
  BEFORE UPDATE ON public.gestations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_cases_updated_at ON public.health_cases;
CREATE TRIGGER update_health_cases_updated_at
  BEFORE UPDATE ON public.health_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. VERIFICATION
-- =====================================================
DO $$
DECLARE
  v_tables_ok INTEGER := 0;
BEGIN
  -- Vérifier que les tables existent
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farms' AND table_schema = 'public') THEN
    v_tables_ok := v_tables_ok + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pigs' AND table_schema = 'public') THEN
    v_tables_ok := v_tables_ok + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gestations' AND table_schema = 'public') THEN
    v_tables_ok := v_tables_ok + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_cases' AND table_schema = 'public') THEN
    v_tables_ok := v_tables_ok + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
    v_tables_ok := v_tables_ok + 1;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ MIGRATION V2.0 TERMINÉE';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Tables créées: %/5', v_tables_ok;
  RAISE NOTICE '- farms';
  RAISE NOTICE '- pigs (avec farm_id)';
  RAISE NOTICE '- gestations (avec farm_id)';
  RAISE NOTICE '- health_cases (avec farm_id)';
  RAISE NOTICE '- tasks (avec farm_id)';
  RAISE NOTICE '=====================================================';
END $$;
