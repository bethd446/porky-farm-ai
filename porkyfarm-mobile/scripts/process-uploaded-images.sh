#!/bin/bash
# Script pour traiter les images uploadées
# Usage: ./scripts/process-uploaded-images.sh

echo "🎨 Traitement des images uploadées pour PorkyFarm"
echo "=================================================="
echo ""

# Vérifier que sharp est installé
if ! node -e "require('sharp')" 2>/dev/null; then
  echo "📦 Installation de sharp..."
  npm install sharp --save-dev
fi

# Créer un dossier temporaire pour les images uploadées
UPLOAD_DIR="assets/_uploads"
mkdir -p "$UPLOAD_DIR"

echo "📁 Placez vos images dans: $UPLOAD_DIR"
echo ""
echo "Ensuite, utilisez le script resize-assets.js:"
echo ""
echo "Exemples:"
echo "  node scripts/resize-assets.js $UPLOAD_DIR/piglet.jpg animal assets/animals/piglet.png"
echo "  node scripts/resize-assets.js $UPLOAD_DIR/sow.jpg animal assets/animals/sow.png"
echo "  node scripts/resize-assets.js $UPLOAD_DIR/barn.jpg background-portrait assets/backgrounds/dashboard/dashboard-header.png"
echo ""

