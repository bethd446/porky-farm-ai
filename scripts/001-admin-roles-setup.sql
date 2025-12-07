-- =====================================================
-- PORKY FARM - Admin Roles & Permissions Setup
-- =====================================================

-- 1. Add role column to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- 2. Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- Helper Functions for Admin Checks
-- =====================================================

-- Check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Check if current user is super_admin only
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'user'
  );
$$;

-- =====================================================
-- Admin Management Functions (Super Admin Only)
-- =====================================================

-- Promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Only super_admin can promote
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Permission denied: Super admin required';
  END IF;
  
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = target_user_id AND role = 'user';
  
  RETURN FOUND;
END;
$$;

-- Demote admin to user
CREATE OR REPLACE FUNCTION public.demote_to_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Only super_admin can demote
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Permission denied: Super admin required';
  END IF;
  
  -- Cannot demote super_admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Cannot demote super admin';
  END IF;
  
  UPDATE public.profiles
  SET role = 'user'
  WHERE id = target_user_id AND role = 'admin';
  
  RETURN FOUND;
END;
$$;

-- Toggle user active status (admin function)
CREATE OR REPLACE FUNCTION public.toggle_user_status(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  current_status BOOLEAN;
BEGIN
  -- Only admin or super_admin can toggle
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: Admin required';
  END IF;
  
  -- Cannot toggle super_admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Cannot modify super admin status';
  END IF;
  
  SELECT is_active INTO current_status FROM public.profiles WHERE id = target_user_id;
  
  UPDATE public.profiles
  SET is_active = NOT COALESCE(current_status, true)
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Get admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  stats JSON;
BEGIN
  -- Only admin can access stats
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: Admin required';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users', (SELECT COUNT(*) FROM public.profiles WHERE is_active = true OR is_active IS NULL),
    'inactive_users', (SELECT COUNT(*) FROM public.profiles WHERE is_active = false),
    'pro_users', (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'pro'),
    'free_users', (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier IS NULL OR subscription_tier = 'free'),
    'admins', (SELECT COUNT(*) FROM public.profiles WHERE role IN ('admin', 'super_admin')),
    'new_users_today', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- =====================================================
-- RLS Policies for Admin Bypass
-- =====================================================

-- Enable RLS on profiles if not already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- User policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin bypass policies
CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- Set initial super admin (IMPORTANT: Update this!)
-- =====================================================

-- Set openformac@gmail.com as super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'openformac@gmail.com'
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.demote_to_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
