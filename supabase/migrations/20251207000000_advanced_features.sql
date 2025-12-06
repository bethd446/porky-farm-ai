-- Migration : Fonctionnalités avancées pour suivi professionnel
-- Tables pour gestations, santé, photos multiples, et IA

-- ============================================
-- TABLE: gestations
-- Suivi complet des gestations des truies
-- ============================================
CREATE TABLE public.gestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sow_id UUID NOT NULL REFERENCES public.pigs(id) ON DELETE CASCADE,
  boar_id UUID REFERENCES public.pigs(id) ON DELETE SET NULL,
  
  -- Dates importantes
  breeding_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  
  -- Suivi de la gestation
  gestation_status TEXT NOT NULL DEFAULT 'pregnant' CHECK (gestation_status IN ('pregnant', 'delivered', 'aborted', 'lost')),
  gestation_week INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN gestation_status = 'delivered' THEN NULL
      ELSE EXTRACT(WEEK FROM (expected_delivery_date - CURRENT_DATE))::INTEGER
    END
  ) STORED,
  
  -- Informations sur la portée
  expected_litter_size INTEGER,
  actual_litter_size INTEGER,
  live_piglets INTEGER,
  stillborn_piglets INTEGER,
  
  -- Notes et observations
  notes TEXT,
  veterinarian_notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index pour performances
CREATE INDEX idx_gestations_user_id ON public.gestations(user_id);
CREATE INDEX idx_gestations_sow_id ON public.gestations(sow_id);
CREATE INDEX idx_gestations_status ON public.gestations(gestation_status);
CREATE INDEX idx_gestations_delivery_date ON public.gestations(expected_delivery_date);

-- ============================================
-- TABLE: health_records
-- Suivi médical complet de chaque porc
-- ============================================
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pig_id UUID NOT NULL REFERENCES public.pigs(id) ON DELETE CASCADE,
  
  -- Type de record
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'treatment', 'checkup', 'surgery', 'medication', 'observation')),
  
  -- Détails
  title TEXT NOT NULL,
  description TEXT,
  veterinarian_name TEXT,
  cost NUMERIC(10,2),
  
  -- Dates
  record_date DATE NOT NULL,
  next_due_date DATE, -- Pour vaccinations récurrentes
  
  -- Médicaments/Traitements
  medications JSONB DEFAULT '[]'::jsonb, -- [{name, dosage, frequency, duration}]
  diagnosis TEXT,
  treatment_notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX idx_health_records_pig_id ON public.health_records(pig_id);
CREATE INDEX idx_health_records_type ON public.health_records(record_type);
CREATE INDEX idx_health_records_date ON public.health_records(record_date);
CREATE INDEX idx_health_records_next_due ON public.health_records(next_due_date) WHERE next_due_date IS NOT NULL;

-- ============================================
-- TABLE: pig_photos
-- Galerie de photos avec timeline
-- ============================================
CREATE TABLE public.pig_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pig_id UUID NOT NULL REFERENCES public.pigs(id) ON DELETE CASCADE,
  
  -- Photo
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Métadonnées
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  caption TEXT,
  tags TEXT[], -- ['gestation', 'health', 'weight', etc.]
  
  -- Analyse IA (optionnel)
  ai_analysis JSONB, -- Résultats d'analyse IA de l'image
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_pig_photos_user_id ON public.pig_photos(user_id);
CREATE INDEX idx_pig_photos_pig_id ON public.pig_photos(pig_id);
CREATE INDEX idx_pig_photos_date ON public.pig_photos(photo_date);
CREATE INDEX idx_pig_photos_tags ON public.pig_photos USING GIN(tags);

-- ============================================
-- TABLE: ai_insights
-- Insights générés par IA
-- ============================================
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pig_id UUID REFERENCES public.pigs(id) ON DELETE CASCADE,
  gestation_id UUID REFERENCES public.gestations(id) ON DELETE CASCADE,
  
  -- Type d'insight
  insight_type TEXT NOT NULL CHECK (insight_type IN ('health_alert', 'gestation_progress', 'weight_anomaly', 'behavior_pattern', 'nutrition_recommendation', 'breeding_optimization')),
  
  -- Contenu
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Données sources
  source_data JSONB, -- Données utilisées pour générer l'insight
  recommendations JSONB DEFAULT '[]'::jsonb, -- Actions recommandées
  
  -- Statut
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'dismissed', 'action_taken')),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_pig_id ON public.ai_insights(pig_id);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX idx_ai_insights_status ON public.ai_insights(status);
CREATE INDEX idx_ai_insights_created ON public.ai_insights(created_at DESC);

-- ============================================
-- TABLE: breeding_records
-- Historique des saillies
-- ============================================
CREATE TABLE public.breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sow_id UUID NOT NULL REFERENCES public.pigs(id) ON DELETE CASCADE,
  boar_id UUID NOT NULL REFERENCES public.pigs(id) ON DELETE CASCADE,
  
  -- Dates
  breeding_date DATE NOT NULL,
  breeding_time TIME,
  
  -- Méthode
  breeding_method TEXT CHECK (breeding_method IN ('natural', 'ai', 'mixed')),
  
  -- Résultat
  successful BOOLEAN,
  gestation_id UUID REFERENCES public.gestations(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_breeding_records_user_id ON public.breeding_records(user_id);
CREATE INDEX idx_breeding_records_sow_id ON public.breeding_records(sow_id);
CREATE INDEX idx_breeding_records_boar_id ON public.breeding_records(boar_id);
CREATE INDEX idx_breeding_records_date ON public.breeding_records(breeding_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Gestations
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gestations"
  ON public.gestations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gestations"
  ON public.gestations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gestations"
  ON public.gestations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gestations"
  ON public.gestations FOR DELETE
  USING (auth.uid() = user_id);

-- Health Records
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health records"
  ON public.health_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records"
  ON public.health_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records"
  ON public.health_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records"
  ON public.health_records FOR DELETE
  USING (auth.uid() = user_id);

-- Pig Photos
ALTER TABLE public.pig_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON public.pig_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON public.pig_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON public.pig_photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.pig_photos FOR DELETE
  USING (auth.uid() = user_id);

-- AI Insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON public.ai_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Breeding Records
ALTER TABLE public.breeding_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own breeding records"
  ON public.breeding_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breeding records"
  ON public.breeding_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own breeding records"
  ON public.breeding_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own breeding records"
  ON public.breeding_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================

CREATE TRIGGER update_gestations_updated_at
  BEFORE UPDATE ON public.gestations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pig_photos_updated_at
  BEFORE UPDATE ON public.pig_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breeding_records_updated_at
  BEFORE UPDATE ON public.breeding_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS utiles
-- ============================================

-- Fonction pour calculer la semaine de gestation
CREATE OR REPLACE FUNCTION get_gestation_week(breeding_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(WEEK FROM (breeding_date + INTERVAL '114 days' - CURRENT_DATE))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour obtenir les truies gestantes
CREATE OR REPLACE FUNCTION get_pregnant_sows(user_uuid UUID)
RETURNS TABLE (
  pig_id UUID,
  tag_number TEXT,
  breeding_date DATE,
  expected_delivery_date DATE,
  gestation_week INTEGER,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.tag_number,
    g.breeding_date,
    g.expected_delivery_date,
    get_gestation_week(g.breeding_date) as gestation_week,
    (g.expected_delivery_date - CURRENT_DATE)::INTEGER as days_remaining
  FROM public.pigs p
  INNER JOIN public.gestations g ON g.sow_id = p.id
  WHERE p.user_id = user_uuid
    AND p.sex = 'female'
    AND g.gestation_status = 'pregnant'
    AND g.expected_delivery_date >= CURRENT_DATE
  ORDER BY g.expected_delivery_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

