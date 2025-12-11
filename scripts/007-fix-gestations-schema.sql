-- =====================================================
-- Migration: Correction du schéma gestations
-- Aligne la table avec les types TypeScript utilisés
-- =====================================================

-- Vérifier si mating_date existe, sinon créer/renommer
DO $$
BEGIN
  -- Si breeding_date existe et mating_date n'existe pas, renommer
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'gestations'
    AND column_name = 'breeding_date'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'gestations'
    AND column_name = 'mating_date'
  ) THEN
    ALTER TABLE public.gestations RENAME COLUMN breeding_date TO mating_date;
    RAISE NOTICE 'Colonne breeding_date renommée en mating_date';
  END IF;
END $$;

-- Mettre à jour les valeurs de status pour correspondre aux types TypeScript
DO $$
BEGIN
  -- Mapper les anciennes valeurs vers les nouvelles
  UPDATE public.gestations 
  SET status = CASE 
    WHEN status = 'pregnant' THEN 'en_cours'
    WHEN status = 'farrowed' THEN 'terminee'
    WHEN status = 'aborted' THEN 'avortee'
    WHEN status = 'weaning' THEN 'terminee'
    WHEN status = 'completed' THEN 'terminee'
    ELSE status
  END
  WHERE status IN ('pregnant', 'farrowed', 'aborted', 'weaning', 'completed');
  
  -- Supprimer l'ancienne contrainte
  ALTER TABLE public.gestations DROP CONSTRAINT IF EXISTS gestations_status_check;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE public.gestations ADD CONSTRAINT gestations_status_check 
    CHECK (status IN ('en_cours', 'terminee', 'avortee'));
  
  RAISE NOTICE 'Valeurs de status mises à jour pour gestations';
END $$;

-- Vérifier et ajuster les colonnes pour piglets
DO $$
BEGIN
  -- Si piglets_born existe, le renommer en piglets_born
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'gestations'
    AND column_name = 'piglets_born_alive'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'gestations'
    AND column_name = 'piglets_born'
  ) THEN
    ALTER TABLE public.gestations RENAME COLUMN piglets_born_alive TO piglets_born;
    RAISE NOTICE 'Colonne piglets_born_alive renommée en piglets_born';
  END IF;
  
  -- Si piglets_alive existe, vérifier qu'elle correspond
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'gestations'
    AND column_name = 'piglets_alive'
  ) THEN
    -- Créer la colonne si elle n'existe pas
    ALTER TABLE public.gestations ADD COLUMN piglets_alive INTEGER;
    -- Copier les données depuis piglets_born si possible
    UPDATE public.gestations 
    SET piglets_alive = piglets_born 
    WHERE piglets_alive IS NULL AND piglets_born IS NOT NULL;
    RAISE NOTICE 'Colonne piglets_alive créée';
  END IF;
  
  -- Vérifier expected_farrowing_date vs expectedDueDate
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'gestations'
    AND column_name = 'expected_farrowing_date'
  ) THEN
    -- Créer la colonne si elle n'existe pas
    ALTER TABLE public.gestations ADD COLUMN expected_farrowing_date DATE;
    RAISE NOTICE 'Colonne expected_farrowing_date créée';
  END IF;
END $$;
