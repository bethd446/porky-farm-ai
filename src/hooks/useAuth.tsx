import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, SubscriptionTier } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Récupère le profil utilisateur depuis Supabase
   * @param userId - ID de l'utilisateur
   */
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          ...data,
          subscription_tier: data.subscription_tier as SubscriptionTier,
        });
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state changed:', event, session?.user?.id || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile if user exists
        if (session?.user) {
          console.log('👤 Fetching profile for user:', session.user.id);
          try {
            await fetchProfile(session.user.id);
            console.log('✅ Profile fetched successfully');
          } catch (error) {
            console.error('❌ Error fetching profile after auth change:', error);
          }
        } else {
          console.log('🚪 No user, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
        console.log('✅ Auth loading set to false');
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🔍 Initial session check:', session?.user?.id || 'no session');
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 Fetching initial profile for user:', session.user.id);
        fetchProfile(session.user.id).catch(error => {
          console.error('❌ Error fetching initial profile:', error);
        });
      }
      setLoading(false);
      console.log('✅ Initial loading set to false');
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Connecte un utilisateur avec email et mot de passe
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Objet avec error si échec
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  /**
   * Inscrit un nouvel utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @param fullName - Nom complet
   * @returns Objet avec error si échec
   */
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error: error ? new Error(error.message) : null };
  }, []);

  /**
   * Déconnecte l'utilisateur actuel
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  /**
   * Rafraîchit le profil utilisateur
   */
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
