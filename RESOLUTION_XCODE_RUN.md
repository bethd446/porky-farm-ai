# 🔧 Résolution : Bouton Run ne fonctionne pas dans Xcode

## ⚠️ Problème Principal

**CocoaPods n'est pas installé** - C'est nécessaire pour les dépendances iOS.

## ✅ Solution Étape par Étape

### Étape 1 : Installer CocoaPods

**Ouvrez le Terminal** (pas Xcode) et exécutez :

```bash
sudo gem install cocoapods
```

**Si erreur de permissions**, utilisez :

```bash
sudo gem install -n /usr/local/bin cocoapods
```

**Vérifier l'installation** :
```bash
pod --version
```

Vous devriez voir un numéro de version (ex: `1.15.2`).

### Étape 2 : Installer les Pods

```bash
cd /Users/desk/Desktop/PorcPro/ios/App
pod install
```

**Important** : Cela peut prendre 2-5 minutes la première fois.

### Étape 3 : Ouvrir le BON Fichier dans Xcode

**❌ NE PAS ouvrir** : `App.xcodeproj` (fichier bleu)
**✅ OUVRIR** : `App.xcworkspace` (fichier blanc)

**Méthode 1 - Terminal** :
```bash
cd /Users/desk/Desktop/PorcPro
npm run cap:ios
```

**Méthode 2 - Manuelle** :
1. Ouvrez Finder
2. Allez dans `/Users/desk/Desktop/PorcPro/ios/App/`
3. Double-cliquez sur **`App.xcworkspace`** (fichier blanc, pas bleu)

### Étape 4 : Dans Xcode - Vérifier le Schéma

Une fois Xcode ouvert :

1. **En haut de Xcode**, à gauche du bouton Play, vous devriez voir :
   - **"App"** (le schéma)
   - **"Any iOS Device"** ou un simulateur

2. **Si rien n'est sélectionné** :
   - Cliquez sur la liste déroulante
   - Sélectionnez **"App"** comme schéma
   - Sélectionnez un simulateur (ex: "iPhone 15 Pro")

3. **Le bouton Play (▶️) devrait maintenant apparaître**

### Étape 5 : Configurer le Signing (si erreur)

Si vous voyez une erreur de "Signing" :

1. Dans le navigateur de gauche, cliquez sur **"App"** (projet bleu en haut)
2. Sélectionnez **"App"** sous **TARGETS**
3. Allez dans l'onglet **"Signing & Capabilities"**
4. Cochez **"Automatically manage signing"**
5. Sélectionnez votre **Team** (votre compte Apple)
   - Si vous n'avez pas de Team, créez un compte Apple Developer gratuit pour tester

### Étape 6 : Nettoyer le Build (si nécessaire)

Si le bouton est toujours grisé :

1. Menu : **Product > Clean Build Folder** (ou ⇧⌘K)
2. Attendez la fin
3. Réessayez

## 🚨 Erreurs Courantes et Solutions

### Erreur : "No such module 'Capacitor'"

**Cause** : Pods non installés

**Solution** :
```bash
cd /Users/desk/Desktop/PorcPro/ios/App
pod install
```

Puis **fermez et rouvrez Xcode**.

### Erreur : "Signing for App requires a development team"

**Solution** :
1. Xcode > **App** > **Signing & Capabilities**
2. Cochez **"Automatically manage signing"**
3. Sélectionnez votre **Team**
4. Si pas de Team : Créez un compte Apple ID gratuit

### Erreur : "No devices available"

**Solution** :
1. Menu : **Window > Devices and Simulators**
2. Cliquez sur **"+"** (en haut à gauche)
3. Sélectionnez un appareil (ex: iPhone 15 Pro)
4. Cliquez sur **"Create"**

### Le bouton Play est grisé

**Vérifications** :
1. ✅ Schéma "App" sélectionné (en haut)
2. ✅ Simulateur ou appareil sélectionné
3. ✅ CocoaPods installé (`pod --version`)
4. ✅ Pods installés (`pod install` fait)
5. ✅ Fichier `.xcworkspace` ouvert (pas `.xcodeproj`)

## 📋 Checklist Complète

- [ ] CocoaPods installé (`pod --version` fonctionne)
- [ ] Pods installés (`pod install` dans `ios/App`)
- [ ] Fichier **`.xcworkspace`** ouvert (pas `.xcodeproj`)
- [ ] Schéma **"App"** sélectionné en haut de Xcode
- [ ] Simulateur ou appareil sélectionné
- [ ] Signing configuré avec une Team
- [ ] Build Folder nettoyé (Product > Clean Build Folder)

## 🎯 Commandes Rapides (Tout Réinstaller)

Si rien ne fonctionne, réinstallez tout :

```bash
cd /Users/desk/Desktop/PorcPro

# 1. Build l'app web
npm run build

# 2. Sync Capacitor
npx cap sync

# 3. Installer les pods
cd ios/App
pod install

# 4. Ouvrir dans Xcode
cd ../..
npm run cap:ios
```

## 💡 Astuce Importante

**TOUJOURS ouvrir `.xcworkspace`, JAMAIS `.xcodeproj`** quand CocoaPods est utilisé !

- ✅ **`App.xcworkspace`** = Contient les Pods (CORRECT)
- ❌ **`App.xcodeproj`** = Sans les Pods (NE FONCTIONNERA PAS)

Si vous ouvrez `.xcodeproj`, les dépendances ne seront pas chargées et le bouton Run ne fonctionnera pas.

## 🔍 Vérification Rapide

Dans Xcode, regardez le navigateur de gauche :
- ✅ Si vous voyez **"Pods"** dans la liste = Bon fichier ouvert
- ❌ Si vous ne voyez pas **"Pods"** = Mauvais fichier, fermez et ouvrez `.xcworkspace`

