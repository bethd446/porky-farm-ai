# PorcPro - Gestion de Ferme Porcine

Application web moderne pour la gestion complète d'une ferme porcine, avec IA pour la formulation d'aliments.

## 🚀 Technologies

- **Vite** - Build tool rapide
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **shadcn/ui** - Composants UI
- **Supabase** - Backend & Base de données
- **React Query** - Gestion d'état serveur
- **Zod** - Validation de schémas

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## ✨ Fonctionnalités

### 🐷 Gestion des Porcs
- Ajout, modification et suppression de porcs
- Suivi du poids avec historique
- Photos et notes
- Filtrage par statut (Actif, Vendu, Décédé, Reproduction)
- Recherche par numéro d'identification

### 📊 Tableau de Bord
- Statistiques en temps réel
- Graphiques d'évolution du poids
- Événements à venir
- Actions rapides

### 🧪 Formulateur IA
- Génération de formules alimentaires optimisées par IA
- Calcul des valeurs nutritionnelles
- Estimation des coûts
- Recommandations personnalisées

### 📅 Calendrier
- Gestion des événements (vaccinations, pesées, etc.)
- Rappels et notifications

### 💰 Finances
- Suivi des revenus et dépenses
- Catégorisation des transactions
- Rapports financiers

## 🎯 Optimisations

### Performance
- ✅ Lazy loading des images
- ✅ React.memo sur composants lourds
- ✅ Code splitting des routes
- ✅ Compression d'images avant upload
- ✅ Optimisation des re-renders avec useMemo/useCallback

### Sécurité
- ✅ Validation Zod côté client
- ✅ Sanitization des données utilisateur
- ✅ Rate limiting
- ✅ Messages d'erreur en français

### Mobile
- ✅ Design responsive
- ✅ Boutons 44px minimum (accessibilité)
- ✅ Bottom sheet pour modals
- ✅ Haptic feedback
- ✅ Pull to refresh

### UX/UI
- ✅ Loading skeletons
- ✅ Animations micro-interactions
- ✅ Feedback visuel après actions
- ✅ Messages d'erreur clairs

## 📁 Structure du Projet

```
PorcPro/
├── src/
│   ├── components/      # Composants React
│   │   ├── features/    # Composants métier
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Composants UI (shadcn)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitaires
│   ├── pages/           # Pages de l'application
│   ├── types/           # Types TypeScript
│   └── integrations/    # Intégrations (Supabase)
├── public/              # Fichiers statiques
└── supabase/            # Configuration Supabase
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## 📝 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm run build:dev` - Build en mode développement
- `npm run preview` - Prévisualise le build
- `npm run lint` - Lance ESLint

## 🚀 Déploiement

L'application peut être déployée sur :
- Vercel
- Netlify
- Cloudflare Pages
- Tout hébergeur supportant les applications Vite

## 📄 Licence

Propriétaire - Tous droits réservés
