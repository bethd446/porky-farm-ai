-- =====================================================
-- Table de suivi de l'utilisation IA
-- Pour quotas et monitoring des coûts
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 4) DEFAULT 0,
  has_image BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON public.ai_usage(date DESC);

-- Fonction pour incrémenter le compteur
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_cost_estimate DECIMAL DEFAULT 0.001,
  p_has_image BOOLEAN DEFAULT false
) RETURNS void AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, date, request_count, cost_estimate, has_image)
  VALUES (p_user_id, CURRENT_DATE, 1, p_cost_estimate, p_has_image)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    request_count = ai_usage.request_count + 1,
    cost_estimate = ai_usage.cost_estimate + p_cost_estimate,
    has_image = p_has_image OR ai_usage.has_image,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier le quota quotidien
CREATE OR REPLACE FUNCTION check_ai_quota(
  p_user_id UUID,
  p_daily_limit INTEGER DEFAULT 50
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(request_count, 0) INTO v_count
  FROM public.ai_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN v_count < p_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir uniquement leur propre usage
CREATE POLICY "Users can view own ai_usage" ON public.ai_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent pas insérer directement (via fonction uniquement)
-- Les admins peuvent voir tous les usages
CREATE POLICY "Admins can view all ai_usage" ON public.ai_usage
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

