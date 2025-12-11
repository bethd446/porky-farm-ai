-- =====================================================
-- Migration: Ajout de la colonne photo_url dans la table pigs
-- Pour stocker l'URL des photos uploadées vers Supabase Storage
-- =====================================================

-- Ajouter la colonne photo_url si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'pigs'
    AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.pigs
    ADD COLUMN photo_url TEXT;

    RAISE NOTICE '✓ Colonne photo_url ajoutée à la table pigs';
  ELSE
    RAISE NOTICE 'Colonne photo_url existe déjà';
  END IF;
END $$;

-- Ajouter un commentaire pour documentation
COMMENT ON COLUMN public.pigs.photo_url IS 
  'URL de la photo de l''animal stockée dans Supabase Storage (bucket pig-photos)';
