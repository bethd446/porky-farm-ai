#!/usr/bin/env node

/**
 * Script de test d'authentification Supabase
 * Teste la connexion et l'inscription avec le compte test
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error('❌ Erreur lors du chargement du fichier .env:', error.message);
    process.exit(1);
  }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Compte test
const TEST_EMAIL = 'openformac@gmail.com';
const TEST_PASSWORD = 'Paname12@@';

async function testAuth() {
  console.log('🧪 Test d\'authentification Supabase\n');
  console.log('='.repeat(50));
  console.log(`📧 Email test: ${TEST_EMAIL}`);
  console.log('='.repeat(50) + '\n');

  // Test 1 : Connexion
  console.log('1️⃣  Test de connexion...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      console.error(`   ❌ Erreur de connexion: ${error.message}`);
      console.error(`   Code: ${error.status}`);
      
      if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
        console.log('\n💡 Solution:');
        console.log('   - Vérifiez que le compte existe');
        console.log('   - Vérifiez que l\'email est correct');
        console.log('   - Vérifiez que le mot de passe est correct');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\n💡 Solution:');
        console.log('   - Vérifiez votre boîte email pour confirmer le compte');
      }
      return false;
    }

    if (data.session) {
      console.log('   ✅ Connexion réussie !');
      console.log(`   👤 User ID: ${data.user.id}`);
      console.log(`   📧 Email: ${data.user.email}`);
      console.log(`   🔑 Session active: ${data.session.access_token.substring(0, 20)}...`);
    } else {
      console.log('   ⚠️  Connexion réussie mais aucune session');
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return false;
  }

  // Test 2 : Vérifier le profil
  console.log('\n2️⃣  Vérification du profil...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('   ⚠️  Aucune session active');
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('   ⚠️  Profil non trouvé (sera créé automatiquement)');
      } else {
        console.error(`   ❌ Erreur: ${profileError.message}`);
        return false;
      }
    } else {
      console.log('   ✅ Profil trouvé');
      console.log(`   📝 Nom: ${profile.full_name || 'Non défini'}`);
      console.log(`   🎯 Tier: ${profile.subscription_tier || 'free'}`);
    }
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return false;
  }

  // Test 3 : Vérifier l'accès aux données
  console.log('\n3️⃣  Test d\'accès aux données...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('   ⚠️  Aucune session active');
      return false;
    }

    const { data: pigs, error: pigsError } = await supabase
      .from('pigs')
      .select('*')
      .eq('user_id', session.user.id)
      .limit(5);

    if (pigsError) {
      console.error(`   ❌ Erreur RLS: ${pigsError.message}`);
      console.log('\n💡 Solution:');
      console.log('   - Vérifiez que les politiques RLS sont correctement configurées');
      return false;
    }

    console.log(`   ✅ Accès aux données autorisé`);
    console.log(`   🐷 Porcs trouvés: ${pigs?.length || 0}`);
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return false;
  }

  // Test 4 : Déconnexion
  console.log('\n4️⃣  Test de déconnexion...');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      return false;
    }
    console.log('   ✅ Déconnexion réussie');
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return false;
  }

  return true;
}

// Exécuter les tests
testAuth()
  .then((success) => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('✅ Tous les tests d\'authentification sont passés !');
      console.log('\n🚀 L\'authentification fonctionne correctement.');
    } else {
      console.log('❌ Certains tests ont échoué.');
      console.log('\n💡 Vérifiez :');
      console.log('   - Les identifiants du compte test');
      console.log('   - La configuration Supabase Auth');
      console.log('   - Les politiques RLS');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale :', error);
    process.exit(1);
  });

