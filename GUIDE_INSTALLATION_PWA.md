# 📱 Guide d'Installation PWA - PorcPro

## ✅ Application Prête pour Installation

L'application PorcPro est maintenant configurée comme **Progressive Web App (PWA)** et peut être installée sur iOS et Android.

## 📲 Installation sur iOS (iPhone/iPad)

### Méthode 1 : Safari (Recommandé)

1. **Ouvrir Safari** (pas Chrome ou autres navigateurs)
2. **Aller sur** : `https://votre-app.vercel.app` (votre URL Vercel)
3. **Cliquer sur le bouton Partager** (icône carré avec flèche en bas)
4. **Faire défiler** et sélectionner **"Sur l'écran d'accueil"**
5. **Personnaliser le nom** si nécessaire (par défaut : "PorkyFarm")
6. **Cliquer sur "Ajouter"** en haut à droite
7. ✅ L'application apparaîtra sur l'écran d'accueil comme une app native

### Méthode 2 : QR Code

1. **Générer un QR Code** avec votre URL Vercel
2. **Scanner avec l'appareil photo iOS**
3. **Ouvrir dans Safari**
4. **Suivre les étapes de la Méthode 1**

## 📲 Installation sur Android

### Méthode 1 : Chrome (Recommandé)

1. **Ouvrir Chrome** sur Android
2. **Aller sur** : `https://votre-app.vercel.app`
3. **Un banner "Ajouter à l'écran d'accueil"** apparaîtra automatiquement
4. **Cliquer sur "Ajouter"** ou **"Installer"**
5. ✅ L'application sera installée comme une app native

### Méthode 2 : Menu Chrome

1. **Ouvrir Chrome** et aller sur votre URL
2. **Cliquer sur le menu** (3 points en haut à droite)
3. **Sélectionner "Ajouter à l'écran d'accueil"** ou **"Installer l'application"**
4. ✅ L'application sera installée

### Méthode 3 : QR Code

1. **Générer un QR Code** avec votre URL Vercel
2. **Scanner avec l'appareil photo Android**
3. **Ouvrir dans Chrome**
4. **Suivre les étapes de la Méthode 1**

## 🔗 Partage avec vos Proches

### Option 1 : Lien Direct

Envoyez simplement le lien Vercel :
```
https://votre-app.vercel.app
```

### Option 2 : QR Code

1. **Générer un QR Code** avec votre URL Vercel
2. **Partager l'image** via WhatsApp, SMS, etc.
3. **Ils scannent et installent** directement

### Option 3 : Instructions par SMS/WhatsApp

Envoyez ce message :

```
📱 Installez l'app PorcPro :

1. Ouvrez ce lien : https://votre-app.vercel.app
2. Sur iPhone : Safari → Partager → Sur l'écran d'accueil
3. Sur Android : Chrome → Menu → Ajouter à l'écran d'accueil

C'est gratuit et fonctionne comme une app normale ! 🐷
```

## ✅ Vérification de l'Installation

### iOS
- ✅ L'icône apparaît sur l'écran d'accueil
- ✅ L'app s'ouvre en plein écran (sans barre Safari)
- ✅ Fonctionne hors ligne (données mises en cache)

### Android
- ✅ L'icône apparaît dans le tiroir d'applications
- ✅ L'app s'ouvre en plein écran
- ✅ Peut être lancée depuis le menu des apps

## 🎯 Fonctionnalités PWA

Une fois installée, l'application :
- ✅ **Fonctionne comme une app native**
- ✅ **S'ouvre en plein écran** (pas de barre de navigation)
- ✅ **Fonctionne hors ligne** (données mises en cache)
- ✅ **Notifications push** (si configurées)
- ✅ **Mise à jour automatique** (quand vous déployez une nouvelle version)

## 🔧 Dépannage

### L'icône n'apparaît pas sur iOS
- ✅ Utiliser **Safari** (pas Chrome)
- ✅ Vérifier que l'URL est en **HTTPS**
- ✅ Essayer en **mode navigation privée** puis en mode normal

### Le banner n'apparaît pas sur Android
- ✅ Utiliser **Chrome** (pas Firefox)
- ✅ Vérifier que l'URL est en **HTTPS**
- ✅ Aller dans **Menu → Ajouter à l'écran d'accueil**

### L'app ne fonctionne pas hors ligne
- ✅ Attendre quelques secondes après la première visite
- ✅ Le service worker se charge automatiquement
- ✅ Recharger la page une fois

## 📝 Notes Importantes

- **HTTPS requis** : L'application doit être en HTTPS (automatique sur Vercel)
- **Première visite** : La première visite peut prendre quelques secondes pour charger
- **Mises à jour** : Les mises à jour sont automatiques lors du prochain chargement
- **Données** : Les données sont stockées localement et synchronisées avec Supabase

---

**Date** : $(date)
**Statut** : ✅ PWA prête pour installation

