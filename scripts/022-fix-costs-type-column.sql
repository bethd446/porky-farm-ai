-- ================================================
-- CORRECTION TABLE COSTS - COLONNE TYPE
-- ================================================
-- La colonne 'type' est utilisée par le service costs
-- mais n'existe pas dans la table. Ce script l'ajoute.
-- ================================================

-- 1. Vérifier si la table costs existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'costs' AND table_schema = 'public') THEN
    -- Créer la table costs si elle n'existe pas
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

    -- Index pour performance
    CREATE INDEX idx_costs_farm_id ON costs(farm_id);
    CREATE INDEX idx_costs_cost_date ON costs(cost_date);
    CREATE INDEX idx_costs_type ON costs(type);
    CREATE INDEX idx_costs_category ON costs(category);

    RAISE NOTICE 'Table costs créée avec succès';
  ELSE
    -- La table existe, vérifier si la colonne type existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'costs' AND column_name = 'type' AND table_schema = 'public') THEN
      -- Ajouter la colonne type
      ALTER TABLE public.costs ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'expense';
      ALTER TABLE public.costs ADD CONSTRAINT costs_type_check CHECK (type IN ('expense', 'income'));
      CREATE INDEX IF NOT EXISTS idx_costs_type ON costs(type);
      RAISE NOTICE 'Colonne type ajoutée à la table costs';
    ELSE
      RAISE NOTICE 'La colonne type existe déjà dans costs';
    END IF;

    -- Vérifier si la colonne category existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'costs' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE public.costs ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'autre';
      ALTER TABLE public.costs ADD CONSTRAINT costs_category_check CHECK (category IN ('alimentation', 'veterinaire', 'equipement', 'main_oeuvre', 'transport', 'vente', 'autre'));
      CREATE INDEX IF NOT EXISTS idx_costs_category ON costs(category);
      RAISE NOTICE 'Colonne category ajoutée à la table costs';
    END IF;

    -- Vérifier si la colonne cost_date existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'costs' AND column_name = 'cost_date' AND table_schema = 'public') THEN
      ALTER TABLE public.costs ADD COLUMN cost_date DATE NOT NULL DEFAULT CURRENT_DATE;
      CREATE INDEX IF NOT EXISTS idx_costs_cost_date ON costs(cost_date);
      RAISE NOTICE 'Colonne cost_date ajoutée à la table costs';
    END IF;
  END IF;
END $$;

-- 2. Activer RLS sur costs
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

-- 3. Créer les policies RLS pour costs
DROP POLICY IF EXISTS "costs_select_policy" ON costs;
DROP POLICY IF EXISTS "costs_insert_policy" ON costs;
DROP POLICY IF EXISTS "costs_update_policy" ON costs;
DROP POLICY IF EXISTS "costs_delete_policy" ON costs;

CREATE POLICY "costs_select_policy" ON costs
FOR SELECT TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "costs_insert_policy" ON costs
FOR INSERT TO authenticated
WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "costs_update_policy" ON costs
FOR UPDATE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "costs_delete_policy" ON costs
FOR DELETE TO authenticated
USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- 4. Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'costs' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Migration costs terminée avec succès' as status;
