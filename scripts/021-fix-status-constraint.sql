-- ================================================
-- CORRECTION CONTRAINTE STATUS PIGS
-- ================================================
-- L'app utilise 'actif' (FR) mais la contrainte avait 'active' (EN)
-- Ce script corrige la contrainte et met à jour les données
-- ================================================

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE public.pigs DROP CONSTRAINT IF EXISTS pigs_status_check;

-- 2. Mettre à jour les status 'active' vers 'actif'
UPDATE public.pigs SET status = 'actif' WHERE status = 'active';

-- 3. Recréer la contrainte avec les valeurs FR
ALTER TABLE public.pigs ADD CONSTRAINT pigs_status_check
CHECK (status IN ('actif', 'vendu', 'mort', 'reforme'));

-- 4. Vérification
SELECT name, status FROM pigs ORDER BY name;
