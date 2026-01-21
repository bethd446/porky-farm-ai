-- ================================================
-- TRIGGERS UPDATED_AT AUTOMATIQUES
-- ================================================
-- Ce script ajoute des triggers pour mettre à jour
-- automatiquement la colonne updated_at
-- ================================================

-- Fonction trigger générique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour farms
DROP TRIGGER IF EXISTS set_farms_updated_at ON farms;
CREATE TRIGGER set_farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour pigs
DROP TRIGGER IF EXISTS set_pigs_updated_at ON pigs;
CREATE TRIGGER set_pigs_updated_at
  BEFORE UPDATE ON pigs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour gestations
DROP TRIGGER IF EXISTS set_gestations_updated_at ON gestations;
CREATE TRIGGER set_gestations_updated_at
  BEFORE UPDATE ON gestations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour health_cases
DROP TRIGGER IF EXISTS set_health_cases_updated_at ON health_cases;
CREATE TRIGGER set_health_cases_updated_at
  BEFORE UPDATE ON health_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour tasks
DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour costs
DROP TRIGGER IF EXISTS set_costs_updated_at ON costs;
CREATE TRIGGER set_costs_updated_at
  BEFORE UPDATE ON costs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour feed_stock
DROP TRIGGER IF EXISTS set_feed_stock_updated_at ON feed_stock;
CREATE TRIGGER set_feed_stock_updated_at
  BEFORE UPDATE ON feed_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname LIKE 'set_%_updated_at'
ORDER BY tgrelid::regclass::text;

SELECT 'Triggers updated_at créés avec succès!' as status;
