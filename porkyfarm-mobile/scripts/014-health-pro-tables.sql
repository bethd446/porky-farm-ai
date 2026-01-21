-- =============================================
-- MIGRATION SANTE PRO - PorkyFarm
-- A executer dans Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Table des symptomes predefinisC
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'respiratory', 'digestive', 'reproductive', 'skin', 'behavioral', 'general'
  description TEXT,
  severity_indicator VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des maladies connues
CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  common_symptoms TEXT[], -- array of symptom codes
  recommended_actions TEXT,
  quarantine_required BOOLEAN DEFAULT false,
  notifiable BOOLEAN DEFAULT false, -- maladie a declaration obligatoire
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enrichir la table health_records existante
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS symptoms TEXT[];
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS suspected_disease_id UUID REFERENCES diseases(id);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS confirmed_disease_id UUID REFERENCES diseases(id);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS temperature DECIMAL(4,1);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS affected_count INTEGER DEFAULT 1;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS quarantine_applied BOOLEAN DEFAULT false;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS vet_consulted BOOLEAN DEFAULT false;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS vet_visit_date DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS lab_results TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS resolution_date DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- 4. Table des traitements (registre sanitaire)
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_case_id UUID REFERENCES health_records(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES pigs(id) ON DELETE SET NULL,
  treatment_type VARCHAR(50) NOT NULL, -- 'antibiotic', 'vaccine', 'antiparasitic', 'vitamin', 'other'
  product_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  administration_route VARCHAR(50), -- 'oral', 'injection', 'topical', 'feed'
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(100), -- 'once', 'daily', 'twice_daily', 'weekly'
  withdrawal_meat_days INTEGER, -- delai d'attente viande
  withdrawal_date DATE, -- date calculee de fin de delai
  administered_by VARCHAR(100),
  vet_prescription BOOLEAN DEFAULT false,
  batch_number VARCHAR(100), -- numero de lot du medicament
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS pour les nouvelles tables
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- Symptomes et maladies sont publics en lecture
CREATE POLICY "symptoms_read_all" ON symptoms FOR SELECT USING (true);
CREATE POLICY "diseases_read_all" ON diseases FOR SELECT USING (true);

-- Treatments: utilisateur voit ses propres traitements
CREATE POLICY "treatments_user_all" ON treatments FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- DONNEES DE REFERENCE - SYMPTOMES
-- =============================================

INSERT INTO symptoms (code, name, category, description, severity_indicator) VALUES
-- Respiratoires
('COUGH', 'Toux', 'respiratory', 'Toux seche ou grasse', 'medium'),
('SNEEZE', 'Eternuements', 'respiratory', 'Eternuements frequents', 'low'),
('DYSPNEA', 'Difficultes respiratoires', 'respiratory', 'Respiration laborieuse, abdominale', 'high'),
('NASAL_DISCHARGE', 'Ecoulement nasal', 'respiratory', 'Mucus ou pus nasal', 'medium'),
-- Digestifs
('DIARRHEA', 'Diarrhee', 'digestive', 'Selles liquides ou molles', 'medium'),
('VOMITING', 'Vomissements', 'digestive', 'Regurgitation alimentaire', 'medium'),
('ANOREXIA', 'Perte d''appetit', 'digestive', 'Refus de s''alimenter', 'medium'),
('BLOATING', 'Ballonnement', 'digestive', 'Abdomen distendu', 'high'),
-- Reproduction
('ABORTION', 'Avortement', 'reproductive', 'Perte de gestation', 'critical'),
('RETURN_HEAT', 'Retour en chaleur', 'reproductive', 'Retour en oestrus anormal', 'medium'),
('STILLBIRTH', 'Mort-nes', 'reproductive', 'Porcelets mort-nes', 'high'),
('MUMMIFIED', 'Momifies', 'reproductive', 'Foetus momifies', 'high'),
('AGALACTIA', 'Agalactie', 'reproductive', 'Absence de montee de lait', 'high'),
-- Generaux
('FEVER', 'Fievre', 'general', 'Temperature > 39.5C', 'high'),
('LETHARGY', 'Abattement', 'general', 'Animal prostre, faible', 'medium'),
('WEIGHT_LOSS', 'Amaigrissement', 'general', 'Perte de poids visible', 'medium'),
('LAMENESS', 'Boiterie', 'general', 'Difficultes locomotrices', 'medium'),
-- Cutanes
('SKIN_LESION', 'Lesions cutanees', 'skin', 'Plaies, croutes, rougeurs', 'medium'),
('PALLOR', 'Paleur', 'skin', 'Muqueuses pales (anemie)', 'high'),
('CYANOSIS', 'Cyanose', 'skin', 'Extremites bleutees', 'critical')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- DONNEES DE REFERENCE - MALADIES
-- =============================================

INSERT INTO diseases (code, name, category, description, common_symptoms, recommended_actions, quarantine_required, notifiable) VALUES
-- Respiratoires
('PRRS', 'SDRP (Syndrome Dysgenesique et Respiratoire Porcin)', 'respiratory',
 'Maladie virale majeure causant problemes respiratoires et reproductifs',
 ARRAY['COUGH', 'DYSPNEA', 'FEVER', 'ABORTION', 'STILLBIRTH'],
 'Consultation veterinaire urgente. Diagnostic labo. Mesures de biosecurite renforcees.',
 true, false),
('SWINE_FLU', 'Grippe porcine', 'respiratory',
 'Infection virale respiratoire a transmission rapide',
 ARRAY['COUGH', 'SNEEZE', 'FEVER', 'ANOREXIA', 'LETHARGY'],
 'Isolement des malades. Traitement symptomatique. Vaccination preventive.',
 true, false),
('PNEUMONIA', 'Pneumonie enzootique', 'respiratory',
 'Infection bacterienne (Mycoplasma) des poumons',
 ARRAY['COUGH', 'DYSPNEA', 'WEIGHT_LOSS'],
 'Antibiotherapie sur prescription. Ameliorer ventilation.',
 false, false),
-- Digestives
('COLIBACILLOSIS', 'Colibacillose', 'digestive',
 'Infection E. coli, frequente chez les porcelets',
 ARRAY['DIARRHEA', 'LETHARGY', 'WEIGHT_LOSS'],
 'Rehydratation. Antibiotherapie. Hygiene maternite.',
 false, false),
('PED', 'DEP (Diarrhee Epidemique Porcine)', 'digestive',
 'Maladie virale tres contagieuse avec forte mortalite porcelets',
 ARRAY['DIARRHEA', 'VOMITING', 'ANOREXIA'],
 'Alerte sanitaire. Mesures de biosecurite maximales. Consultation veterinaire urgente.',
 true, true),
('COCCIDIOSIS', 'Coccidiose', 'digestive',
 'Parasitose intestinale des porcelets',
 ARRAY['DIARRHEA', 'WEIGHT_LOSS'],
 'Traitement anticoccidien. Desinfection locaux.',
 false, false),
-- Reproductives
('PARVO', 'Parvovirose (SMEDI)', 'reproductive',
 'Infection virale causant troubles de reproduction',
 ARRAY['ABORTION', 'STILLBIRTH', 'MUMMIFIED', 'RETURN_HEAT'],
 'Vaccination des cochettes. Diagnostic differentiel labo.',
 false, false),
('MMA', 'Syndrome MMA', 'reproductive',
 'Mammite-Metrite-Agalactie post-partum',
 ARRAY['FEVER', 'AGALACTIA', 'ANOREXIA', 'LETHARGY'],
 'Antibiotherapie + anti-inflammatoires. Surveillance porcelets.',
 false, false)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- INDEX POUR PERFORMANCES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category);
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);
CREATE INDEX IF NOT EXISTS idx_treatments_user_id ON treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_treatments_animal_id ON treatments(animal_id);
CREATE INDEX IF NOT EXISTS idx_treatments_health_case_id ON treatments(health_case_id);
CREATE INDEX IF NOT EXISTS idx_health_records_symptoms ON health_records USING GIN(symptoms);

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================
