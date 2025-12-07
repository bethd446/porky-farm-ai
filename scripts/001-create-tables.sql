-- =====================================================
-- PorkyFarm Database Schema
-- Script de création des tables pour Supabase
-- =====================================================

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  farm_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des animaux (porcs)
CREATE TABLE IF NOT EXISTS public.pigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  identifier TEXT NOT NULL,
  name TEXT,
  category TEXT NOT NULL CHECK (category IN ('sow', 'boar', 'piglet', 'fattening')),
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sick', 'pregnant', 'nursing', 'sold', 'deceased')),
  origin TEXT,
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  building TEXT,
  pen TEXT,
  mother_id UUID REFERENCES public.pigs(id),
  father_id UUID REFERENCES public.pigs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements de santé
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pig_id UUID REFERENCES public.pigs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('disease', 'treatment', 'vaccination', 'checkup', 'injury')),
  title TEXT NOT NULL,
  description TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  dosage TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  veterinarian TEXT,
  cost DECIMAL(10,2),
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'resolved', 'chronic', 'scheduled')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des vaccinations
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pig_id UUID REFERENCES public.pigs(id) ON DELETE CASCADE NOT NULL,
  vaccine_name TEXT NOT NULL,
  batch_number TEXT,
  administration_date DATE NOT NULL,
  next_due_date DATE,
  administered_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des gestations
CREATE TABLE IF NOT EXISTS public.gestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sow_id UUID REFERENCES public.pigs(id) ON DELETE CASCADE NOT NULL,
  boar_id UUID REFERENCES public.pigs(id),
  mating_date DATE NOT NULL,
  expected_farrowing_date DATE,
  actual_farrowing_date DATE,
  piglets_born_alive INTEGER,
  piglets_stillborn INTEGER,
  piglets_weaned INTEGER,
  weaning_date DATE,
  status TEXT DEFAULT 'pregnant' CHECK (status IN ('pregnant', 'farrowed', 'weaning', 'completed', 'aborted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des enregistrements d'alimentation
CREATE TABLE IF NOT EXISTS public.feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pig_id UUID REFERENCES public.pigs(id) ON DELETE CASCADE,
  category TEXT,
  feed_type TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  feeding_date DATE NOT NULL,
  feeding_time TEXT,
  cost_per_kg DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table du stock d'aliments
CREATE TABLE IF NOT EXISTS public.feed_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feed_type TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  supplier TEXT,
  purchase_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des transactions financières
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  pig_id UUID REFERENCES public.pigs(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer Row Level Security sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pour pigs
CREATE POLICY "Users can view own pigs" ON public.pigs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pigs" ON public.pigs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pigs" ON public.pigs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pigs" ON public.pigs
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour health_records
CREATE POLICY "Users can view own health_records" ON public.health_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health_records" ON public.health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health_records" ON public.health_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health_records" ON public.health_records
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour vaccinations
CREATE POLICY "Users can view own vaccinations" ON public.vaccinations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vaccinations" ON public.vaccinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vaccinations" ON public.vaccinations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vaccinations" ON public.vaccinations
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour gestations
CREATE POLICY "Users can view own gestations" ON public.gestations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gestations" ON public.gestations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gestations" ON public.gestations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gestations" ON public.gestations
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour feeding_records
CREATE POLICY "Users can view own feeding_records" ON public.feeding_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feeding_records" ON public.feeding_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour feed_stock
CREATE POLICY "Users can view own feed_stock" ON public.feed_stock
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own feed_stock" ON public.feed_stock
  FOR ALL USING (auth.uid() = user_id);

-- Policies pour transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pigs_user_id ON public.pigs(user_id);
CREATE INDEX IF NOT EXISTS idx_pigs_category ON public.pigs(category);
CREATE INDEX IF NOT EXISTS idx_pigs_status ON public.pigs(status);
CREATE INDEX IF NOT EXISTS idx_health_records_pig_id ON public.health_records(pig_id);
CREATE INDEX IF NOT EXISTS idx_gestations_sow_id ON public.gestations(sow_id);
CREATE INDEX IF NOT EXISTS idx_gestations_status ON public.gestations(status);
