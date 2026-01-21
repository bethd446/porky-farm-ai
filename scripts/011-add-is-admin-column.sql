-- =====================================================
-- Script : Ajout colonne is_admin à profiles
-- =====================================================
-- Ce script ajoute la colonne is_admin pour gérer les autorisations admin
-- et définit openformac@gmail.com comme admin par défaut

-- Ajouter la colonne is_admin si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Créer un index pour améliorer les performances des requêtes admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Mettre à jour openformac@gmail.com comme admin par défaut
UPDATE public.profiles
SET is_admin = true
WHERE email = 'openformac@gmail.com';

-- Vérification : Afficher les admins
SELECT id, email, is_admin, created_at
FROM public.profiles
WHERE is_admin = true
ORDER BY created_at;

