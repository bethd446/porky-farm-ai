-- =====================================================
-- MIGRATION: Tables pour Fabrication d'Aliment Maison
-- Adapte aux pratiques Afrique de l'Ouest (Cote d'Ivoire)
-- =====================================================

-- Table des ingredients disponibles localement
CREATE TABLE IF NOT EXISTS feed_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cereal', 'protein', 'mineral', 'vitamin', 'additive')),

  -- Valeurs nutritionnelles (pour 100g)
  protein_pct DECIMAL(5,2) NOT NULL DEFAULT 0,  -- % proteines
  energy_kcal DECIMAL(6,1) NOT NULL DEFAULT 0,  -- kcal/100g
  fiber_pct DECIMAL(5,2) NOT NULL DEFAULT 0,    -- % fibres
  calcium_pct DECIMAL(5,3) DEFAULT 0,           -- % calcium
  phosphorus_pct DECIMAL(5,3) DEFAULT 0,        -- % phosphore

  -- Stock et prix
  stock_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10,0) NOT NULL DEFAULT 0, -- FCFA

  -- Limites d'inclusion dans la ration (%)
  min_inclusion_pct DECIMAL(5,2) DEFAULT 0,
  max_inclusion_pct DECIMAL(5,2) DEFAULT 100,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recettes de melange sauvegardees
CREATE TABLE IF NOT EXISTS feed_formulas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_category TEXT NOT NULL CHECK (target_category IN ('starter', 'grower', 'finisher', 'sow_gestation', 'sow_lactation', 'boar')),

  -- Objectifs nutritionnels
  target_protein_pct DECIMAL(5,2),
  target_energy_kcal DECIMAL(6,1),
  target_fiber_pct DECIMAL(5,2),

  -- Resultats calcules
  calculated_protein_pct DECIMAL(5,2),
  calculated_energy_kcal DECIMAL(6,1),
  calculated_fiber_pct DECIMAL(5,2),
  total_cost_per_kg DECIMAL(10,0),  -- FCFA/kg

  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composition des recettes (ingredients et proportions)
CREATE TABLE IF NOT EXISTS feed_formula_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  formula_id UUID NOT NULL REFERENCES feed_formulas(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES feed_ingredients(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(formula_id, ingredient_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_user ON feed_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_ingredients_category ON feed_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_feed_formulas_user ON feed_formulas(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_formulas_category ON feed_formulas(target_category);
CREATE INDEX IF NOT EXISTS idx_feed_formula_ingredients_formula ON feed_formula_ingredients(formula_id);

-- Activer RLS
ALTER TABLE feed_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_formula_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies pour feed_ingredients
CREATE POLICY "Users can view their ingredients"
  ON feed_ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their ingredients"
  ON feed_ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ingredients"
  ON feed_ingredients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their ingredients"
  ON feed_ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour feed_formulas
CREATE POLICY "Users can view their formulas"
  ON feed_formulas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their formulas"
  ON feed_formulas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their formulas"
  ON feed_formulas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their formulas"
  ON feed_formulas FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour feed_formula_ingredients (via formula ownership)
CREATE POLICY "Users can view formula ingredients"
  ON feed_formula_ingredients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feed_formulas f WHERE f.id = formula_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert formula ingredients"
  ON feed_formula_ingredients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feed_formulas f WHERE f.id = formula_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can update formula ingredients"
  ON feed_formula_ingredients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feed_formulas f WHERE f.id = formula_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete formula ingredients"
  ON feed_formula_ingredients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feed_formulas f WHERE f.id = formula_id AND f.user_id = auth.uid()
  ));

-- Ingredients par defaut pour Afrique de l'Ouest
-- Ces donnees seront inserees pour chaque nouvel utilisateur via une fonction trigger

-- Fonction pour inserer les ingredients par defaut
CREATE OR REPLACE FUNCTION insert_default_ingredients()
RETURNS TRIGGER AS $$
BEGIN
  -- Cereales (sources d'energie)
  INSERT INTO feed_ingredients (user_id, name, category, protein_pct, energy_kcal, fiber_pct, price_per_kg, max_inclusion_pct)
  VALUES
    (NEW.id, 'Mais grain', 'cereal', 9.0, 365, 2.3, 200, 70),
    (NEW.id, 'Son de ble', 'cereal', 15.5, 275, 10.0, 100, 25),
    (NEW.id, 'Sorgho', 'cereal', 11.0, 339, 2.0, 180, 50),
    (NEW.id, 'Riz (brisures)', 'cereal', 7.5, 360, 0.5, 250, 40),
    (NEW.id, 'Manioc (cossettes)', 'cereal', 2.0, 350, 3.5, 80, 30);

  -- Sources de proteines
  INSERT INTO feed_ingredients (user_id, name, category, protein_pct, energy_kcal, fiber_pct, price_per_kg, max_inclusion_pct)
  VALUES
    (NEW.id, 'Tourteau de soja', 'protein', 44.0, 330, 7.0, 450, 25),
    (NEW.id, 'Tourteau d''arachide', 'protein', 45.0, 350, 6.5, 350, 20),
    (NEW.id, 'Tourteau de coton', 'protein', 40.0, 320, 12.0, 200, 15),
    (NEW.id, 'Tourteau de palmiste', 'protein', 18.0, 280, 15.0, 150, 20),
    (NEW.id, 'Farine de poisson', 'protein', 60.0, 295, 1.0, 800, 10),
    (NEW.id, 'Farine de sang', 'protein', 80.0, 320, 1.0, 300, 5);

  -- Mineraux
  INSERT INTO feed_ingredients (user_id, name, category, protein_pct, energy_kcal, calcium_pct, phosphorus_pct, price_per_kg, max_inclusion_pct)
  VALUES
    (NEW.id, 'Coquilles d''huitres', 'mineral', 0, 0, 38.0, 0.1, 100, 2),
    (NEW.id, 'Phosphate bicalcique', 'mineral', 0, 0, 24.0, 18.0, 500, 2),
    (NEW.id, 'Sel (NaCl)', 'mineral', 0, 0, 0, 0, 150, 0.5);

  -- Additifs
  INSERT INTO feed_ingredients (user_id, name, category, protein_pct, energy_kcal, price_per_kg, max_inclusion_pct)
  VALUES
    (NEW.id, 'Premix vitamines-mineraux', 'vitamin', 0, 0, 3000, 0.5),
    (NEW.id, 'Lysine', 'additive', 0, 0, 2500, 0.3),
    (NEW.id, 'Methionine', 'additive', 0, 0, 4000, 0.2);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaire: Le trigger doit etre cree sur la table profiles apres creation du compte
-- CREATE TRIGGER on_profile_created
--   AFTER INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION insert_default_ingredients();

-- =====================================================
-- FIN MIGRATION
-- =====================================================
