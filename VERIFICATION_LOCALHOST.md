# ✅ Vérification Localhost - PorcPro

## 🚀 Serveur de Développement

Le serveur de développement Next.js est lancé en arrière-plan.

### Accès à l'application

**URL** : http://localhost:3000

### Commandes Utiles

```bash
# Lancer le serveur de développement
npm run dev

# Arrêter le serveur
# Appuyez sur Ctrl+C dans le terminal

# Build pour la production
npm run build

# Lancer le serveur de production
npm run start
```

## ✅ Vérifications à Faire

### 1. Page d'Accueil
- [ ] Ouvrir http://localhost:3000
- [ ] Vérifier que la landing page s'affiche
- [ ] Vérifier les images et le design

### 2. Authentification
- [ ] Cliquer sur "Se connecter" ou aller sur http://localhost:3000/auth/login
- [ ] Tester la connexion avec : `openformac@gmail.com` / `Paname12@@`
- [ ] Vérifier la redirection vers le dashboard

### 3. Dashboard
- [ ] Vérifier que le dashboard se charge
- [ ] Vérifier les statistiques
- [ ] Vérifier la météo en temps réel
- [ ] Vérifier les alertes

### 4. Navigation
- [ ] Tester tous les liens du menu
- [ ] Vérifier la sidebar
- [ ] Vérifier la navigation mobile

### 5. Fonctionnalités
- [ ] Assistant IA (nécessite OPENAI_API_KEY)
- [ ] Météo temps réel (géolocalisation)
- [ ] Gestion du cheptel
- [ ] Reproduction
- [ ] Santé
- [ ] Profil

## 🔧 Configuration Requise

### Variables d'Environnement

Créer un fichier `.env.local` à la racine avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://cjzyvcrnwqejlplbkexg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A
OPENAI_API_KEY=sk-votre-cle-openai-ici
```

**Note** : L'application fonctionne sans `OPENAI_API_KEY`, mais l'assistant IA ne fonctionnera pas.

## 📝 Notes

- Le serveur se recharge automatiquement lors des modifications
- Les erreurs s'affichent dans le terminal et dans le navigateur
- Utilisez les DevTools du navigateur pour déboguer

---

**Statut** : Serveur lancé sur http://localhost:3000

