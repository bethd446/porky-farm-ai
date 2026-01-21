const fs = require('fs');
const path = require('path');

// Liste des fichiers à créer comme placeholders
const placeholders = [
  // Branding
  'assets/branding/logo/logo.png',
  'assets/branding/logo/logo-horizontal.png',
  'assets/branding/logo/logo-icon.png',
  'assets/branding/splash/splash.png',
  
  // Backgrounds
  'assets/backgrounds/onboarding/onboarding-bg.png',
  'assets/backgrounds/auth/auth-bg.png',
  'assets/backgrounds/dashboard/dashboard-header.png',
  
  // Navigation icons
  'assets/icons/navigation/home.png',
  'assets/icons/navigation/cheptel.png',
  'assets/icons/navigation/feed.png',
  'assets/icons/navigation/plus.png',
  'assets/icons/navigation/profile.png',
  
  // Action icons
  'assets/icons/actions/add.png',
  'assets/icons/actions/edit.png',
  'assets/icons/actions/delete.png',
  'assets/icons/actions/save.png',
  'assets/icons/actions/search.png',
  'assets/icons/actions/filter.png',
  'assets/icons/actions/share.png',
  'assets/icons/actions/download.png',
  
  // Status icons
  'assets/icons/status/success.png',
  'assets/icons/status/warning.png',
  'assets/icons/status/error.png',
  'assets/icons/status/info.png',
  
  // Category icons
  'assets/icons/categories/truie.png',
  'assets/icons/categories/verrat.png',
  'assets/icons/categories/porcelet.png',
  'assets/icons/categories/engraissement.png',
  
  // Illustrations
  'assets/illustrations/empty-states/empty-cheptel.png',
  'assets/illustrations/empty-states/empty-feed.png',
  'assets/illustrations/empty-states/empty-tasks.png',
  'assets/illustrations/empty-states/empty-health.png',
  'assets/illustrations/empty-states/empty-reproduction.png',
  'assets/illustrations/onboarding/step-1.png',
  'assets/illustrations/onboarding/step-2.png',
  'assets/illustrations/onboarding/step-3.png',
  'assets/illustrations/success-pig.png',
  'assets/illustrations/error-pig.png',
  
  // Animals
  'assets/animals/piglet.png',
  'assets/animals/sow.png',
  'assets/animals/boar.png',
  'assets/animals/generic-pig.png',
  'assets/animals/pig-profile.png',
  
  // Feed
  'assets/feed/ingredients/maize.png',
  'assets/feed/ingredients/soy.png',
  'assets/feed/ingredients/bran.png',
  'assets/feed/ingredients/concentrate.png',
  'assets/feed/ingredients/wheat.png',
  'assets/feed/formulas/formula-placeholder.png',
  
  // Health
  'assets/health/healthy.png',
  'assets/health/sick.png',
  'assets/health/treatment.png',
  'assets/health/vaccination.png',
  
  // Reproduction
  'assets/reproduction/gestation.png',
  'assets/reproduction/mating.png',
  'assets/reproduction/farrowing.png',
  'assets/reproduction/calendar.png',
];

// PNG minimal 1x1 pixel transparent (base64)
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

placeholders.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  const dir = path.dirname(fullPath);
  
  // Créer le dossier si nécessaire
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Créer le fichier s'il n'existe pas
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, minimalPNG);
    console.log('✅ Créé:', filePath);
  } else {
    console.log('⏭️  Existe:', filePath);
  }
});

console.log('\n✅ Placeholders générés!');
