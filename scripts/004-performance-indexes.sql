-- =====================================================
-- PorkyFarm Performance Indexes
-- Script pour optimiser les requetes par user_id
-- =====================================================

-- Index sur user_id pour gestations (manquant)
CREATE INDEX IF NOT EXISTS idx_gestations_user_id ON public.gestations(user_id);

-- Index sur user_id pour health_records (manquant)
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON public.health_records(user_id);

-- Index sur user_id pour vaccinations (manquant)  
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON public.vaccinations(user_id);

-- Index sur user_id pour feed_stock (manquant)
CREATE INDEX IF NOT EXISTS idx_feed_stock_user_id ON public.feed_stock(user_id);

-- Index sur user_id pour feeding_records (manquant)
CREATE INDEX IF NOT EXISTS idx_feeding_records_user_id ON public.feeding_records(user_id);

-- Index sur user_id pour feeding_schedule (table ajoutee en 003)
CREATE INDEX IF NOT EXISTS idx_feeding_schedule_user_id ON public.feeding_schedule(user_id);

-- Index sur user_id pour transactions (manquant)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Index composite pour requetes frequentes
CREATE INDEX IF NOT EXISTS idx_pigs_user_category ON public.pigs(user_id, category);
CREATE INDEX IF NOT EXISTS idx_gestations_user_status ON public.gestations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_health_records_user_status ON public.health_records(user_id, status);
