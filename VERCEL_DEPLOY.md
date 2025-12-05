# Guide de Déploiement Vercel - PorcPro

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte GitHub connecté à Vercel
- Dépôt GitHub : `bethd446/porky-farm-ai`
- Variables d'environnement Supabase configurées

### Étapes de Déploiement

#### 1. Connexion à Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Autorisez l'accès au dépôt `porky-farm-ai`

#### 2. Import du Projet
1. Cliquez sur **"Add New Project"**
2. Sélectionnez le dépôt `bethd446/porky-farm-ai`
3. Vercel détectera automatiquement Vite comme framework

#### 3. Configuration du Projet
Vercel devrait détecter automatiquement :
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 4. Variables d'Environnement
Dans les paramètres du projet, ajoutez ces variables :

```
VITE_SUPABASE_URL=https://mqojrnmryxiggcomfpfx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

**Important**: 
- Ne jamais commiter les clés dans le code
- Utiliser les variables d'environnement Vercel
- Les variables commençant par `VITE_` sont exposées au client

#### 5. Déploiement
1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances
   - Builder l'application
   - Déployer sur un URL unique

#### 6. Configuration du Domaine (Optionnel)
1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions DNS

### 🔧 Configuration Avancée

Le fichier `vercel.json` est déjà configuré avec :
- Redirections SPA (Single Page Application)
- Variables d'environnement
- Commandes de build

### 📝 Variables d'Environnement Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJhbGc...` |

### 🔄 Déploiements Automatiques

Vercel déploie automatiquement :
- ✅ Chaque push sur `main` → Production
- ✅ Chaque pull request → Preview
- ✅ Chaque commit → Preview

### 🐛 Troubleshooting

#### Build échoue
- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez les variables d'environnement
- Consultez les logs de build dans Vercel

#### Variables d'environnement non chargées
- Vérifiez que les variables commencent par `VITE_`
- Redéployez après avoir ajouté des variables
- Vérifiez l'orthographe exacte

#### Erreurs de routing
- Le fichier `vercel.json` configure déjà les rewrites
- Vérifiez que toutes les routes sont gérées par React Router

### 📊 Monitoring

Vercel fournit :
- Analytics de performance
- Logs en temps réel
- Métriques de build
- Alertes par email

### 🔐 Sécurité

- ✅ Variables d'environnement sécurisées
- ✅ Pas de secrets dans le code
- ✅ HTTPS automatique
- ✅ Headers de sécurité configurés

### 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
- [Variables d'environnement](https://vercel.com/docs/environment-variables)

