-- =============================================
-- FIX URGENT - CRÉER LES FERMES MANQUANTES
-- Exécuter dans Supabase SQL Editor
-- =============================================

-- 1. Voir quels utilisateurs n'ont PAS de ferme
SELECT
  au.id as user_id,
  au.email,
  p.full_name,
  f.id as farm_id
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN farms f ON f.user_id = au.id
WHERE f.id IS NULL;

-- 2. Créer une ferme pour chaque utilisateur qui n'en a pas
INSERT INTO farms (user_id, name, created_at, updated_at)
SELECT
  au.id,
  COALESCE(
    p.full_name || ' - Élevage',
    'Ma ferme'
  ),
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE NOT EXISTS (
  SELECT 1 FROM farms f WHERE f.user_id = au.id
);

-- 3. Vérifier que tous les utilisateurs ont maintenant une ferme
SELECT
  au.email,
  f.id as farm_id,
  f.name as farm_name,
  f.created_at
FROM auth.users au
JOIN farms f ON f.user_id = au.id
ORDER BY f.created_at DESC;

-- 4. Compter pour vérification
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM farms) as total_farms,
  (SELECT COUNT(*) FROM auth.users au WHERE NOT EXISTS (SELECT 1 FROM farms f WHERE f.user_id = au.id)) as users_without_farm;

-- 5. Message de succès
DO $$
DECLARE
  v_without_farm INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_without_farm
  FROM auth.users au
  WHERE NOT EXISTS (SELECT 1 FROM farms f WHERE f.user_id = au.id);

  IF v_without_farm = 0 THEN
    RAISE NOTICE '✅ Tous les utilisateurs ont maintenant une ferme!';
  ELSE
    RAISE NOTICE '⚠️ Il reste % utilisateurs sans ferme', v_without_farm;
  END IF;
END $$;
