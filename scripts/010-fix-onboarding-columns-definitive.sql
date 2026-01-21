-- =====================================================
-- Migration DÉFINITIVE : Colonnes onboarding dans profiles
-- =====================================================
-- Ce script garantit que toutes les colonnes nécessaires existent
-- et crée automatiquement un profil si l'utilisateur n'en a pas
-- 
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- Ce script est idempotent (peut être exécuté plusieurs fois sans erreur)

-- =====================================================
-- 1. Ajouter toutes les colonnes onboarding (si elles n'existent pas)
-- =====================================================

-- Colonne has_completed_onboarding (booléen pour indiquer si l'onboarding est terminé)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'has_completed_onboarding'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;
    
    COMMENT ON COLUMN public.profiles.has_completed_onboarding IS 
    'Indique si l''utilisateur a terminé le processus d''onboarding. false par défaut.';
  END IF;
END $$;

-- Colonne onboarding_step (étape actuelle de l'onboarding)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_step'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN onboarding_step TEXT;
    
    COMMENT ON COLUMN public.profiles.onboarding_step IS 
    'Étape actuelle de l''onboarding (ex: step1, step2, step6).';
  END IF;
END $$;

-- Colonne onboarding_version (version du flux d'onboarding)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_version'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN onboarding_version TEXT;
    
    COMMENT ON COLUMN public.profiles.onboarding_version IS 
    'Version du flux d''onboarding utilisé (ex: v1.0).';
  END IF;
END $$;

-- Colonne onboarding_data (données JSON de l'onboarding)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_data'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN onboarding_data JSONB;
    
    COMMENT ON COLUMN public.profiles.onboarding_data IS 
    'Données JSON collectées pendant l''onboarding (nombre de porcs, races, etc.).';
  END IF;
END $$;

-- Colonne onboarding_completed_at (timestamp de complétion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 
    'Date et heure de complétion de l''onboarding. NULL si non complété.';
  END IF;
END $$;

-- Colonne subscription_tier (si pas déjà ajoutée)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN subscription_tier TEXT DEFAULT 'free' 
    CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
    
    COMMENT ON COLUMN public.profiles.subscription_tier IS 
    'Niveau d''abonnement de l''utilisateur (free, pro, enterprise).';
  END IF;
END $$;

-- =====================================================
-- 2. Mettre à jour les valeurs NULL existantes
-- =====================================================

UPDATE public.profiles 
SET has_completed_onboarding = false 
WHERE has_completed_onboarding IS NULL;

UPDATE public.profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;

-- =====================================================
-- 3. Créer les index pour améliorer les performances
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON public.profiles(has_completed_onboarding);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON public.profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step 
ON public.profiles(onboarding_step) 
WHERE onboarding_step IS NOT NULL;

-- =====================================================
-- 4. Fonction pour garantir qu'un profil existe
-- =====================================================

CREATE OR REPLACE FUNCTION public.ensure_profile_exists(p_user_id UUID)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile public.profiles;
  v_user_email TEXT;
BEGIN
  -- Vérifier si le profil existe
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id;

  -- Si le profil n'existe pas, le créer
  IF v_profile IS NULL THEN
    -- Récupérer l'email depuis auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = p_user_id;

    -- Créer le profil avec les valeurs par défaut
    INSERT INTO public.profiles (
      id,
      email,
      has_completed_onboarding,
      subscription_tier,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      COALESCE(v_user_email, ''),
      false,
      'free',
      NOW(),
      NOW()
    )
    RETURNING * INTO v_profile;
  END IF;

  RETURN v_profile;
END;
$$;

-- Grant permission pour la fonction
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(UUID) TO authenticated;

-- =====================================================
-- 5. Améliorer le trigger de création automatique de profil
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    has_completed_onboarding,
    subscription_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    false,
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger si nécessaire
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. Vérification finale : Afficher les colonnes créées
-- =====================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN (
    'has_completed_onboarding',
    'onboarding_step',
    'onboarding_version',
    'onboarding_data',
    'onboarding_completed_at',
    'subscription_tier'
  )
ORDER BY column_name;

-- =====================================================
-- 7. Vérifier que tous les profils existants ont les valeurs par défaut
-- =====================================================

SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN has_completed_onboarding IS NULL THEN 1 END) as null_onboarding,
  COUNT(CASE WHEN subscription_tier IS NULL THEN 1 END) as null_tier
FROM public.profiles;

