-- ================================================
-- VÉRIFICATION ET CRÉATION DES TRIGGERS UTILISATEUR
-- Exécuter dans Supabase SQL Editor
-- ================================================

-- ================================================
-- PARTIE 1: TRIGGER POUR CRÉER LE PROFIL
-- ================================================

-- Fonction pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Trigger handle_new_user créé' as status;

-- ================================================
-- PARTIE 2: TRIGGER POUR CRÉER LA FERME (Optionnel)
-- ================================================

-- Fonction pour créer automatiquement une ferme après création du profil
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer une ferme par défaut pour le nouvel utilisateur
  INSERT INTO public.farms (user_id, name, is_primary)
  VALUES (
    NEW.id,
    COALESCE(NEW.full_name || ' - Élevage', 'Ma ferme'),
    true
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Créer le trigger
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

SELECT '✅ Trigger handle_new_profile créé' as status;

-- ================================================
-- VÉRIFICATION
-- ================================================

-- Vérifier que les triggers existent
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth' AND trigger_name = 'on_auth_user_created'
   OR trigger_schema = 'public' AND trigger_name = 'on_profile_created'
ORDER BY trigger_schema, trigger_name;

-- Vérifier que les fonctions existent
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('handle_new_user', 'handle_new_profile')
ORDER BY routine_name;

SELECT '✅ Vérification terminée' as status;

