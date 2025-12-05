# Page de Profil - PorcPro

## 🎨 Design moderne inspiré

Inspiré du design [Settings/Profile page for mobile](https://dribbble.com/shots/20039363-Settings-Profile-page-for-mobile) de Nigam.

## ✨ Fonctionnalités

### 1. **Header avec Avatar**
- Avatar grand format (24x24) avec bordure
- Initiales générées automatiquement si pas de photo
- Badge d'abonnement (Premium/Gratuit)
- Gradient background subtil
- Bouton caméra pour upload photo (à venir)

### 2. **Informations personnelles**
- Mode édition avec boutons Edit/Save/Cancel
- Champs modifiables :
  - Nom complet
  - Téléphone
  - Adresse
- Email en lecture seule (ne peut pas être modifié)
- Date d'inscription affichée

### 3. **Paramètres de notifications**
- Switch pour activer/désactiver les notifications
- Options séparées :
  - Notifications générales
  - Notifications email
  - Notifications push
- Séparateurs visuels entre les options

### 4. **Préférences**
- Mode sombre (switch)
- Langue (à venir)
- Autres préférences (à venir)

### 5. **Sécurité**
- Bouton "Changer le mot de passe" (à implémenter)
- Bouton "Authentification à deux facteurs" (à implémenter)
- Design avec icônes Shield

### 6. **Autres options**
- Aide et support
- Conditions d'utilisation
- Liens vers les ressources

### 7. **Déconnexion**
- Bouton déconnexion en rouge
- Carte séparée avec bordure destructive
- Confirmation via haptic feedback

## 🎨 Design

### Cartes
- Ombres portées (shadow-md, shadow-lg)
- Bordures subtiles
- Espacement cohérent
- Animations au hover

### Couleurs
- Gradient primary pour les accents
- Icônes colorées par section
- Badges pour le statut d'abonnement
- États visuels clairs (disabled, hover, active)

### Responsive
- Design optimisé mobile
- Padding adaptatif
- Espacement vertical cohérent
- Scroll fluide

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `src/pages/Profile.tsx` - Page de profil complète

### Fichiers modifiés
- `src/App.tsx` - Ajout de la route `/profile`
- `src/components/layout/Header.tsx` - Lien vers le profil dans le menu
- `src/components/layout/Sidebar.tsx` - Lien vers le profil dans la navigation

## 🔗 Navigation

- **Header** : Menu dropdown → "Mon profil"
- **Sidebar** : Lien "Profil" dans la navigation
- **URL** : `/profile`

## 🚀 Fonctionnalités à venir

- [ ] Upload de photo de profil
- [ ] Changement de mot de passe
- [ ] Authentification à deux facteurs
- [ ] Gestion de l'abonnement
- [ ] Historique des activités
- [ ] Export des données
- [ ] Suppression du compte

## 💡 Notes techniques

- Utilise `useAuth` pour récupérer les données utilisateur
- Synchronisation avec Supabase pour les mises à jour
- Haptic feedback sur les actions importantes
- Toasts pour les retours utilisateur
- Validation des données avant sauvegarde

