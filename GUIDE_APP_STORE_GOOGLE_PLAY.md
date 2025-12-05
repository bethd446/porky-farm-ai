# 📱 Guide Complet : Publier sur App Store et Google Play

## ✅ Capacitor Installé et Configuré

Votre application React est maintenant configurée pour être publiée sur :
- 🍎 **App Store** (iOS)
- 🤖 **Google Play** (Android)

## 🚀 Étapes Rapides

### 1. Synchroniser après chaque modification

Après chaque modification du code web :

```bash
npm run cap:sync
```

Cette commande :
- Build l'app web (`npm run build`)
- Synchronise avec iOS et Android
- Met à jour les fichiers natifs

## 🍎 PUBLICATION SUR APP STORE (iOS)

### Prérequis
- ✅ Mac avec Xcode installé
- ✅ Compte Apple Developer ($99/an)
- ✅ iPhone ou iPad pour tester (optionnel, simulateur possible)

### Étapes

#### 1. Ouvrir dans Xcode

```bash
npm run cap:ios
```

Xcode s'ouvrira automatiquement avec votre projet.

#### 2. Configurer le Signing

Dans Xcode :
1. Cliquez sur **"App"** dans le navigateur de gauche (projet bleu)
2. Sélectionnez **"App"** sous TARGETS
3. Allez dans l'onglet **"Signing & Capabilities"**
4. Cochez **"Automatically manage signing"**
5. Sélectionnez votre **Team** (votre compte Apple Developer)
6. Le **Bundle Identifier** devrait être : `com.porcpro.app`
   - Si erreur, changez-le en quelque chose d'unique (ex: `com.votrenom.porcpro`)

#### 3. Tester sur Simulateur

1. En haut de Xcode, sélectionnez un simulateur (ex: "iPhone 15 Pro")
2. Cliquez sur le bouton **▶️ Play** (ou appuyez sur ⌘R)
3. L'app s'ouvrira dans le simulateur

#### 4. Tester sur un Vrai Appareil (Recommandé)

1. Connectez votre iPhone/iPad avec un câble USB
2. Dans Xcode, sélectionnez votre appareil en haut
3. Cliquez sur **▶️ Play**
4. Sur votre iPhone, allez dans **Réglages > Général > Gestion des appareils**
5. Faites confiance à votre certificat de développeur

#### 5. Créer un Archive pour Publication

1. En haut de Xcode, changez "Any iOS Device" en **"Any iOS Device (arm64)"**
2. Menu : **Product > Archive**
3. Attendez que l'archive soit créée (peut prendre quelques minutes)

#### 6. Distribuer sur l'App Store

1. La fenêtre **Organizer** s'ouvrira automatiquement
2. Sélectionnez votre archive la plus récente
3. Cliquez sur **"Distribute App"**
4. Choisissez **"App Store Connect"**
5. Cliquez sur **"Next"** et suivez les étapes
6. Sélectionnez **"Upload"** (pas "Export")
7. Attendez la fin de l'upload

#### 7. Sur App Store Connect

1. Allez sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Connectez-vous avec votre compte Apple Developer
3. Cliquez sur **"My Apps"** > **"+"** > **"New App"**
4. Remplissez :
   - **Platform** : iOS
   - **Name** : PorcPro
   - **Primary Language** : French
   - **Bundle ID** : `com.porcpro.app` (celui configuré dans Xcode)
   - **SKU** : `porcpro-001` (identifiant unique)
5. Cliquez sur **"Create"**

#### 8. Préparer les Informations de l'App

Dans App Store Connect, remplissez :

**Informations de l'App** :
- **Nom** : PorcPro
- **Sous-titre** : Gestion d'élevage porcin
- **Catégorie** : Business / Productivity
- **Prix** : Gratuit (ou payant)
- **Description** :
```
PorcPro est une application complète de gestion d'élevage porcin. 
Gérez vos porcs, suivez leur santé, analysez vos finances et optimisez 
votre production avec des outils modernes et intuitifs.

Fonctionnalités :
- Gestion complète de votre cheptel
- Suivi de la santé et du poids
- Analyse financière détaillée
- Formulateur d'aliments IA
- Calendrier des événements
- Rapports et statistiques
```

**Mots-clés** : élevage, porc, agriculture, gestion, ferme

**URL de support** : (votre site web ou email)
**URL de confidentialité** : (votre politique de confidentialité)

#### 9. Ajouter des Captures d'Écran

**Obligatoires** :
- iPhone 6.7" (iPhone 14 Pro Max) : Au moins 1 capture
- iPhone 6.5" (iPhone 11 Pro Max) : Au moins 1 capture
- iPad Pro 12.9" : Au moins 1 capture (si support iPad)

**Comment prendre des captures** :
1. Lancez l'app dans le simulateur
2. Menu : **Device > Screenshot** (ou ⌘S)
3. Les captures sont sauvegardées sur le Bureau
4. Uploadez-les dans App Store Connect

#### 10. Soumettre pour Review

1. Une fois toutes les informations remplies
2. Cliquez sur **"Submit for Review"**
3. Répondez aux questions de conformité
4. Attendez la review (généralement 1-3 jours)

## 🤖 PUBLICATION SUR GOOGLE PLAY (Android)

### Prérequis
- ✅ Android Studio installé
- ✅ Compte Google Play Developer ($25 une fois)
- ✅ Appareil Android pour tester (optionnel, émulateur possible)

### Étapes

#### 1. Ouvrir dans Android Studio

```bash
npm run cap:android
```

Android Studio s'ouvrira automatiquement.

#### 2. Configurer le Projet

1. Android Studio va indexer le projet (première fois, peut prendre du temps)
2. Si demandé, installez les SDK manquants
3. Attendez que Gradle termine la synchronisation

#### 3. Tester sur Émulateur

1. Cliquez sur **"Device Manager"** (icône téléphone)
2. Créez un nouvel appareil virtuel si nécessaire
3. Sélectionnez l'émulateur
4. Cliquez sur **▶️ Run** (ou Shift+F10)

#### 4. Tester sur un Vrai Appareil

1. Activez le **Mode développeur** sur votre Android :
   - Allez dans **Paramètres > À propos du téléphone**
   - Tapez 7 fois sur **"Numéro de build"**
2. Activez **"Débogage USB"** dans les options développeur
3. Connectez votre téléphone en USB
4. Autorisez le débogage USB sur le téléphone
5. Dans Android Studio, sélectionnez votre appareil
6. Cliquez sur **▶️ Run**

#### 5. Générer un APK de Test

1. Menu : **Build > Generate Signed Bundle / APK**
2. Sélectionnez **"APK"**
3. Cliquez sur **"Next"**
4. Créez un nouveau keystore :
   - **Key store path** : Cliquez sur "Create new..."
   - **Password** : Choisissez un mot de passe fort
   - **Key alias** : `porcpro`
   - **Validity** : 25 ans (recommandé)
   - **Certificate** : Remplissez vos informations
5. Cliquez sur **"OK"** puis **"Next"**
6. Sélectionnez **"release"**
7. Cliquez sur **"Finish"**
8. L'APK sera dans : `android/app/release/app-release.apk`

#### 6. Créer un Compte Google Play Developer

1. Allez sur [play.google.com/console](https://play.google.com/console)
2. Payez les $25 (une seule fois)
3. Remplissez vos informations

#### 7. Créer une Nouvelle App

1. Dans Google Play Console, cliquez sur **"Créer une application"**
2. Remplissez :
   - **Nom de l'application** : PorcPro
   - **Langue par défaut** : Français
   - **Type d'application** : Application
   - **Gratuite ou payante** : Gratuite
3. Cliquez sur **"Créer"**

#### 8. Préparer les Informations

**Détails de l'application** :
- **Description courte** : Gestion d'élevage porcin moderne
- **Description complète** :
```
PorcPro est une application complète de gestion d'élevage porcin. 
Gérez vos porcs, suivez leur santé, analysez vos finances et optimisez 
votre production avec des outils modernes et intuitifs.

Fonctionnalités :
- Gestion complète de votre cheptel
- Suivi de la santé et du poids
- Analyse financière détaillée
- Formulateur d'aliments IA
- Calendrier des événements
- Rapports et statistiques
```

**Graphiques** :
- **Icône** : 512x512 px (PNG, sans transparence)
- **Capture d'écran** : Au moins 2 (téléphone)
- **Graphique de présentation** : 1024x500 px (optionnel)

**Catégorie** : Business / Productivity

#### 9. Générer un AAB (Android App Bundle)

**Important** : Google Play nécessite un AAB, pas un APK.

1. Dans Android Studio : **Build > Generate Signed Bundle / APK**
2. Sélectionnez **"Android App Bundle"**
3. Utilisez le même keystore que pour l'APK
4. Sélectionnez **"release"**
5. Cliquez sur **"Finish"**
6. Le AAB sera dans : `android/app/release/app-release.aab`

#### 10. Publier sur Google Play

1. Dans Google Play Console, allez dans **"Production"** (ou "Test interne")
2. Cliquez sur **"Créer une version"**
3. Uploadez votre fichier `.aab`
4. Remplissez les **Notes de version**
5. Cliquez sur **"Enregistrer"**
6. Une fois toutes les sections complétées (graphiques, contenu, etc.)
7. Cliquez sur **"Envoyer pour examen"**

## 🔄 Mettre à Jour l'App

### Après chaque modification :

1. **Modifier le code** dans `src/`
2. **Build et sync** :
   ```bash
   npm run cap:sync
   ```
3. **Ouvrir dans Xcode/Android Studio** :
   ```bash
   npm run cap:ios      # Pour iOS
   npm run cap:android  # Pour Android
   ```
4. **Incrémenter la version** :
   - **iOS** : Dans Xcode, allez dans "App" > "General" > "Version" et "Build"
   - **Android** : Dans `android/app/build.gradle`, modifiez `versionCode` et `versionName`
5. **Créer une nouvelle archive/APK**
6. **Publier sur les stores**

## 📋 Checklist de Publication

### iOS (App Store)
- [ ] Compte Apple Developer actif
- [ ] Xcode installé et configuré
- [ ] App testée sur simulateur
- [ ] App testée sur vrai appareil
- [ ] Archive créée
- [ ] App créée sur App Store Connect
- [ ] Informations complétées
- [ ] Captures d'écran ajoutées
- [ ] Soumise pour review

### Android (Google Play)
- [ ] Compte Google Play Developer ($25 payé)
- [ ] Android Studio installé
- [ ] App testée sur émulateur
- [ ] App testée sur vrai appareil
- [ ] Keystore créé et sauvegardé (IMPORTANT !)
- [ ] AAB généré
- [ ] App créée sur Google Play Console
- [ ] Informations complétées
- [ ] Graphiques ajoutés
- [ ] Soumise pour review

## ⚠️ Important

### Sauvegardez votre Keystore Android !

Le fichier keystore est **ESSENTIEL** pour toutes les mises à jour futures.
- Sauvegardez-le dans un endroit sûr
- Notez le mot de passe
- Sans lui, vous ne pourrez pas mettre à jour l'app !

## 🎯 Résumé

1. **iOS** : `npm run cap:ios` → Xcode → Archive → App Store Connect
2. **Android** : `npm run cap:android` → Android Studio → AAB → Google Play Console

**Votre app est maintenant prête à être publiée !** 🚀

