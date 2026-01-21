/**
 * Script pour remplacer toutes les utilisations de shadows par elevation
 * Usage: node scripts/replace-shadows.js
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/(tabs)/reports/index.tsx',
  'app/(tabs)/livestock/add.tsx',
  'app/onboarding/steps/BreedsStep.tsx',
  'app/(tabs)/reproduction/index.tsx',
  'app/(tabs)/health/index.tsx',
  'app/onboarding/index.tsx',
  'components/TodoList.tsx',
  'app/onboarding/step6.tsx',
  'app/onboarding/step1.tsx',
  'app/(tabs)/feeding/index.tsx',
  'app/(tabs)/feeding/add-stock.tsx',
  'app/(tabs)/reproduction/add.tsx',
  'app/(tabs)/health/add.tsx',
  'components/Toast.tsx',
  'components/CostItem.tsx',
  'app/onboarding/step5.tsx',
  'app/onboarding/step4.tsx',
  'app/onboarding/step3.tsx',
  'app/onboarding/step2.tsx',
  'components/ActionsModal.tsx',
  'lib/dashboardStyles.ts',
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer l'import
    content = content.replace(
      /import.*shadows.*from.*designTokens/g,
      (match) => {
        if (match.includes('shadows')) {
          return match.replace(/,?\s*shadows\s*/g, '').replace(/,\s*,/g, ',');
        }
        return match;
      }
    );
    
    // Ajouter l'import elevation si nécessaire
    if (content.includes('shadows.') && !content.includes("from '../../lib/design/elevation'") && !content.includes("from '../lib/design/elevation'")) {
      const importLine = content.match(/import.*from.*designTokens/);
      if (importLine) {
        const depth = file.split('/').length - 2;
        const elevationPath = '../'.repeat(depth) + 'lib/design/elevation';
        content = content.replace(
          /(import.*from.*designTokens[^\n]*)/,
          `$1\nimport { elevation } from '${elevationPath}'`
        );
      }
    }
    
    // Remplacer shadows.xs par elevation.xs, etc.
    content = content.replace(/shadows\.xs/g, 'elevation.xs');
    content = content.replace(/shadows\.sm/g, 'elevation.sm');
    content = content.replace(/shadows\.md/g, 'elevation.md');
    content = content.replace(/shadows\.lg/g, 'elevation.lg');
    content = content.replace(/\.\.\.shadows\./g, '...elevation.');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});

console.log('Done!');

