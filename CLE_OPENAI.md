# 🔐 Clé OpenAI - Configuration

## ⚠️ IMPORTANT - Sécurité

La clé OpenAI doit être stockée dans `.env.local` (qui est dans `.gitignore`).

## 📝 Configuration

### Pour le développement local

1. **Créer ou modifier le fichier `.env.local`** à la racine du projet :

```env
OPENAI_API_KEY=sk-votre-cle-openai-ici
```

2. **Redémarrer le serveur de développement** :
   - Arrêter le serveur (Ctrl+C dans le terminal)
   - Relancer avec `npm run dev`

### Où obtenir une clé API OpenAI

1. Aller sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Se connecter ou créer un compte
3. Cliquer sur "Create new secret key"
4. Copier la clé (elle commence par `sk-`)
5. L'ajouter dans `.env.local`

### Pour Vercel (déploiement)

Dans le dashboard Vercel :

1. Aller dans **Settings → Environment Variables**
2. Ajouter une nouvelle variable :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : Votre clé API OpenAI
3. Sélectionner tous les environnements (Production, Preview, Development)
4. Redéployer l'application

## ✅ Vérification

Après configuration :

1. Vérifier que `.env.local` contient `OPENAI_API_KEY=sk-...`
2. Redémarrer le serveur de développement
3. Tester l'assistant IA dans l'application

## 🔧 Dépannage

### Erreur "Clé API OpenAI invalide"

1. **Vérifier que la clé est dans `.env.local`** :

   ```bash
   cat .env.local | grep OPENAI_API_KEY
   ```

2. **Vérifier le format** : La clé doit commencer par `sk-`

3. **Redémarrer le serveur** : Les variables d'environnement ne sont chargées qu'au démarrage

4. **Vérifier que la clé est active** sur [platform.openai.com](https://platform.openai.com/api-keys)

### L'assistant IA ne répond pas

- Vérifier les logs du serveur dans le terminal
- Vérifier que le compte OpenAI a des crédits disponibles
- Vérifier que le modèle GPT-4 est accessible avec votre compte

---

**Note** : Le fichier `.env.local` ne doit PAS être commité sur GitHub. Il est déjà dans `.gitignore`.
