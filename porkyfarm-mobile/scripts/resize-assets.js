#!/usr/bin/env node
/**
 * Script de redimensionnement automatique des assets
 * Usage: node scripts/resize-assets.js <image-source> <type> <destination>
 * 
 * Types disponibles:
 * - logo: 1024x1024
 * - logo-horizontal: 512x128
 * - logo-icon: 256x256
 * - splash: 1284x2778
 * - background-portrait: 1080x1920
 * - background-header: 1080x400
 * - icon: 256x256
 * - illustration: 800x600
 * - animal: 512x512
 * - feed-ingredient: 256x256
 */

const fs = require('fs');
const path = require('path');

// Dimensions par type
const DIMENSIONS = {
  'logo': { width: 1024, height: 1024 },
  'logo-horizontal': { width: 512, height: 128 },
  'logo-icon': { width: 256, height: 256 },
  'splash': { width: 1284, height: 2778 },
  'background-portrait': { width: 1080, height: 1920 },
  'background-header': { width: 1080, height: 400 },
  'icon': { width: 256, height: 256 },
  'illustration': { width: 800, height: 600 },
  'animal': { width: 512, height: 512 },
  'feed-ingredient': { width: 256, height: 256 },
  'health': { width: 512, height: 512 },
  'reproduction': { width: 512, height: 512 },
};

function printUsage() {
  console.log(`
Usage: node scripts/resize-assets.js <source-image> <type> <destination>

Types disponibles:
  logo              - 1024x1024 (logo principal)
  logo-horizontal   - 512x128 (logo horizontal)
  logo-icon         - 256x256 (icône)
  splash            - 1284x2778 (splash screen)
  background-portrait - 1080x1920 (fond portrait)
  background-header - 1080x400 (en-tête)
  icon              - 256x256 (icônes)
  illustration      - 800x600 (illustrations)
  animal            - 512x512 (images animaux)
  feed-ingredient   - 256x256 (ingrédients)
  health            - 512x512 (santé)
  reproduction      - 512x512 (reproduction)

Exemples:
  node scripts/resize-assets.js image.jpg logo assets/branding/logo/logo.png
  node scripts/resize-assets.js piglet.jpg animal assets/animals/piglet.png
  node scripts/resize-assets.js empty.jpg illustration assets/illustrations/empty-states/empty-cheptel.png
`);
}

async function resizeImage(sourcePath, type, destPath) {
  try {
    // Vérifier que sharp est installé
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.error('❌ Erreur: sharp n\'est pas installé.');
      console.log('📦 Installation: npm install sharp');
      process.exit(1);
    }

    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Fichier source introuvable: ${sourcePath}`);
      process.exit(1);
    }

    const dims = DIMENSIONS[type];
    if (!dims) {
      console.error(`❌ Type inconnu: ${type}`);
      printUsage();
      process.exit(1);
    }

    // Créer le dossier de destination si nécessaire
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`📁 Dossier créé: ${destDir}`);
    }

    // Redimensionner l'image
    console.log(`🔄 Redimensionnement: ${sourcePath}`);
    console.log(`   Dimensions: ${dims.width}x${dims.height}`);
    
    await sharp(sourcePath)
      .resize(dims.width, dims.height, {
        fit: 'cover', // ou 'contain' pour garder les proportions
        position: 'center'
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(destPath);

    // Obtenir les infos du fichier
    const stats = fs.statSync(destPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ Image créée: ${destPath}`);
    console.log(`   Taille: ${sizeKB} KB`);
    console.log(`   Dimensions: ${dims.width}x${dims.height}px`);
    
  } catch (error) {
    console.error('❌ Erreur lors du redimensionnement:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length < 3) {
  printUsage();
  process.exit(1);
}

const [sourcePath, type, destPath] = args;

resizeImage(sourcePath, type, destPath)
  .then(() => {
    console.log('\n✅ Redimensionnement terminé!');
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

