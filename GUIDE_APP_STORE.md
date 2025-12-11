# 📱 Guide Publication App Store - PorcPro

## 🎯 Options Disponibles

### Option 1 : PWA (Recommandé - Plus Simple) ✅

**Avantages** :
- ✅ **Gratuit** : Pas de frais App Store
- ✅ **Immédiat** : Disponible dès maintenant
- ✅ **Pas de soumission** : Pas besoin d'approbation Apple
- ✅ **Mises à jour instantanées** : Pas besoin de re-soumettre

**Installation** :
- Les utilisateurs installent via Safari (iOS) ou Chrome (Android)
- Fonctionne comme une app native
- Disponible sur tous les appareils

**C'est la solution la plus simple et recommandée !**

### Option 2 : App Native via Capacitor

Si vous voulez absolument être sur l'App Store officiel :

#### Prérequis

1. **Compte Développeur Apple**
   - Coût : $99/an
   - Inscription : https://developer.apple.com/programs/

2. **Xcode** (macOS uniquement)
   - Télécharger depuis l'App Store Mac
   - Nécessaire pour compiler l'app iOS

3. **Android Studio** (pour Google Play)
   - Télécharger : https://developer.android.com/studio
   - Nécessaire pour compiler l'app Android

#### Étapes pour iOS (App Store)

1. **Installer Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init
   ```

2. **Configurer Capacitor**
   ```bash
   npx cap add ios
   npx cap sync
   ```

3. **Ouvrir dans Xcode**
   ```bash
   npx cap open ios
   ```

4. **Configurer l'app dans Xcode**
   - Bundle Identifier : `com.porkyfarm.app`
   - Version : `1.0.0`
   - Signing : Votre certificat développeur

5. **Tester sur simulateur/appareil**
   - Sélectionner un simulateur
   - Cliquer sur "Run"

6. **Créer une Archive**
   - Product → Archive
   - Attendre la compilation

7. **Soumettre à l'App Store**
   - Window → Organizer
   - Sélectionner l'archive
   - Cliquer sur "Distribute App"
   - Suivre les instructions

8. **App Store Connect**
   - Créer une nouvelle app
   - Remplir les métadonnées
   - Ajouter les screenshots
   - Soumettre pour review

#### Étapes pour Android (Google Play)

1. **Installer Capacitor Android**
   ```bash
   npm install @capacitor/android
   npx cap add android
   npx cap sync
   ```

2. **Ouvrir dans Android Studio**
   ```bash
   npx cap open android
   ```

3. **Configurer l'app**
   - Package name : `com.porkyfarm.app`
   - Version : `1.0.0`
   - Signing : Créer une clé de signature

4. **Générer un APK/AAB**
   - Build → Generate Signed Bundle/APK
   - Suivre les instructions

5. **Google Play Console**
   - Créer une nouvelle app
   - Uploader l'AAB
   - Remplir les métadonnées
   - Soumettre pour review

---

## 💡 Recommandation

**Pour ce soir** : Utilisez le **PWA** ! C'est :
- ✅ **Gratuit**
- ✅ **Immédiat**
- ✅ **Fonctionne comme une app native**
- ✅ **Pas de soumission App Store**

**Plus tard** : Si vous voulez être sur l'App Store officiel, suivez l'Option 2.

---

## 📝 Notes Importantes

- **PWA** : Les utilisateurs peuvent installer directement depuis le navigateur
- **App Store** : Nécessite un compte développeur et un processus de soumission
- **Temps** : PWA = immédiat, App Store = 1-7 jours d'approbation
- **Coût** : PWA = gratuit, App Store = $99/an (Apple) + $25 (Google Play, une fois)

---

**Recommandation** : Commencez par le PWA, c'est parfait pour vos proches ce soir ! 🎉

