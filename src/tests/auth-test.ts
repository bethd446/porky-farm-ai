/**
 * Test d'authentification complet
 * Exécuté automatiquement en mode développement
 */

import { supabase } from '@/integrations/supabase/client';

export async function testAuthentication(): Promise<boolean> {
  console.log('🔐 Test d\'authentification...');

  try {
    // Test 1: Connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'openformac@gmail.com',
      password: 'Paname12@@',
    });

    if (authError) {
      console.error('❌ Erreur auth:', authError.message);
      return false;
    }

    if (!authData.user) {
      console.error('❌ Aucun utilisateur retourné');
      return false;
    }

    console.log('✅ Authentification réussie:', authData.user.email);

    // Test 2: Récupération profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('⚠️  Profil non trouvé (sera créé automatiquement)');
      } else {
        console.error('❌ Erreur profil:', profileError.message);
        return false;
      }
    } else {
      console.log('✅ Profil récupéré:', profile?.full_name || 'Non défini');
    }

    // Test 3: Récupération porcs
    const { data: pigs, error: pigsError } = await supabase
      .from('pigs')
      .select('*')
      .eq('user_id', authData.user.id);

    if (pigsError) {
      console.error('❌ Erreur porcs:', pigsError.message);
      return false;
    }

    console.log('✅ Porcs récupérés:', pigs?.length || 0);

    // Déconnexion après test
    await supabase.auth.signOut();

    return true;
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    return false;
  }
}

// Exécute au chargement de l'app en dev
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_AUTH_TEST === 'true') {
  // Ne pas exécuter automatiquement pour éviter les problèmes
  // Peut être appelé manuellement depuis la console
  console.log('💡 Pour tester l\'authentification, exécutez: testAuthentication()');
  (window as Window & { testAuthentication?: typeof testAuthentication }).testAuthentication = testAuthentication;
}

