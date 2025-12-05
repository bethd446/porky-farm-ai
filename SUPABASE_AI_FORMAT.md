# Format pour l'Assistant IA Supabase

## Table: profiles

**Colonnes:**
- id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- full_name text
- phone text
- farm_name text
- subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise'))
- formulations_count integer DEFAULT 0
- created_at timestamptz DEFAULT now() NOT NULL
- updated_at timestamptz DEFAULT now() NOT NULL

**Indexes:**
- (id) - Primary key

**RLS:**
- SELECT TO authenticated USING (auth.uid() = id)
- INSERT TO authenticated WITH CHECK (auth.uid() = id)
- UPDATE TO authenticated USING (auth.uid() = id)

**Triggers:**
- update_updated_at_column() BEFORE UPDATE

---

## Table: pigs

**Colonnes:**
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- tag_number text NOT NULL
- birth_date date
- sex text NOT NULL CHECK (sex IN ('male', 'female'))
- breed text
- status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'breeding'))
- weight_history jsonb DEFAULT '[]'::jsonb
- photo_url text
- mother_id uuid REFERENCES public.pigs(id) ON DELETE SET NULL
- father_id uuid REFERENCES public.pigs(id) ON DELETE SET NULL
- notes text
- created_at timestamptz DEFAULT now() NOT NULL
- updated_at timestamptz DEFAULT now() NOT NULL

**Indexes:**
- (user_id) btree
- (status) btree

**RLS:**
- SELECT TO authenticated USING (auth.uid() = user_id)
- INSERT TO authenticated WITH CHECK (auth.uid() = user_id)
- UPDATE TO authenticated USING (auth.uid() = user_id)
- DELETE TO authenticated USING (auth.uid() = user_id)

**Triggers:**
- update_updated_at_column() BEFORE UPDATE

---

## Table: feed_formulations

**Colonnes:**
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- name text NOT NULL
- pig_category text NOT NULL CHECK (pig_category IN ('piglet', 'grower', 'finisher', 'sow', 'boar'))
- ingredients jsonb DEFAULT '[]'::jsonb
- nutritional_values jsonb DEFAULT '{}'::jsonb
- cost_per_kg numeric(10,2)
- notes text
- created_at timestamptz DEFAULT now() NOT NULL

**Indexes:**
- (user_id) btree

**RLS:**
- SELECT TO authenticated USING (auth.uid() = user_id)
- INSERT TO authenticated WITH CHECK (auth.uid() = user_id)
- DELETE TO authenticated USING (auth.uid() = user_id)

---

## Table: events

**Colonnes:**
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- pig_id uuid REFERENCES public.pigs(id) ON DELETE SET NULL
- event_type text NOT NULL CHECK (event_type IN ('vaccination', 'weighing', 'birth', 'sale', 'treatment', 'other'))
- title text NOT NULL
- description text
- cost numeric(10,2)
- event_date date NOT NULL
- created_at timestamptz DEFAULT now() NOT NULL

**Indexes:**
- (user_id) btree
- (event_date) btree

**RLS:**
- SELECT TO authenticated USING (auth.uid() = user_id)
- INSERT TO authenticated WITH CHECK (auth.uid() = user_id)
- UPDATE TO authenticated USING (auth.uid() = user_id)
- DELETE TO authenticated USING (auth.uid() = user_id)

---

## Table: transactions

**Colonnes:**
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- type text NOT NULL CHECK (type IN ('income', 'expense'))
- category text NOT NULL CHECK (category IN ('sale', 'feed', 'veterinary', 'equipment', 'labor', 'other'))
- amount numeric(10,2) NOT NULL
- description text
- transaction_date date NOT NULL
- created_at timestamptz DEFAULT now() NOT NULL

**Indexes:**
- (user_id) btree
- (transaction_date) btree

**RLS:**
- SELECT TO authenticated USING (auth.uid() = user_id)
- INSERT TO authenticated WITH CHECK (auth.uid() = user_id)
- UPDATE TO authenticated USING (auth.uid() = user_id)
- DELETE TO authenticated USING (auth.uid() = user_id)

---

## Fonctions et Triggers supplémentaires

### Fonction: handle_new_user()
**Type:** TRIGGER FUNCTION
**Langage:** plpgsql
**Sécurité:** SECURITY DEFINER SET search_path = public
**Description:** Crée automatiquement un profil dans public.profiles lorsqu'un nouvel utilisateur s'inscrit dans auth.users
**Déclencheur:** AFTER INSERT ON auth.users
**Code:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Fonction: update_updated_at_column()
**Type:** TRIGGER FUNCTION
**Langage:** plpgsql
**Sécurité:** SET search_path = public
**Description:** Met à jour automatiquement le champ updated_at
**Code:**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pigs_updated_at
  BEFORE UPDATE ON public.pigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

