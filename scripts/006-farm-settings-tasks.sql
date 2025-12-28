-- =====================================================
-- Tables pour Farm Settings et Tasks (To-Do quotidienne)
-- =====================================================

-- Table des paramètres de ferme (étendue depuis profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Table des tâches quotidiennes
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('health', 'feeding', 'cleaning', 'reproduction', 'admin', 'other')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'event_based', 'one_time')),
  due_date DATE,
  due_time TIME,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  related_animal_id UUID REFERENCES public.pigs(id),
  related_health_case_id UUID REFERENCES public.health_records(id),
  related_gestation_id UUID REFERENCES public.gestations(id),
  metadata JSONB, -- Pour stocker des infos supplémentaires (ex: rappel J+7 après mise-bas)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS sur tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies pour tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(type);

-- Fonction pour créer automatiquement des tâches récurrentes quotidiennes
CREATE OR REPLACE FUNCTION public.create_daily_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Cette fonction sera appelée manuellement depuis l'app après onboarding
  -- ou via un cron job pour créer les tâches quotidiennes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

