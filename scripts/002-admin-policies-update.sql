-- =====================================================
-- Script de mise à jour des policies RLS pour admin bypass
-- À exécuter dans la console SQL de Supabase
-- =====================================================

-- Vérifier si la table profiles existe et a la colonne role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- Admin bypass policy pour profiles (lecture)
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()));

-- Admin bypass policy pour profiles (écriture)
DROP POLICY IF EXISTS "admin_write_all_profiles" ON public.profiles;
CREATE POLICY "admin_write_all_profiles" ON public.profiles
    FOR ALL TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

-- Si vous avez une table pigs, ajoutez ces policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pigs') THEN
        EXECUTE 'DROP POLICY IF EXISTS "admin_read_all_pigs" ON public.pigs';
        EXECUTE 'CREATE POLICY "admin_read_all_pigs" ON public.pigs FOR SELECT TO authenticated USING ((SELECT public.is_admin()))';
        
        EXECUTE 'DROP POLICY IF EXISTS "admin_write_all_pigs" ON public.pigs';
        EXECUTE 'CREATE POLICY "admin_write_all_pigs" ON public.pigs FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))';
    END IF;
END $$;

-- Si vous avez une table health_records
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_records') THEN
        EXECUTE 'DROP POLICY IF EXISTS "admin_read_all_health_records" ON public.health_records';
        EXECUTE 'CREATE POLICY "admin_read_all_health_records" ON public.health_records FOR SELECT TO authenticated USING ((SELECT public.is_admin()))';
    END IF;
END $$;

-- Si vous avez une table gestations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gestations') THEN
        EXECUTE 'DROP POLICY IF EXISTS "admin_read_all_gestations" ON public.gestations';
        EXECUTE 'CREATE POLICY "admin_read_all_gestations" ON public.gestations FOR SELECT TO authenticated USING ((SELECT public.is_admin()))';
    END IF;
END $$;

-- Fonction utilitaire pour obtenir les stats admin améliorée
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    result JSON;
    today_start TIMESTAMP;
    week_start TIMESTAMP;
BEGIN
    -- Vérifier les droits admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Accès refusé: droits admin requis';
    END IF;

    today_start := date_trunc('day', NOW());
    week_start := date_trunc('day', NOW() - INTERVAL '7 days');

    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'active_users', (SELECT COUNT(*) FROM profiles WHERE is_active = true OR is_active IS NULL),
        'inactive_users', (SELECT COUNT(*) FROM profiles WHERE is_active = false),
        'pro_users', (SELECT COUNT(*) FROM profiles WHERE subscription_tier = 'pro'),
        'free_users', (SELECT COUNT(*) FROM profiles WHERE subscription_tier != 'pro' OR subscription_tier IS NULL),
        'admins', (SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'super_admin')),
        'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= today_start),
        'new_users_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= week_start),
        'total_pigs', COALESCE((SELECT COUNT(*) FROM pigs), 0),
        'open_tickets', 0
    ) INTO result;

    RETURN result;
EXCEPTION
    WHEN undefined_table THEN
        -- Si certaines tables n'existent pas encore
        SELECT json_build_object(
            'total_users', (SELECT COUNT(*) FROM profiles),
            'active_users', (SELECT COUNT(*) FROM profiles WHERE is_active = true OR is_active IS NULL),
            'inactive_users', (SELECT COUNT(*) FROM profiles WHERE is_active = false),
            'pro_users', (SELECT COUNT(*) FROM profiles WHERE subscription_tier = 'pro'),
            'free_users', (SELECT COUNT(*) FROM profiles WHERE subscription_tier != 'pro' OR subscription_tier IS NULL),
            'admins', (SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'super_admin')),
            'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= today_start),
            'new_users_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= week_start),
            'total_pigs', 0,
            'open_tickets', 0
        ) INTO result;
        RETURN result;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Policies admin bypass configurées avec succès!';
END $$;
