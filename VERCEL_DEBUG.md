# 🔍 Guide de Débogage Vercel

## ✅ Le Build Réussit

D'après les logs, le build est **réussi** :
- ✓ built in 8.51s
- Tous les fichiers sont générés correctement

## ⚠️ Avertissement (Non-bloquant)

L'avertissement sur la taille des chunks n'est **pas une erreur**. C'est juste une recommandation d'optimisation.

## 🔍 Vérifications à Faire

### 1. Vérifier les Variables d'Environnement

Dans Vercel → **Settings** → **Environment Variables**, vous devez avoir :

```
VITE_SUPABASE_URL=https://cjzyvcrnwqejlplbkexg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important** : Le nom doit être exactement `VITE_SUPABASE_PUBLISHABLE_KEY` (pas `ANON_KEY`)

### 2. Vérifier les Logs Runtime

1. Allez sur votre URL : https://porky-farm-ai-v2j2.vercel.app
2. Ouvrez la **Console du navigateur** (F12)
3. Regardez s'il y a des erreurs rouges

### 3. Erreurs Communes

#### Erreur : "VITE_SUPABASE_URL is missing"
- **Cause** : Variable d'environnement non définie
- **Solution** : Ajoutez la variable dans Vercel Settings

#### Erreur : "Failed to fetch" ou erreurs réseau
- **Cause** : Problème de connexion à Supabase
- **Solution** : Vérifiez que l'URL Supabase est correcte

#### Page blanche
- **Cause** : Erreur JavaScript non gérée
- **Solution** : Vérifiez la console du navigateur

### 4. Tester Localement avec les Variables Vercel

Pour tester avec les mêmes variables que Vercel :

```bash
# Créez un fichier .env.production
VITE_SUPABASE_URL=https://cjzyvcrnwqejlplbkexg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_clé_ici

# Build et preview
npm run build
npm run preview
```

## 🛠️ Actions Correctives

### Si l'application ne s'affiche pas :

1. **Vérifiez les variables d'environnement dans Vercel**
2. **Redéployez** après avoir corrigé les variables
3. **Vérifiez la console du navigateur** pour les erreurs
4. **Vérifiez les Function Logs** dans Vercel (si vous utilisez des Edge Functions)

### Si vous voyez une erreur spécifique :

Copiez l'erreur complète de la console et je pourrai vous aider à la résoudre.

## 📊 Optimisation (Optionnel)

L'avertissement sur la taille des chunks peut être résolu en optimisant le build. J'ai déjà ajouté une configuration dans `vite.config.ts` pour améliorer le code splitting.

## 🔗 Liens Utiles

- [Vercel Logs](https://vercel.com/docs/monitoring/logs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Client Setup](https://supabase.com/docs/reference/javascript/initializing)

