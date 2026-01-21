-- =====================================================
-- Migration : Correction de la finalisation de l'onboarding
-- =====================================================
-- Ce script garantit que la complétion de l'onboarding :
-- 1. Met à jour has_completed_onboarding = true
-- 2. Fixe onboarding_step = 'completed'
-- 3. Fixe onboarding_version = 'v1'
-- 4. Met à jour onboarding_completed_at
-- 5. Insère un événement dans onboarding_events
--
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor

-- =====================================================
-- 1. Créer la table onboarding_events si elle n'existe pas
-- =====================================================

CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- ex: 'started' | 'step_updated' | 'completed'
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_type ON public.onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON public.onboarding_events(created_at);

-- =====================================================
-- 2. Activer RLS sur onboarding_events
-- =====================================================

ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Users can select their onboarding events" ON public.onboarding_events;
DROP POLICY IF EXISTS "Users can insert their onboarding events" ON public.onboarding_events;

-- Créer les policies RLS
CREATE POLICY "Users can select their onboarding events"
  ON public.onboarding_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their onboarding events"
  ON public.onboarding_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. Vérifier que profiles a les colonnes nécessaires
-- =====================================================

-- S'assurer que onboarding_step a une valeur par défaut
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_step'
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.profiles 
    ALTER COLUMN onboarding_step SET DEFAULT 'herd';
  END IF;
END $$;

-- =====================================================
-- 4. Vérifier que la policy UPDATE existe sur profiles
-- =====================================================

-- Supprimer la policy existante si elle existe
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Créer la policy UPDATE pour permettre la mise à jour du profil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 5. Créer/Mettre à jour la fonction RPC complete_onboarding
-- =====================================================

CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_onboarding_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Mettre à jour le profil avec les valeurs fixes
  UPDATE public.profiles
  SET 
    has_completed_onboarding = true,
    onboarding_step = 'completed',
    onboarding_version = 'v1',
    onboarding_data = p_onboarding_data,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Vérifier que la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', v_user_id;
  END IF;

  -- Insérer l'événement dans onboarding_events
  INSERT INTO public.onboarding_events (user_id, event_type, payload)
  VALUES (v_user_id, 'completed', p_onboarding_data);

  -- Retourner un résultat de succès
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'completed_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- =====================================================
-- 6. Grant permissions pour la RPC
-- =====================================================

GRANT EXECUTE ON FUNCTION public.complete_onboarding(JSONB) TO authenticated;

-- =====================================================
-- 7. Vérification : Afficher les colonnes et la fonction
-- =====================================================

-- Vérifier les colonnes de profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('has_completed_onboarding', 'onboarding_step', 'onboarding_version', 'onboarding_data', 'onboarding_completed_at')
ORDER BY column_name;

-- Vérifier que la table onboarding_events existe
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'onboarding_events'
ORDER BY ordinal_position;

-- Vérifier que la fonction existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'complete_onboarding';

