#!/usr/bin/env node

/**
 * Script de vérification Supabase
 * Exécute: node check-supabase.js
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
          env[key.trim()] = valueParts.join('=').trim();
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
  console.error('❌ Variables d\'environnement manquantes dans .env');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   VITE_SUPABASE_PUBLISHABLE_KEY:', SUPABASE_KEY ? '✅' : '❌');
  process.exit(1);
}

console.log('🔍 Vérification de la configuration Supabase...\n');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 API Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fonction pour vérifier les tables
async function checkTables() {
  console.log('📋 Vérification des tables...\n');
  
  const tables = ['profiles', 'pigs', 'feed_formulations', 'events', 'transactions'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          results[table] = { exists: false, error: 'Table n\'existe pas' };
        } else {
          results[table] = { exists: true, error: error.message };
        }
      } else {
        results[table] = { exists: true, count: data ? 0 : 0 };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  // Afficher les résultats
  let allExist = true;
  for (const [table, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`✅ ${table.padEnd(25)} - Existe`);
    } else {
      console.log(`❌ ${table.padEnd(25)} - ${result.error}`);
      allExist = false;
    }
  }
  
  console.log('');
  return { allExist, results };
}

// Fonction pour vérifier l'authentification
async function checkAuth() {
  console.log('🔐 Vérification de l\'authentification...\n');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️  Erreur lors de la vérification de session:', error.message);
    } else {
      console.log('✅ Service d\'authentification accessible');
      if (session) {
        console.log('   Session active pour:', session.user.email);
      } else {
        console.log('   Aucune session active (normal si non connecté)');
      }
    }
    console.log('');
    return true;
  } catch (err) {
    console.log('❌ Erreur de connexion:', err.message);
    console.log('');
    return false;
  }
}

// Fonction pour tester une requête simple
async function testConnection() {
  console.log('🌐 Test de connexion...\n');
  
  try {
    // Test simple de connexion
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Connexion OK mais table "profiles" n\'existe pas encore');
        console.log('   L\'assistant IA est peut-être en train de créer les tables...\n');
        return false;
      } else {
        console.log('❌ Erreur de connexion:', error.message);
        console.log('');
        return false;
      }
    } else {
      console.log('✅ Connexion réussie à Supabase');
      console.log('');
      return true;
    }
  } catch (err) {
    console.log('❌ Erreur:', err.message);
    console.log('');
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   VÉRIFICATION SUPABASE - PorcPro');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Test de connexion
  const connected = await testConnection();
  
  if (!connected) {
    console.log('💡 Conseil: Vérifiez que l\'assistant IA a terminé la création des tables');
    console.log('   ou exécutez les migrations manuellement.\n');
    process.exit(1);
  }
  
  // Vérifier l'authentification
  await checkAuth();
  
  // Vérifier les tables
  const { allExist } = await checkTables();
  
  // Résumé
  console.log('═══════════════════════════════════════════════════════');
  if (allExist) {
    console.log('✅ TOUTES LES TABLES SONT CRÉÉES');
    console.log('🎉 Configuration Supabase complète !');
  } else {
    console.log('⚠️  CERTAINES TABLES MANQUENT');
    console.log('💡 L\'assistant IA est peut-être encore en train de créer les tables');
    console.log('   Attendez quelques instants et réexécutez ce script.');
  }
  console.log('═══════════════════════════════════════════════════════\n');
}

// Exécuter
main().catch(console.error);

