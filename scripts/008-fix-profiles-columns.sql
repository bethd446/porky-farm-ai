-- =====================================================
-- Script de correction : Ajout colonnes manquantes à profiles
-- =====================================================
-- Ce script ajoute toutes les colonnes nécessaires pour l'onboarding
-- et les fonctionnalités premium
-- 
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- pour résoudre l'erreur "column does not exist"

-- Colonne has_completed_onboarding (pour onboarding)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false NOT NULL;

-- Colonne onboarding_data (données JSON de l'onboarding)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Colonne subscription_tier (si pas déjà ajoutée par 007)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Mettre à jour les valeurs NULL existantes (si la colonne existait déjà)
UPDATE public.profiles 
SET has_completed_onboarding = false 
WHERE has_completed_onboarding IS NULL;

UPDATE public.profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(has_completed_onboarding);

-- Vérification : Afficher les colonnes créées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('has_completed_onboarding', 'onboarding_data', 'subscription_tier')
ORDER BY column_name;
