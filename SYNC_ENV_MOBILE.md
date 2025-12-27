# 🔄 Synchronisation des variables d'environnement vers Mobile

## Problème

Les variables Supabase du projet web ne sont pas dans un fichier `.env.local` local (probablement configurées dans Vercel).

## Solution

### Option 1 : Créer un fichier .env.local dans le projet web

1. **Créer le fichier `.env.local` à la racine du projet web** :
   ```bash
   cd /Users/desk/Desktop/porky-farm-ai-V1
   cp .env.local.example .env.local
   ```

2. **Éditer `.env.local` avec vos vraies clés Supabase** :
   - Récupérez-les depuis votre dashboard Supabase : Settings > API
   - Ou depuis Vercel Dashboard > Settings > Environment Variables

3. **Synchroniser vers le mobile** :
   ```bash
   bash porkyfarm-mobile/scripts/sync-env-from-web.sh
   ```

### Option 2 : Utiliser le script interactif

Le script vous demandera les valeurs si elles ne sont pas trouvées :

```bash
cd /Users/desk/Desktop/porky-farm-ai-V1
bash porkyfarm-mobile/scripts/sync-env-from-web.sh
```

### Option 3 : Récupérer depuis Vercel (si Vercel CLI installé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Récupérer les variables
cd /Users/desk/Desktop/porky-farm-ai-V1
vercel env pull .env.local

# Synchroniser vers mobile
bash porkyfarm-mobile/scripts/sync-env-from-web.sh
```

## Vérification

Après synchronisation, vérifiez que le fichier mobile est correct :

```bash
cat porkyfarm-mobile/.env.local
```

Vous devriez voir :
```
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Note importante

- Les variables `NEXT_PUBLIC_*` du projet web deviennent `EXPO_PUBLIC_*` dans le mobile
- Seules les clés publiques sont nécessaires (pas les clés secrètes)
- Le fichier `.env.local` ne doit jamais être commité (déjà dans `.gitignore`)

