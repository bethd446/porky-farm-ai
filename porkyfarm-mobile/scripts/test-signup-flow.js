#!/usr/bin/env node
/**
 * Script de test pour le flux d'inscription
 * Simule la création d'un compte et vérifie les appels API
 * 
 * Usage: node scripts/test-signup-flow.js <email> <password>
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans .env.local')
  console.error('   EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY requis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup(email, password) {
  console.log('🧪 TEST D\'INSCRIPTION PORKYFARM\n')
  console.log('=' .repeat(50))
  
  // Étape 1: Inscription
  console.log('\n📝 Étape 1: Inscription...')
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'porkyfarm://auth/callback',
    },
  })

  if (signupError) {
    console.error('❌ Erreur inscription:', signupError.message)
    return { success: false, error: signupError }
  }

  if (!signupData.user) {
    console.error('❌ Aucun utilisateur créé')
    return { success: false, error: new Error('User not created') }
  }

  console.log('✅ Utilisateur créé:', signupData.user.id)
  console.log('   Email:', signupData.user.email)
  console.log('   Email confirmé:', signupData.user.email_confirmed_at ? 'Oui' : 'Non (attente confirmation)')

  // Étape 2: Vérifier le profil
  console.log('\n👤 Étape 2: Vérification du profil...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signupData.user.id)
    .single()

  if (profileError) {
    console.warn('⚠️  Profil non trouvé:', profileError.message)
    console.log('   → Le profil sera peut-être créé par un trigger')
  } else {
    console.log('✅ Profil trouvé:')
    console.log('   ID:', profile.id)
    console.log('   Email:', profile.email)
    console.log('   Nom:', profile.full_name || 'Non défini')
  }

  // Étape 3: Vérifier la ferme
  console.log('\n🏠 Étape 3: Vérification de la ferme...')
  const { data: farms, error: farmsError } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', signupData.user.id)

  if (farmsError) {
    console.warn('⚠️  Erreur lors de la récupération des fermes:', farmsError.message)
  } else if (!farms || farms.length === 0) {
    console.warn('⚠️  Aucune ferme trouvée')
    console.log('   → La ferme sera peut-être créée par un trigger ou lors du premier accès')
  } else {
    console.log('✅ Ferme(s) trouvée(s):', farms.length)
    farms.forEach((farm, index) => {
      console.log(`   Ferme ${index + 1}:`)
      console.log('   - ID:', farm.id)
      console.log('   - Nom:', farm.name)
      console.log('   - Primaire:', farm.is_primary ? 'Oui' : 'Non')
    })
  }

  // Étape 4: Résumé
  console.log('\n📊 RÉSUMÉ')
  console.log('=' .repeat(50))
  console.log('✅ Utilisateur créé:', signupData.user.id)
  console.log(profile ? '✅ Profil créé' : '⚠️  Profil à vérifier')
  console.log(farms && farms.length > 0 ? '✅ Ferme créée' : '⚠️  Ferme à vérifier')
  console.log('\n📧 Action requise:')
  console.log('   1. Vérifier votre email:', email)
  console.log('   2. Cliquer sur le lien de confirmation')
  console.log('   3. Tester la connexion dans l\'app')

  return {
    success: true,
    user: signupData.user,
    profile,
    farms,
  }
}

// Main
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node scripts/test-signup-flow.js <email> <password>')
  console.error('Exemple: node scripts/test-signup-flow.js test@example.com password123')
  process.exit(1)
}

testSignup(email, password)
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Test terminé avec succès')
      process.exit(0)
    } else {
      console.log('\n❌ Test échoué')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })

