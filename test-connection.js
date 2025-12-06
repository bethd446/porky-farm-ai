/**
 * Script de test de connexion Supabase
 * Vérifie que la connexion fonctionne correctement
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
try {
  const envFile = readFileSync(join(__dirname, '.env'), 'utf-8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
  
  process.env = { ...process.env, ...envVars };
} catch (error) {
  console.log('⚠️  Fichier .env non trouvé, utilisation des variables système');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Test de connexion Supabase\n');
console.log('=' .repeat(50));

// Vérifier les variables d'environnement
if (!supabaseUrl) {
  console.error('❌ ERREUR : VITE_SUPABASE_URL non défini');
  console.log('\n💡 Solution :');
  console.log('   1. Créez un fichier .env à la racine du projet');
  console.log('   2. Ajoutez : VITE_SUPABASE_URL=https://votre-projet.supabase.co');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ ERREUR : VITE_SUPABASE_PUBLISHABLE_KEY non défini');
  console.log('\n💡 Solution :');
  console.log('   1. Dans votre fichier .env, ajoutez :');
  console.log('   2. VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-publique');
  process.exit(1);
}

console.log('✅ Variables d\'environnement trouvées');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Tests de connexion
async function testConnection() {
  console.log('🧪 Tests de connexion...\n');

  // Test 1 : Connexion de base
  console.log('1️⃣  Test de connexion de base...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table vide, pas une erreur
      console.error(`   ❌ Erreur : ${error.message}`);
      console.error(`   Code : ${error.code}`);
      return false;
    }
    console.log('   ✅ Connexion réussie');
  } catch (error) {
    console.error(`   ❌ Erreur de connexion : ${error.message}`);
    return false;
  }

  // Test 2 : Vérifier les tables
  console.log('\n2️⃣  Vérification des tables...');
  const tables = ['profiles', 'pigs', 'transactions', 'events', 'feed_formulations'];
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.error(`   ❌ Table "${table}" : ${error.message}`);
        return false;
      }
      console.log(`   ✅ Table "${table}" accessible`);
    } catch (error) {
      console.error(`   ❌ Table "${table}" : ${error.message}`);
      return false;
    }
  }

  // Test 3 : Test d'authentification
  console.log('\n3️⃣  Test d\'authentification...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error(`   ❌ Erreur auth : ${error.message}`);
      return false;
    }
    console.log('   ✅ Service d\'authentification accessible');
    if (data.session) {
      console.log(`   ℹ️  Session active trouvée (user: ${data.session.user.email})`);
    } else {
      console.log('   ℹ️  Aucune session active (normal si non connecté)');
    }
  } catch (error) {
    console.error(`   ❌ Erreur : ${error.message}`);
    return false;
  }

  // Test 4 : Vérifier RLS
  console.log('\n4️⃣  Vérification RLS (Row Level Security)...');
  try {
    // Test avec une requête qui devrait être bloquée sans auth
    const { data, error } = await supabase.from('pigs').select('*').limit(1);
    if (error && error.code === '42501') {
      console.log('   ✅ RLS activé (accès refusé sans authentification)');
    } else if (error) {
      console.log(`   ⚠️  RLS : ${error.message}`);
    } else {
      console.log('   ⚠️  RLS : Accès possible sans auth (vérifiez vos politiques)');
    }
  } catch (error) {
    console.error(`   ❌ Erreur : ${error.message}`);
  }

  return true;
}

// Exécuter les tests
testConnection()
  .then((success) => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('✅ Tous les tests de connexion sont passés !');
      console.log('\n🚀 L\'application est prête à être lancée.');
    } else {
      console.log('❌ Certains tests ont échoué.');
      console.log('\n💡 Vérifiez :');
      console.log('   - Vos variables d\'environnement (.env)');
      console.log('   - Votre URL Supabase');
      console.log('   - Vos clés API Supabase');
      console.log('   - Vos tables et politiques RLS');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale :', error);
    process.exit(1);
  });

