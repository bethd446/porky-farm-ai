-- =====================================================
-- Ajout colonne subscription_tier à profiles
-- =====================================================

-- Ajouter la colonne subscription_tier si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Index pour améliorer les performances des requêtes admin
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

