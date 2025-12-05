# Guide de Résolution des Problèmes Vercel

## Erreur 404: DEPLOYMENT_NOT_FOUND

### Solutions

#### 1. Vérifier le Build
- Allez dans **Deployments** → Cliquez sur le dernier déploiement
- Vérifiez les **Build Logs**
- Assurez-vous que le build s'est terminé avec succès

#### 2. Vérifier les Variables d'Environnement
- **Settings** → **Environment Variables**
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien définies
- Assurez-vous qu'elles sont activées pour **Production**

#### 3. Vérifier la Configuration
Le fichier `vercel.json` doit contenir :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 4. Redéployer
1. Allez dans **Deployments**
2. Cliquez sur les **⋯** (trois points) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Ou faites un nouveau push sur GitHub

#### 5. Vérifier le Dossier de Build
- Le dossier `dist` doit contenir `index.html`
- Vérifiez que `Output Directory` est bien `dist` dans les settings

### Erreurs Communes

#### Build échoue
- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que Node.js version est compatible (Vercel utilise Node 18+ par défaut)

#### Variables d'environnement non chargées
- Les variables doivent commencer par `VITE_` pour être exposées au client
- Redéployez après avoir ajouté/modifié des variables
- Vérifiez l'orthographe exacte (sensible à la casse)

#### Routing ne fonctionne pas
- Vérifiez que `vercel.json` contient les rewrites
- Assurez-vous que toutes les routes sont gérées par React Router
- Testez avec `/dashboard` directement

### Commandes Utiles

```bash
# Build local pour tester
npm run build

# Vérifier le contenu de dist
ls -la dist/

# Tester le build localement
npm run preview
```

### Support

Si le problème persiste :
1. Vérifiez les logs complets dans Vercel
2. Testez le build localement : `npm run build && npm run preview`
3. Vérifiez la documentation Vercel : https://vercel.com/docs

