#!/bin/bash
# Script pour synchroniser les variables Supabase du projet web vers mobile

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB_ENV="$PROJECT_ROOT/.env.local"
WEB_ENV_ALT="$PROJECT_ROOT/.env"
MOBILE_ENV="$PROJECT_ROOT/porkyfarm-mobile/.env.local"

echo "🔍 Recherche des variables Supabase dans le projet web..."

# Chercher dans .env.local
if [ -f "$WEB_ENV" ]; then
    echo "✅ Fichier .env.local trouvé"
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$WEB_ENV" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
    SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$WEB_ENV" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
fi

# Chercher dans .env si .env.local n'existe pas
if ([ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]) && [ -f "$WEB_ENV_ALT" ]; then
    echo "✅ Fichier .env trouvé"
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$WEB_ENV_ALT" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
    SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$WEB_ENV_ALT" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
fi

# Si toujours pas trouvé, essayer Vercel CLI
if ([ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]) && command -v vercel &> /dev/null; then
    echo "🔍 Tentative de récupération depuis Vercel..."
    VERCEL_ENV=$(vercel env pull .env.vercel 2>/dev/null || echo "")
    if [ -f ".env.vercel" ]; then
        SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" ".env.vercel" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
        SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" ".env.vercel" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
        rm -f .env.vercel
    fi
fi

# Si toujours pas trouvé, demander à l'utilisateur
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo ""
    echo "⚠️  Variables Supabase non trouvées dans les fichiers locaux"
    echo ""
    echo "Veuillez fournir vos clés Supabase :"
    echo "(Vous pouvez les trouver dans votre dashboard Supabase > Settings > API)"
    echo ""
    read -p "EXPO_PUBLIC_SUPABASE_URL: " SUPABASE_URL
    read -p "EXPO_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_KEY
    echo ""
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Erreur : Les variables sont vides"
    exit 1
fi

# Créer le fichier mobile
cat > "$MOBILE_ENV" << EOF
# Supabase Configuration (synchronisé depuis le projet web)
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY

# API Backend (Next.js)
EXPO_PUBLIC_API_URL=http://localhost:3000
EOF

echo ""
echo "✅ Fichier $MOBILE_ENV mis à jour avec succès !"
echo ""
echo "Variables configurées :"
echo "  URL: $SUPABASE_URL"
echo "  KEY: ${SUPABASE_KEY:0:20}..."
echo ""

