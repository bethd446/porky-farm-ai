#!/bin/bash
# =============================================
# 🧹 SCRIPT DE NETTOYAGE PORKYFARM
# Exécuter à la racine du projet
# =============================================

echo "🧹 Nettoyage PorkyFarm..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================
# 1. SUPPRIMER LES FICHIERS DE CACHE
# =============================================
echo -e "${YELLOW}📦 Suppression des fichiers de cache...${NC}"

# Cache Expo et Metro
rm -rf .expo 2>/dev/null && echo "  ✓ .expo supprimé"
rm -rf dist 2>/dev/null && echo "  ✓ dist supprimé"
rm -rf .metro 2>/dev/null && echo "  ✓ .metro supprimé"

# Cache Node
rm -rf node_modules/.cache 2>/dev/null && echo "  ✓ node_modules/.cache supprimé"

# Cache TypeScript
rm -rf tsconfig.tsbuildinfo 2>/dev/null && echo "  ✓ tsconfig.tsbuildinfo supprimé"
rm -rf .tsbuildinfo 2>/dev/null && echo "  ✓ .tsbuildinfo supprimé"

# =============================================
# 2. SUPPRIMER LES FICHIERS TEMPORAIRES
# =============================================
echo ""
echo -e "${YELLOW}🗑️ Suppression des fichiers temporaires...${NC}"

# Fichiers système
find . -name ".DS_Store" -type f -delete 2>/dev/null && echo "  ✓ .DS_Store supprimés"
find . -name "Thumbs.db" -type f -delete 2>/dev/null && echo "  ✓ Thumbs.db supprimés"
find . -name "*.log" -type f -not -path "./node_modules/*" -delete 2>/dev/null && echo "  ✓ Fichiers .log supprimés"

# =============================================
# 3. IDENTIFIER LES FICHIERS EN DOUBLE
# =============================================
echo ""
echo -e "${YELLOW}🔍 Recherche de fichiers potentiellement en double...${NC}"

# Chercher les fichiers avec des noms similaires
echo ""
echo "  Fichiers avec 'old', 'backup', 'copy' dans le nom:"
find . -type f \( -iname "*old*" -o -iname "*backup*" -o -iname "*copy*" -o -iname "*.bak" \) -not -path "./node_modules/*" 2>/dev/null | while read file; do
  echo -e "    ${RED}⚠️ $file${NC}"
done

echo ""
echo "  Fichiers avec numéros de version (1), (2):"
find . -type f \( -name "*\ \(1\)*" -o -name "*\ \(2\)*" -o -name "* 2.*" \) -not -path "./node_modules/*" 2>/dev/null | while read file; do
  echo -e "    ${RED}⚠️ $file${NC}"
done

# =============================================
# 4. IDENTIFIER LES DOSSIERS DUPLIQUÉS POTENTIELS
# =============================================
echo ""
echo -e "${YELLOW}📂 Vérification de la structure des dossiers...${NC}"

# Vérifier les dossiers app
if [ -d "app" ]; then
  echo "  ✓ Dossier app/ existe"
  
  # Lister les sous-dossiers
  echo "    Sous-dossiers dans app/:"
  ls -la app/ 2>/dev/null | grep "^d" | awk '{print "      " $NF}'
fi

# Vérifier s'il y a des dossiers src en plus de app
if [ -d "src" ]; then
  echo -e "  ${YELLOW}⚠️ Dossier src/ existe - potentiel doublon avec app/${NC}"
fi

# Vérifier les dossiers services
if [ -d "services" ] && [ -d "app/services" ]; then
  echo -e "  ${RED}⚠️ Deux dossiers services trouvés: services/ et app/services/${NC}"
fi

# Vérifier les dossiers components
if [ -d "components" ] && [ -d "app/components" ]; then
  echo -e "  ${RED}⚠️ Deux dossiers components trouvés: components/ et app/components/${NC}"
fi

# =============================================
# 5. VÉRIFIER LES FICHIERS DE CONFIGURATION
# =============================================
echo ""
echo -e "${YELLOW}⚙️ Vérification des fichiers de configuration...${NC}"

# Package managers
if [ -f "package-lock.json" ] && [ -f "yarn.lock" ]; then
  echo -e "  ${YELLOW}⚠️ Deux fichiers de lock trouvés (npm + yarn)${NC}"
  echo "    Recommandation: supprimer celui du package manager non utilisé"
fi

if [ -f "pnpm-lock.yaml" ]; then
  echo "  ℹ️ pnpm-lock.yaml trouvé (pnpm utilisé)"
fi

# Fichiers env
echo ""
echo "  Fichiers d'environnement:"
ls -la .env* 2>/dev/null | awk '{print "    " $NF}'

# =============================================
# 6. TAILLE DU PROJET
# =============================================
echo ""
echo -e "${YELLOW}📊 Taille du projet...${NC}"

# Taille totale (sans node_modules)
echo "  Taille sans node_modules:"
du -sh --exclude='node_modules' . 2>/dev/null || du -sh . 2>/dev/null

# Taille node_modules
if [ -d "node_modules" ]; then
  echo "  Taille node_modules:"
  du -sh node_modules 2>/dev/null
fi

# =============================================
# 7. COMMANDES DE NETTOYAGE SUGGÉRÉES
# =============================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}💡 COMMANDES DE NETTOYAGE RECOMMANDÉES:${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "# Nettoyage complet et redémarrage:"
echo "rm -rf node_modules .expo dist"
echo "npm install"
echo "npx expo start -c"
echo ""
echo "# Si tu utilises yarn:"
echo "rm -rf node_modules .expo dist"
echo "yarn install"
echo "yarn expo start -c"
echo ""

# =============================================
# FIN
# =============================================
echo -e "${GREEN}✅ Analyse terminée!${NC}"

