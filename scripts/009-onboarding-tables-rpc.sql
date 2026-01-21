-- =====================================================
-- Tables et RPC pour le système d'onboarding
-- =====================================================

-- 1. Colonnes dans profiles (si pas déjà ajoutées)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_step TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_version TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 2. Table user_activity (pour tracking des activités)
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);

-- 3. Table app_health_logs (pour logs de santé)
CREATE TABLE IF NOT EXISTS public.app_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  event TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_app_health_logs_user_id ON public.app_health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_health_logs_severity ON public.app_health_logs(severity);
CREATE INDEX IF NOT EXISTS idx_app_health_logs_event ON public.app_health_logs(event);
CREATE INDEX IF NOT EXISTS idx_app_health_logs_created_at ON public.app_health_logs(created_at);

-- 4. RLS pour user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. RLS pour app_health_logs
ALTER TABLE public.app_health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health logs" ON public.app_health_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own health logs" ON public.app_health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 6. RPC complete_onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_step TEXT,
  p_version TEXT,
  p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Mettre à jour le profil
  UPDATE public.profiles
  SET 
    has_completed_onboarding = true,
    onboarding_step = p_step,
    onboarding_version = p_version,
    onboarding_data = p_data,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Vérifier que la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', v_user_id;
  END IF;

  -- Retourner un résultat de succès
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'completed_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- 7. Grant permissions pour la RPC
GRANT EXECUTE ON FUNCTION public.complete_onboarding(TEXT, TEXT, JSONB) TO authenticated;

-- 8. Vérification : Afficher les colonnes créées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('has_completed_onboarding', 'onboarding_step', 'onboarding_version', 'onboarding_data', 'onboarding_completed_at')
ORDER BY column_name;

