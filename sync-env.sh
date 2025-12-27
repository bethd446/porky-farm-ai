#!/bin/bash
# Script pour synchroniser les variables Supabase du projet web vers mobile

WEB_ENV=".env.local"
MOBILE_ENV="porkyfarm-mobile/.env.local"

# Chercher les variables dans le projet web
if [ -f "$WEB_ENV" ]; then
    echo "✅ Fichier .env.local trouvé dans le projet web"
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" "$WEB_ENV" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    SUPABASE_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$WEB_ENV" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
elif [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé dans le projet web"
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" ".env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    SUPABASE_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" ".env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
else
    echo "⚠️  Aucun fichier .env trouvé dans le projet web"
    echo "Les variables doivent être configurées manuellement"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "⚠️  Variables Supabase non trouvées dans les fichiers .env"
    exit 1
fi

# Mettre à jour le fichier mobile
cat > "$MOBILE_ENV" << EOF
# Supabase Configuration (synchronisé depuis le projet web)
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY

# API Backend (Next.js)
EXPO_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✅ Fichier $MOBILE_ENV mis à jour avec succès"
echo "URL: $SUPABASE_URL"
echo "KEY: ${SUPABASE_KEY:0:20}..."
