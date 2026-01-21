-- ================================================
-- TABLES FORMULATION ALIMENTAIRE COMPLETES
-- ================================================
-- Tables pour le module de fabrication d'aliment maison
-- - feed_ingredients: Ingrédients avec valeurs nutritionnelles
-- - feed_formulas: Formules sauvegardées
-- - feed_formula_ingredients: Liaison formule-ingrédient
-- ================================================

-- ============================================
-- 1. TABLE FEED_INGREDIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'cereal' CHECK (category IN ('cereal', 'protein', 'mineral', 'vitamin', 'additive')),
  protein_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  energy_kcal DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  calcium_pct DECIMAL(5,2),
  phosphorus_pct DECIMAL(5,2),
  stock_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_inclusion_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_inclusion_pct DECIMAL(5,2) NOT NULL DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_farm_id ON feed_ingredients(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_category ON feed_ingredients(category);

-- ============================================
-- 2. TABLE FEED_FORMULAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_category VARCHAR(20) NOT NULL CHECK (target_category IN ('starter', 'grower', 'finisher', 'sow_gestation', 'sow_lactation', 'boar')),
  target_protein_pct DECIMAL(5,2),
  target_energy_kcal DECIMAL(8,2),
  target_fiber_pct DECIMAL(5,2),
  calculated_protein_pct DECIMAL(5,2),
  calculated_energy_kcal DECIMAL(8,2),
  calculated_fiber_pct DECIMAL(5,2),
  total_cost_per_kg DECIMAL(10,2),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_feed_formulas_farm_id ON feed_formulas(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_formulas_category ON feed_formulas(target_category);

-- ============================================
-- 3. TABLE FEED_FORMULA_INGREDIENTS (jonction)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_formula_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID NOT NULL REFERENCES feed_formulas(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES feed_ingredients(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(formula_id, ingredient_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_formula_id ON feed_formula_ingredients(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_ingredient_id ON feed_formula_ingredients(ingredient_id);

-- ============================================
-- 4. ACTIVER RLS
-- ============================================
ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_formula_ingredients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES RLS - FEED_INGREDIENTS
-- ============================================
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

-- ============================================
-- 6. POLICIES RLS - FEED_FORMULAS
-- ============================================
DROP POLICY IF EXISTS "feed_formulas_select" ON feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_insert" ON feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_update" ON feed_formulas;
DROP POLICY IF EXISTS "feed_formulas_delete" ON feed_formulas;

CREATE POLICY "feed_formulas_select" ON feed_formulas FOR SELECT TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "feed_formulas_insert" ON feed_formulas FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "feed_formulas_update" ON feed_formulas FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "feed_formulas_delete" ON feed_formulas FOR DELETE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- 7. POLICIES RLS - FEED_FORMULA_INGREDIENTS
-- ============================================
DROP POLICY IF EXISTS "feed_formula_ingredients_select" ON feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_insert" ON feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_update" ON feed_formula_ingredients;
DROP POLICY IF EXISTS "feed_formula_ingredients_delete" ON feed_formula_ingredients;

-- Pour la table de jonction, on vérifie via la formule parente
CREATE POLICY "feed_formula_ingredients_select" ON feed_formula_ingredients FOR SELECT TO authenticated
  USING (formula_id IN (
    SELECT id FROM feed_formulas WHERE farm_id IN (
      SELECT id FROM farms WHERE user_id = (SELECT auth.uid())
    )
  ));

CREATE POLICY "feed_formula_ingredients_insert" ON feed_formula_ingredients FOR INSERT TO authenticated
  WITH CHECK (formula_id IN (
    SELECT id FROM feed_formulas WHERE farm_id IN (
      SELECT id FROM farms WHERE user_id = (SELECT auth.uid())
    )
  ));

CREATE POLICY "feed_formula_ingredients_update" ON feed_formula_ingredients FOR UPDATE TO authenticated
  USING (formula_id IN (
    SELECT id FROM feed_formulas WHERE farm_id IN (
      SELECT id FROM farms WHERE user_id = (SELECT auth.uid())
    )
  ));

CREATE POLICY "feed_formula_ingredients_delete" ON feed_formula_ingredients FOR DELETE TO authenticated
  USING (formula_id IN (
    SELECT id FROM feed_formulas WHERE farm_id IN (
      SELECT id FROM farms WHERE user_id = (SELECT auth.uid())
    )
  ));

-- ============================================
-- 8. TRIGGERS UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS set_feed_ingredients_updated_at ON feed_ingredients;
CREATE TRIGGER set_feed_ingredients_updated_at
  BEFORE UPDATE ON feed_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_feed_formulas_updated_at ON feed_formulas;
CREATE TRIGGER set_feed_formulas_updated_at
  BEFORE UPDATE ON feed_formulas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. DONNEES DE DEMO (optionnel)
-- ============================================
-- Vous pouvez insérer des ingrédients de démonstration ici si nécessaire
-- INSERT INTO feed_ingredients (farm_id, name, category, ...) VALUES (...);

-- ============================================
-- 10. INGREDIENTS DE BASE PAR DEFAUT
-- ============================================
-- Note: Ces ingrédients seront copiés pour chaque nouvelle ferme via un trigger ou manuellement

-- Fonction pour ajouter les ingrédients de base à une ferme
CREATE OR REPLACE FUNCTION add_default_ingredients(p_farm_id UUID)
RETURNS void AS $$
BEGIN
  -- Céréales
  INSERT INTO feed_ingredients (farm_id, name, category, protein_pct, energy_kcal, fiber_pct, price_per_kg, min_inclusion_pct, max_inclusion_pct)
  VALUES
    (p_farm_id, 'Maïs grain', 'cereal', 8.5, 335, 2.5, 250, 0, 70),
    (p_farm_id, 'Son de blé', 'cereal', 15.0, 270, 11.0, 180, 0, 25),
    (p_farm_id, 'Sorgho', 'cereal', 10.0, 330, 2.0, 200, 0, 50),
    (p_farm_id, 'Mil', 'cereal', 11.0, 320, 2.5, 220, 0, 40),
    (p_farm_id, 'Riz brisé', 'cereal', 7.5, 345, 0.5, 280, 0, 30)
  ON CONFLICT DO NOTHING;

  -- Protéines
  INSERT INTO feed_ingredients (farm_id, name, category, protein_pct, energy_kcal, fiber_pct, price_per_kg, min_inclusion_pct, max_inclusion_pct)
  VALUES
    (p_farm_id, 'Tourteau de soja', 'protein', 44.0, 330, 6.0, 450, 5, 25),
    (p_farm_id, 'Tourteau d''arachide', 'protein', 48.0, 350, 5.0, 380, 5, 20),
    (p_farm_id, 'Tourteau de coton', 'protein', 38.0, 280, 12.0, 280, 0, 15),
    (p_farm_id, 'Farine de poisson', 'protein', 60.0, 290, 1.0, 800, 2, 10),
    (p_farm_id, 'Drêche de brasserie', 'protein', 25.0, 240, 15.0, 150, 0, 20)
  ON CONFLICT DO NOTHING;

  -- Minéraux
  INSERT INTO feed_ingredients (farm_id, name, category, protein_pct, energy_kcal, fiber_pct, calcium_pct, phosphorus_pct, price_per_kg, min_inclusion_pct, max_inclusion_pct)
  VALUES
    (p_farm_id, 'Coquilles d''huîtres', 'mineral', 0, 0, 0, 38.0, 0.1, 120, 0.5, 2),
    (p_farm_id, 'Phosphate bicalcique', 'mineral', 0, 0, 0, 23.0, 18.0, 500, 0.5, 2),
    (p_farm_id, 'Sel iodé', 'mineral', 0, 0, 0, 0, 0, 100, 0.3, 0.5)
  ON CONFLICT DO NOTHING;

  -- Additifs
  INSERT INTO feed_ingredients (farm_id, name, category, protein_pct, energy_kcal, fiber_pct, price_per_kg, min_inclusion_pct, max_inclusion_pct)
  VALUES
    (p_farm_id, 'Prémix vitaminé', 'vitamin', 0, 0, 0, 2500, 0.25, 0.5),
    (p_farm_id, 'Huile de palme', 'additive', 0, 880, 0, 600, 0, 5),
    (p_farm_id, 'Mélasse', 'additive', 3.0, 200, 0, 200, 0, 5)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour ajouter automatiquement les ingrédients aux nouvelles fermes
CREATE OR REPLACE FUNCTION trigger_add_default_ingredients()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM add_default_ingredients(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_add_default_ingredients ON farms;
CREATE TRIGGER trg_add_default_ingredients
  AFTER INSERT ON farms
  FOR EACH ROW
  EXECUTE FUNCTION trigger_add_default_ingredients();

-- Ajouter les ingrédients aux fermes existantes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM farms LOOP
    PERFORM add_default_ingredients(r.id);
  END LOOP;
END $$;

-- ============================================
-- 11. VERIFICATION
-- ============================================
SELECT
  tablename,
  rowsecurity as "RLS"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('feed_ingredients', 'feed_formulas', 'feed_formula_ingredients')
ORDER BY tablename;

SELECT 'Ingrédients par ferme:' as info, farm_id, COUNT(*) as count
FROM feed_ingredients
GROUP BY farm_id;

SELECT 'Tables de formulation alimentaire créées avec succès!' as status;
