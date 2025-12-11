-- =====================================================
-- Migration: Contrainte d'unicité sur tag_number
-- Ajoute une contrainte UNIQUE sur (user_id, tag_number) dans la table pigs
-- =====================================================

-- Étape 1: Vérifier et nettoyer les doublons éventuels
-- Si des doublons existent, on garde le plus récent (created_at le plus récent)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Compter les doublons
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, tag_number, COUNT(*) as cnt
    FROM public.pigs
    WHERE tag_number IS NOT NULL AND tag_number != ''
    GROUP BY user_id, tag_number
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Des doublons ont été détectés. Nettoyage en cours...';
    
    -- Supprimer les doublons en gardant le plus récent
    DELETE FROM public.pigs
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY user_id, tag_number 
                 ORDER BY created_at DESC
               ) as rn
        FROM public.pigs
        WHERE tag_number IS NOT NULL AND tag_number != ''
      ) ranked
      WHERE rn > 1
    );
    
    RAISE NOTICE 'Doublons supprimés.';
  ELSE
    RAISE NOTICE 'Aucun doublon détecté.';
  END IF;
END $$;

-- Étape 2: Créer un index unique sur (user_id, tag_number)
-- On utilise CREATE UNIQUE INDEX avec NULLS NOT DISTINCT pour gérer les NULL
-- PostgreSQL 15+ supporte NULLS NOT DISTINCT, sinon on utilise une contrainte partielle

-- Pour PostgreSQL 15+
DO $$
BEGIN
  -- Tenter de créer l'index avec NULLS NOT DISTINCT (PostgreSQL 15+)
  BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_tag_number
    ON public.pigs(user_id, tag_number) NULLS NOT DISTINCT
    WHERE tag_number IS NOT NULL AND tag_number != '';
    
    RAISE NOTICE 'Index unique créé avec NULLS NOT DISTINCT (PostgreSQL 15+)';
  EXCEPTION WHEN OTHERS THEN
    -- Fallback pour versions antérieures: contrainte unique partielle
    RAISE NOTICE 'Création de l''index avec méthode alternative...';
    
    -- Supprimer l'index s'il existe déjà
    DROP INDEX IF EXISTS unique_user_tag_number;
    
    -- Créer l'index unique partiel (fonctionne sur toutes les versions)
    CREATE UNIQUE INDEX unique_user_tag_number
    ON public.pigs(user_id, tag_number)
    WHERE tag_number IS NOT NULL AND tag_number != '';
    
    RAISE NOTICE 'Index unique créé avec méthode alternative';
  END;
END $$;

-- Étape 3: Ajouter un commentaire pour documentation
COMMENT ON INDEX unique_user_tag_number IS 
  'Contrainte d''unicité: chaque utilisateur ne peut avoir qu''un seul animal avec un tag_number donné. Les valeurs NULL sont autorisées (plusieurs animaux peuvent ne pas avoir de tag_number).';

-- Vérification finale
DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'unique_user_tag_number'
    AND tablename = 'pigs'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    RAISE NOTICE '✓ Contrainte d''unicité unique_user_tag_number créée avec succès';
  ELSE
    RAISE WARNING '✗ La contrainte n''a pas pu être créée';
  END IF;
END $$;
