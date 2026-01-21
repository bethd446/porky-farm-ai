-- ================================================
-- TABLE FEED_INGREDIENTS
-- ================================================
-- Ingrédients pour la formulation d'aliments
-- ================================================

-- Créer la table feed_ingredients
CREATE TABLE IF NOT EXISTS public.feed_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'autre' CHECK (category IN ('cereale', 'proteine', 'mineral', 'vitamine', 'additif', 'autre')),
  unit VARCHAR(20) DEFAULT 'kg',
  quantity_available DECIMAL(10,2) DEFAULT 0,
  unit_price DECIMAL(10,2),
  protein_percentage DECIMAL(5,2),
  energy_kcal DECIMAL(10,2),
  fiber_percentage DECIMAL(5,2),
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_farm_id ON feed_ingredients(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_category ON feed_ingredients(category);

-- Activer RLS
ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies RLS
DROP POLICY IF EXISTS "feed_ingredients_select" ON feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_insert" ON feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_update" ON feed_ingredients;
DROP POLICY IF EXISTS "feed_ingredients_delete" ON feed_ingredients;

CREATE POLICY "feed_ingredients_select" ON feed_ingredients FOR SELECT TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "feed_ingredients_insert" ON feed_ingredients FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "feed_ingredients_update" ON feed_ingredients FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "feed_ingredients_delete" ON feed_ingredients FOR DELETE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_feed_ingredients_updated_at ON feed_ingredients;
CREATE TRIGGER set_feed_ingredients_updated_at
  BEFORE UPDATE ON feed_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'feed_ingredients' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Table feed_ingredients créée avec succès!' as status;
