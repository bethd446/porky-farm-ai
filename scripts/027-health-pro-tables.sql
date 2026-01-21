-- ================================================
-- TABLES SANTE PRO - PORKYFARMI V2.0
-- ================================================
-- Tables pour le module de santé avancé:
-- - symptoms: Liste des symptômes référencés
-- - diseases: Base de données des maladies porcines
-- - treatments: Suivi des traitements administrés
-- ================================================

-- ============================================
-- 1. TABLE SYMPTOMS (symptômes référencés)
-- ============================================
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (category IN ('respiratory', 'digestive', 'reproductive', 'skin', 'behavioral', 'general')),
  description TEXT,
  severity_indicator VARCHAR(10) DEFAULT 'medium' CHECK (severity_indicator IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category);
CREATE INDEX IF NOT EXISTS idx_symptoms_code ON symptoms(code);

-- ============================================
-- 2. TABLE DISEASES (maladies porcines)
-- ============================================
CREATE TABLE IF NOT EXISTS public.diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  description TEXT,
  common_symptoms TEXT[] DEFAULT '{}',
  recommended_actions TEXT,
  quarantine_required BOOLEAN DEFAULT FALSE,
  notifiable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);
CREATE INDEX IF NOT EXISTS idx_diseases_code ON diseases(code);

-- ============================================
-- 3. TABLE TREATMENTS (traitements)
-- ============================================
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  health_case_id UUID REFERENCES health_cases(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
  treatment_type VARCHAR(20) NOT NULL DEFAULT 'other' CHECK (treatment_type IN ('antibiotic', 'vaccine', 'antiparasitic', 'vitamin', 'other')),
  product_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  administration_route VARCHAR(20) CHECK (administration_route IN ('oral', 'injection', 'topical', 'feed')),
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(100),
  withdrawal_meat_days INTEGER,
  withdrawal_date DATE,
  administered_by VARCHAR(255),
  vet_prescription BOOLEAN DEFAULT FALSE,
  batch_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_treatments_farm_id ON treatments(farm_id);
CREATE INDEX IF NOT EXISTS idx_treatments_animal_id ON treatments(animal_id);
CREATE INDEX IF NOT EXISTS idx_treatments_health_case_id ON treatments(health_case_id);
CREATE INDEX IF NOT EXISTS idx_treatments_withdrawal_date ON treatments(withdrawal_date);

-- ============================================
-- 4. ACTIVER RLS
-- ============================================
-- Note: symptoms et diseases sont des tables de référence globales (pas de RLS)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES RLS - TREATMENTS
-- ============================================
DROP POLICY IF EXISTS "treatments_select" ON treatments;
DROP POLICY IF EXISTS "treatments_insert" ON treatments;
DROP POLICY IF EXISTS "treatments_update" ON treatments;
DROP POLICY IF EXISTS "treatments_delete" ON treatments;

CREATE POLICY "treatments_select" ON treatments FOR SELECT TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "treatments_insert" ON treatments FOR INSERT TO authenticated
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "treatments_update" ON treatments FOR UPDATE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "treatments_delete" ON treatments FOR DELETE TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- 6. TRIGGER UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS set_treatments_updated_at ON treatments;
CREATE TRIGGER set_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. DONNÉES DE RÉFÉRENCE - SYMPTÔMES
-- ============================================
INSERT INTO symptoms (code, name, category, description, severity_indicator) VALUES
  -- Respiratoire
  ('RESP_COUGH', 'Toux', 'respiratory', 'Toux sèche ou grasse', 'medium'),
  ('RESP_SNEEZE', 'Éternuements', 'respiratory', 'Éternuements fréquents', 'low'),
  ('RESP_DYSPNEA', 'Difficultés respiratoires', 'respiratory', 'Respiration laborieuse, bruyante', 'high'),
  ('RESP_NASAL', 'Écoulement nasal', 'respiratory', 'Écoulement nasal clair ou purulent', 'medium'),

  -- Digestif
  ('DIG_DIARRHEA', 'Diarrhée', 'digestive', 'Selles liquides ou molles', 'medium'),
  ('DIG_VOMIT', 'Vomissements', 'digestive', 'Vomissements répétés', 'high'),
  ('DIG_ANOREXIA', 'Perte d''appétit', 'digestive', 'Refus de manger ou appétit réduit', 'medium'),
  ('DIG_BLOAT', 'Ballonnement', 'digestive', 'Abdomen gonflé', 'medium'),

  -- Reproduction
  ('REPRO_ABORT', 'Avortement', 'reproductive', 'Avortement ou mise-bas prématurée', 'critical'),
  ('REPRO_DISCHARGE', 'Écoulement vaginal', 'reproductive', 'Écoulement vaginal anormal', 'medium'),
  ('REPRO_INFERTILITY', 'Infertilité', 'reproductive', 'Échec de saillie répété', 'medium'),

  -- Cutané
  ('SKIN_LESION', 'Lésions cutanées', 'skin', 'Plaies, ulcères ou éruptions', 'medium'),
  ('SKIN_ITCH', 'Démangeaisons', 'skin', 'Grattage excessif', 'low'),
  ('SKIN_REDNESS', 'Rougeurs', 'skin', 'Zones rouges sur la peau', 'low'),

  -- Comportemental
  ('BEH_LETHARGY', 'Léthargie', 'behavioral', 'Animal apathique, peu réactif', 'medium'),
  ('BEH_AGGRESSION', 'Agressivité', 'behavioral', 'Comportement agressif inhabituel', 'low'),
  ('BEH_ISOLATION', 'Isolement', 'behavioral', 'L''animal s''isole du groupe', 'medium'),

  -- Général
  ('GEN_FEVER', 'Fièvre', 'general', 'Température corporelle élevée (>39.5°C)', 'high'),
  ('GEN_WEIGHT_LOSS', 'Perte de poids', 'general', 'Amaigrissement visible', 'medium'),
  ('GEN_WEAKNESS', 'Faiblesse', 'general', 'Difficulté à se lever ou marcher', 'high'),
  ('GEN_LAMENESS', 'Boiterie', 'general', 'Difficulté à marcher, boiterie', 'medium')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 8. DONNÉES DE RÉFÉRENCE - MALADIES
-- ============================================
INSERT INTO diseases (code, name, category, description, common_symptoms, recommended_actions, quarantine_required, notifiable) VALUES
  -- Maladies respiratoires
  ('PPC', 'Peste Porcine Classique', 'viral',
   'Maladie virale grave et très contagieuse',
   ARRAY['GEN_FEVER', 'RESP_COUGH', 'DIG_DIARRHEA', 'SKIN_LESION'],
   'Contacter immédiatement le vétérinaire et les autorités sanitaires. Isoler les animaux suspects.',
   TRUE, TRUE),

  ('PPA', 'Peste Porcine Africaine', 'viral',
   'Maladie virale grave sans traitement ni vaccin',
   ARRAY['GEN_FEVER', 'SKIN_REDNESS', 'DIG_VOMIT', 'RESP_DYSPNEA'],
   'Déclarer obligatoirement aux autorités. Aucun traitement disponible.',
   TRUE, TRUE),

  ('PRRS', 'Syndrome Dysgénésique et Respiratoire Porcin', 'viral',
   'Maladie virale affectant reproduction et respiration',
   ARRAY['RESP_DYSPNEA', 'REPRO_ABORT', 'GEN_FEVER', 'DIG_ANOREXIA'],
   'Vaccination préventive. Isoler les animaux malades.',
   TRUE, FALSE),

  ('GRIPPE', 'Grippe Porcine', 'viral',
   'Infection virale respiratoire',
   ARRAY['RESP_COUGH', 'RESP_SNEEZE', 'GEN_FEVER', 'DIG_ANOREXIA'],
   'Repos et hydratation. Antibiotiques pour infections secondaires.',
   FALSE, FALSE),

  -- Maladies bactériennes
  ('ROUGET', 'Rouget du Porc', 'bacterial',
   'Infection bactérienne par Erysipelothrix rhusiopathiae',
   ARRAY['GEN_FEVER', 'SKIN_LESION', 'SKIN_REDNESS', 'BEH_LETHARGY'],
   'Antibiothérapie (pénicilline). Vaccination préventive recommandée.',
   FALSE, FALSE),

  ('SALMONELLOSE', 'Salmonellose', 'bacterial',
   'Infection bactérienne intestinale',
   ARRAY['DIG_DIARRHEA', 'GEN_FEVER', 'DIG_ANOREXIA', 'GEN_WEAKNESS'],
   'Antibiothérapie adaptée. Améliorer l''hygiène.',
   TRUE, FALSE),

  -- Maladies parasitaires
  ('GALE', 'Gale Sarcoptique', 'parasitic',
   'Infestation par acariens',
   ARRAY['SKIN_ITCH', 'SKIN_LESION', 'BEH_AGGRESSION'],
   'Traitement antiparasitaire (ivermectine). Traiter tout le groupe.',
   FALSE, FALSE),

  ('ASCARIDIOSE', 'Ascaridiose', 'parasitic',
   'Infestation par vers ronds',
   ARRAY['GEN_WEIGHT_LOSS', 'DIG_DIARRHEA', 'RESP_COUGH'],
   'Vermifugation régulière. Améliorer l''hygiène des locaux.',
   FALSE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 9. VÉRIFICATION
-- ============================================
SELECT
  tablename,
  CASE WHEN rowsecurity THEN 'Oui' ELSE 'Non' END as "RLS"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('symptoms', 'diseases', 'treatments')
ORDER BY tablename;

SELECT 'Symptômes:' as type, COUNT(*) as count FROM symptoms
UNION ALL
SELECT 'Maladies:' as type, COUNT(*) as count FROM diseases;

SELECT 'Tables Santé PRO créées avec succès!' as status;
