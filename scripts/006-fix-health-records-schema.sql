-- =====================================================
-- Migration: Correction du schéma health_records
-- Aligne la table avec les types TypeScript utilisés
-- =====================================================

-- Vérifier si la colonne record_type existe, sinon renommer type en record_type
DO $$
BEGIN
  -- Vérifier si record_type existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'health_records'
    AND column_name = 'record_type'
  ) THEN
    -- Si type existe, le renommer en record_type
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'health_records'
      AND column_name = 'type'
    ) THEN
      ALTER TABLE public.health_records RENAME COLUMN type TO record_type;
      RAISE NOTICE 'Colonne type renommée en record_type';
    ELSE
      -- Sinon créer la colonne record_type
      ALTER TABLE public.health_records ADD COLUMN record_type TEXT;
      -- Migrer les données si possible
      UPDATE public.health_records SET record_type = 'maladie' WHERE record_type IS NULL;
      ALTER TABLE public.health_records ALTER COLUMN record_type SET NOT NULL;
      RAISE NOTICE 'Colonne record_type créée';
    END IF;
  END IF;
END $$;

-- Mettre à jour les contraintes CHECK pour record_type
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  ALTER TABLE public.health_records DROP CONSTRAINT IF EXISTS health_records_type_check;
  
  -- Ajouter la nouvelle contrainte pour record_type
  ALTER TABLE public.health_records DROP CONSTRAINT IF EXISTS health_records_record_type_check;
  ALTER TABLE public.health_records ADD CONSTRAINT health_records_record_type_check 
    CHECK (record_type IN ('maladie', 'vaccination', 'traitement', 'observation'));
  
  RAISE NOTICE 'Contraintes CHECK mises à jour pour record_type';
END $$;

-- Mettre à jour les valeurs de status pour correspondre aux types TypeScript
DO $$
BEGIN
  -- Mapper les anciennes valeurs vers les nouvelles
  UPDATE public.health_records 
  SET status = CASE 
    WHEN status = 'ongoing' THEN 'en_cours'
    WHEN status = 'resolved' THEN 'resolu'
    WHEN status = 'chronic' THEN 'chronique'
    WHEN status = 'scheduled' THEN 'en_cours'
    ELSE status
  END
  WHERE status IN ('ongoing', 'resolved', 'chronic', 'scheduled');
  
  -- Supprimer l'ancienne contrainte
  ALTER TABLE public.health_records DROP CONSTRAINT IF EXISTS health_records_status_check;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE public.health_records ADD CONSTRAINT health_records_status_check 
    CHECK (status IN ('en_cours', 'resolu', 'chronique'));
  
  RAISE NOTICE 'Valeurs de status mises à jour';
END $$;

-- Mettre à jour les valeurs de severity pour correspondre aux types TypeScript
DO $$
BEGIN
  -- Mapper les anciennes valeurs vers les nouvelles
  UPDATE public.health_records 
  SET severity = CASE 
    WHEN severity = 'low' THEN 'faible'
    WHEN severity = 'medium' THEN 'modere'
    WHEN severity = 'high' THEN 'grave'
    WHEN severity = 'critical' THEN 'critique'
    ELSE severity
  END
  WHERE severity IN ('low', 'medium', 'high', 'critical');
  
  -- Supprimer l'ancienne contrainte
  ALTER TABLE public.health_records DROP CONSTRAINT IF EXISTS health_records_severity_check;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE public.health_records ADD CONSTRAINT health_records_severity_check 
    CHECK (severity IN ('faible', 'modere', 'grave', 'critique'));
  
  RAISE NOTICE 'Valeurs de severity mises à jour';
END $$;

-- Vérifier si photo_url existe, sinon créer la colonne
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'health_records'
    AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.health_records ADD COLUMN photo_url TEXT;
    RAISE NOTICE 'Colonne photo_url ajoutée';
  END IF;
END $$;
