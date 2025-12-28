# 📱 Checklist Publication Stores - PorkyFarm Mobile

**Date** : 2025-01-27  
**Objectif** : Checklist complète pour publier l'app sur App Store (iOS) et Google Play (Android)

---

## 🍎 iOS - App Store

### Prérequis

- [ ] Compte Apple Developer actif ($99/an)
- [ ] Xcode installé (dernière version)
- [ ] Certificats de développement et distribution configurés
- [ ] App ID créé dans Apple Developer Portal
- [ ] Provisioning Profiles configurés

### Configuration App

- [ ] **App Icon** : 1024x1024px (PNG, sans transparence)
  - Fichier : `porkyfarm-mobile/assets/icon.png`
  - Vérifier qu'il est bien référencé dans `app.json`

- [ ] **Splash Screen** : Configuré dans `app.json`
  - Fichier : `porkyfarm-mobile/assets/splash-icon.png`

- [ ] **Bundle Identifier** : `com.porkyfarm.app` (ou votre domaine)
  - Vérifier dans `app.json` → `ios.bundleIdentifier`

- [ ] **Version** : `1.0.0` (ou version actuelle)
  - Vérifier dans `app.json` → `version`

- [ ] **Build Number** : Incrémenter à chaque soumission
  - Vérifier dans `app.json` → `ios.buildNumber`

### Textes et Métadonnées

- [ ] **Nom de l'app** : "PorkyFarm" (max 30 caractères)
- [ ] **Sous-titre** : "Gestion d'élevage porcin" (max 30 caractères)
- [ ] **Description** : Texte complet (max 4000 caractères)
  ```
  PorkyFarm est une application complète de gestion d'élevage porcin 
  conçue pour les éleveurs ivoiriens. Suivez votre cheptel, gérez la 
  santé de vos animaux, planifiez les gestations et optimisez 
  l'alimentation avec l'aide de l'intelligence artificielle.
  ```

- [ ] **Mots-clés** : "élevage, porc, gestion, ferme, agriculture" (max 100 caractères, séparés par virgules)
- [ ] **URL de support** : `https://porkyfarm.app/support`
- [ ] **URL de confidentialité** : `https://porkyfarm.app/privacy`
- [ ] **Catégorie** : "Productivité" ou "Entreprise"

### Captures d'écran

- [ ] **iPhone 6.7" (iPhone 14 Pro Max)** : 1290x2796px
  - Minimum 3 captures (Dashboard, Cheptel, Santé)
  - Maximum 10 captures

- [ ] **iPhone 6.5" (iPhone 11 Pro Max)** : 1242x2688px
  - Minimum 3 captures

- [ ] **iPad Pro 12.9"** : 2048x2732px (optionnel mais recommandé)
  - Minimum 3 captures

### Textes de Permissions

- [ ] **Caméra** :
  ```
  PorkyFarm a besoin d'accéder à votre caméra pour prendre des photos 
  de vos animaux et documenter les cas de santé. Ces photos sont 
  stockées de manière sécurisée et ne sont partagées avec personne.
  ```

- [ ] **Photos** :
  ```
  PorkyFarm a besoin d'accéder à vos photos pour sélectionner des images 
  de vos animaux depuis votre galerie. Ces photos sont stockées de 
  manière sécurisée.
  ```

- [ ] **Notifications** :
  ```
  PorkyFarm envoie des notifications pour vous rappeler les gestations, 
  vaccinations et alertes importantes de votre élevage.
  ```

### Tests sur Appareil Réel

- [ ] Tester sur **iPhone réel** (pas seulement simulateur)
- [ ] Vérifier toutes les fonctionnalités :
  - [ ] Authentification (login, register)
  - [ ] Dashboard (chargement, stats)
  - [ ] Cheptel (liste, ajout, modification)
  - [ ] Santé (création cas, photo)
  - [ ] Reproduction (création gestation)
  - [ ] Alimentation (stock, calcul)
  - [ ] Assistant IA (chat, réponse)
  - [ ] Profil (affichage, logout)

- [ ] Tester avec **réseau instable** (mode avion, 3G faible)
- [ ] Tester les **permissions** (refus caméra, photos, notifications)
- [ ] Vérifier qu'**aucun crash** ne se produit

### Build EAS

```bash
# Build pour App Store
cd porkyfarm-mobile
eas build --platform ios --profile production
```

- [ ] Build réussi sans erreurs
- [ ] Télécharger le fichier `.ipa`
- [ ] Tester le build sur TestFlight avant soumission

### Soumission App Store Connect

- [ ] Créer l'app dans App Store Connect
- [ ] Remplir toutes les métadonnées
- [ ] Uploader les captures d'écran
- [ ] Uploader le build via Transporter ou Xcode
- [ ] Soumettre pour review

### Guidelines Apple

- [ ] Respecter les **Human Interface Guidelines**
- [ ] Navigation claire et intuitive
- [ ] Textes lisibles (taille minimale 11pt)
- [ ] Zones tapables suffisamment grandes (min 44x44pt)
- [ ] Gestion des erreurs claire
- [ ] Pas de contenu offensant ou illégal

---

## 🤖 Android - Google Play

### Prérequis

- [ ] Compte Google Play Developer actif ($25 unique)
- [ ] Android Studio installé
- [ ] Keystore de signature créé (pour production)
- [ ] Package name : `com.porkyfarm.app` (ou votre domaine)

### Configuration App

- [ ] **App Icon** : 512x512px (PNG, sans transparence)
  - Fichier : `porkyfarm-mobile/assets/icon.png`

- [ ] **Splash Screen** : Configuré dans `app.json`

- [ ] **Package Name** : `com.porkyfarm.app`
  - Vérifier dans `app.json` → `android.package`

- [ ] **Version Code** : `1` (incrémenter à chaque build)
  - Vérifier dans `app.json` → `android.versionCode`

- [ ] **Version Name** : `1.0.0`
  - Vérifier dans `app.json` → `version`

### Textes et Métadonnées

- [ ] **Titre** : "PorkyFarm" (max 50 caractères)
- [ ] **Description courte** : 80 caractères max
  ```
  Gestion complète de votre élevage porcin avec IA
  ```

- [ ] **Description complète** : 4000 caractères max
  ```
  PorkyFarm est une application complète de gestion d'élevage porcin 
  conçue pour les éleveurs ivoiriens. Suivez votre cheptel, gérez la 
  santé de vos animaux, planifiez les gestations et optimisez 
  l'alimentation avec l'aide de l'intelligence artificielle.
  ```

- [ ] **Mots-clés** : "élevage, porc, gestion, ferme, agriculture"
- [ ] **URL de support** : `https://porkyfarm.app/support`
- [ ] **URL de confidentialité** : `https://porkyfarm.app/privacy`
- [ ] **Catégorie** : "Productivité" ou "Entreprise"

### Captures d'écran

- [ ] **Téléphone** : 1080x1920px minimum
  - Minimum 2 captures
  - Maximum 8 captures

- [ ] **Tablette 7"** : 1200x1920px (optionnel)
  - Minimum 2 captures

- [ ] **Tablette 10"** : 1600x2560px (optionnel)
  - Minimum 2 captures

### Permissions Runtime

- [ ] **CAMERA** : Demander avec `requestCameraPermission()`
- [ ] **READ_MEDIA_IMAGES** : Demander avec `requestMediaLibraryPermission()`
- [ ] **POST_NOTIFICATIONS** : Demander avec `requestNotificationPermission()`

### Textes de Permissions (Android 13+)

- [ ] **Caméra** :
  ```
  Prendre des photos de vos animaux et cas de santé
  ```

- [ ] **Photos** :
  ```
  Sélectionner des photos depuis votre galerie
  ```

- [ ] **Notifications** :
  ```
  Rappels de gestations, vaccinations et alertes
  ```

### Tests sur Appareil Réel

- [ ] Tester sur **Android réel** (pas seulement émulateur)
- [ ] Tester sur **plusieurs versions Android** (minimum Android 8.0)
- [ ] Vérifier toutes les fonctionnalités (même liste que iOS)
- [ ] Tester avec **réseau instable**
- [ ] Tester les **permissions runtime** (refus, acceptation)
- [ ] Vérifier qu'**aucun crash** ne se produit

### Build EAS

```bash
# Build pour Google Play
cd porkyfarm-mobile
eas build --platform android --profile production
```

- [ ] Build réussi sans erreurs
- [ ] Télécharger le fichier `.aab` (Android App Bundle)
- [ ] Tester le build sur appareil réel avant soumission

### Soumission Google Play Console

- [ ] Créer l'app dans Google Play Console
- [ ] Remplir toutes les métadonnées
- [ ] Uploader les captures d'écran
- [ ] Uploader le fichier `.aab`
- [ ] Remplir le questionnaire de contenu
- [ ] Soumettre pour review

### Guidelines Google

- [ ] Respecter les **Material Design Guidelines**
- [ ] Navigation claire (Bottom Navigation pour tabs)
- [ ] Textes lisibles (taille minimale 14sp)
- [ ] Zones tapables suffisamment grandes (min 48x48dp)
- [ ] Gestion des erreurs claire
- [ ] Pas de contenu offensant ou illégal
- [ ] Respecter les **Permissions Best Practices**

---

## 🔒 Sécurité & Confidentialité

### Politique de Confidentialité

- [ ] **Page web** : `https://porkyfarm.app/privacy`
- [ ] Contenu doit inclure :
  - Types de données collectées
  - Utilisation des données
  - Partage avec tiers (Supabase, OpenAI, etc.)
  - Droits des utilisateurs (accès, suppression)
  - Contact pour questions

### Données Collectées

- [ ] Documenter toutes les données collectées :
  - Informations de compte (email, nom)
  - Données d'élevage (animaux, santé, reproduction)
  - Photos (stockées dans Supabase Storage)
  - Usage IA (pour quotas)
  - Analytics (PostHog, anonymisé)

### Conformité

- [ ] **RGPD** : Si utilisateurs européens
- [ ] **CCPA** : Si utilisateurs californiens
- [ ] **COPPA** : Si utilisateurs < 13 ans (non applicable pour PorkyFarm)

---

## ✅ Checklist Finale Avant Soumission

### Fonctionnalités

- [ ] Toutes les fonctionnalités MVP fonctionnent
- [ ] Aucun crash en conditions normales
- [ ] Gestion d'erreurs robuste
- [ ] Mode offline partiel fonctionne
- [ ] Synchronisation automatique fonctionne

### Performance

- [ ] Temps de chargement < 3 secondes
- [ ] Pas de lag sur les listes (FlatList optimisé)
- [ ] Images optimisées (compression)
- [ ] Pas de fuites mémoire

### UX/UI

- [ ] Navigation intuitive
- [ ] Feedback visuel clair (loading, succès, erreur)
- [ ] Textes en français (ou langue cible)
- [ ] Accessibilité de base (contraste, tailles)

### Sécurité

- [ ] Aucun secret dans le code
- [ ] RLS activé sur toutes les tables
- [ ] Permissions demandées avec messages clairs
- [ ] HTTPS pour toutes les requêtes

### Tests

- [ ] Tests sur appareils réels (iOS + Android)
- [ ] Tests avec réseau instable
- [ ] Tests de permissions (refus, acceptation)
- [ ] Tests de synchronisation offline

---

## 📝 Notes Importantes

### iOS

- Le processus de review Apple peut prendre **1-7 jours**
- Apple peut rejeter pour :
  - Bugs critiques
  - Violation des guidelines
  - Contenu inapproprié
  - Permissions non justifiées

### Android

- Le processus de review Google peut prendre **1-3 jours**
- Google peut rejeter pour :
  - Bugs critiques
  - Violation des policies
  - Permissions excessives
  - Contenu inapproprié

### Après Publication

- [ ] Monitorer les crash reports (Sentry, Firebase Crashlytics)
- [ ] Répondre aux reviews utilisateurs
- [ ] Mettre à jour régulièrement (bugfixes, features)
- [ ] Surveiller les métriques (downloads, retention, crashes)

---

**Dernière mise à jour** : 2025-01-27  
**Maintenu par** : Tech Lead PorkyFarm

