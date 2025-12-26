-- =====================================================
-- PorkyFarm - Tables Alimentation
-- Script de création des tables feed_stock et feeding_schedule
-- =====================================================

-- Table du planning d'alimentation (nouvelle)
CREATE TABLE IF NOT EXISTS public.feeding_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  time TEXT NOT NULL,
  task TEXT NOT NULL,
  location TEXT,
  quantity TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  schedule_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS sur feeding_schedule
ALTER TABLE public.feeding_schedule ENABLE ROW LEVEL SECURITY;

-- Policies pour feeding_schedule
CREATE POLICY "Users can view own feeding_schedule" ON public.feeding_schedule
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feeding_schedule" ON public.feeding_schedule
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feeding_schedule" ON public.feeding_schedule
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feeding_schedule" ON public.feeding_schedule
  FOR DELETE USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_feed_stock_user_id ON public.feed_stock(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_schedule_user_id ON public.feeding_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_schedule_date ON public.feeding_schedule(schedule_date);

-- Mettre a jour la table feed_stock si necessaire (ajouter colonnes manquantes)
ALTER TABLE public.feed_stock ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.feed_stock ADD COLUMN IF NOT EXISTS current_qty DECIMAL(10,2);
ALTER TABLE public.feed_stock ADD COLUMN IF NOT EXISTS max_qty DECIMAL(10,2);
ALTER TABLE public.feed_stock ADD COLUMN IF NOT EXISTS cost_per_unit DECIMAL(10,2);
ALTER TABLE public.feed_stock ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ;

-- Policies supplementaires pour feed_stock (si pas deja presentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own feed_stock' AND tablename = 'feed_stock') THEN
    CREATE POLICY "Users can insert own feed_stock" ON public.feed_stock
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own feed_stock' AND tablename = 'feed_stock') THEN
    CREATE POLICY "Users can update own feed_stock" ON public.feed_stock
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own feed_stock' AND tablename = 'feed_stock') THEN
    CREATE POLICY "Users can delete own feed_stock" ON public.feed_stock
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;
