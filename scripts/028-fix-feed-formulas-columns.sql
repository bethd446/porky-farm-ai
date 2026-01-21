-- ================================================
-- CORRECTION COLONNES FEED_FORMULAS
-- ================================================
-- Supprime l'ancienne colonne animal_category et rend target_category NOT NULL
-- ================================================

-- 1. Vérifier si animal_category existe et contient des données
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM feed_formulas
  WHERE animal_category IS NOT NULL AND target_category IS NULL;
  
  IF v_count > 0 THEN
    -- Migrer les données de animal_category vers target_category si nécessaire
    UPDATE feed_formulas
    SET target_category = CASE
      WHEN animal_category = 'porcelet' THEN 'starter'
      WHEN animal_category = 'porc_engraissement' THEN 'finisher'
      WHEN animal_category = 'truie' THEN 'sow_gestation'
      WHEN animal_category = 'verrat' THEN 'boar'
      ELSE 'grower' -- Valeur par défaut
    END
    WHERE target_category IS NULL AND animal_category IS NOT NULL;
    
    RAISE NOTICE 'Migré % lignes de animal_category vers target_category', v_count;
  END IF;
END $$;

-- 2. Rendre target_category NOT NULL (après migration)
ALTER TABLE public.feed_formulas
  ALTER COLUMN target_category SET NOT NULL;

-- 3. Supprimer l'ancienne colonne animal_category
ALTER TABLE public.feed_formulas
  DROP COLUMN IF EXISTS animal_category;

-- 4. Vérification
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'feed_formulas'
  AND column_name IN ('animal_category', 'target_category')
ORDER BY ordinal_position;

SELECT 'Colonnes feed_formulas corrigées avec succès!' as status;

