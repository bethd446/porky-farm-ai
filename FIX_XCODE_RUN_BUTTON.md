# 🔧 Fix : Bouton Run ne fonctionne pas dans Xcode

## ⚠️ Problème Identifié

Le bouton Run (▶️) ne s'affiche pas ou ne fonctionne pas dans Xcode.

## 🔍 Causes Possibles

1. **CocoaPods non installé** (dépendances iOS manquantes)
2. **Mauvais fichier ouvert** (il faut ouvrir `.xcworkspace`, pas `.xcodeproj`)
3. **Schéma non sélectionné**
4. **Signing non configuré**
5. **Dépendances non installées**

## ✅ Solution Complète

### Étape 1 : Installer CocoaPods

```bash
sudo gem install cocoapods
```

**Note** : Si vous avez une erreur de permissions, utilisez :
```bash
sudo gem install -n /usr/local/bin cocoapods
```

### Étape 2 : Installer les Pods

```bash
cd /Users/desk/Desktop/PorcPro/ios/App
pod install
```

Cela peut prendre quelques minutes la première fois.

### Étape 3 : Ouvrir le BON Fichier

**❌ NE PAS ouvrir** : `App.xcodeproj`
**✅ OUVRIR** : `App.xcworkspace`

**Dans le terminal** :
```bash
cd /Users/desk/Desktop/PorcPro
npm run cap:ios
```

Ou manuellement :
```bash
open ios/App/App.xcworkspace
```

### Étape 4 : Vérifier dans Xcode

Une fois Xcode ouvert :

1. **Vérifier le schéma** :
   - En haut de Xcode, à côté du bouton Play
   - Il doit y avoir : **"App"** > **"Any iOS Device"** ou un simulateur
   - Si rien, cliquez sur la liste déroulante et sélectionnez **"App"**

2. **Sélectionner un simulateur** :
   - Cliquez sur la liste déroulante à côté de "App"
   - Choisissez un simulateur (ex: "iPhone 15 Pro")
   - Le bouton Play devrait apparaître

3. **Vérifier le Signing** :
   - Cliquez sur **"App"** dans le navigateur de gauche
   - Sélectionnez **"App"** sous TARGETS
   - Onglet **"Signing & Capabilities"**
   - Cochez **"Automatically manage signing"**
   - Sélectionnez votre **Team**

### Étape 5 : Nettoyer le Build (si nécessaire)

Si le bouton Play est grisé :

1. Menu : **Product > Clean Build Folder** (⇧⌘K)
2. Attendez la fin
3. Réessayez

## 🚨 Erreurs Courantes

### Erreur : "No such module 'Capacitor'"

**Solution** :
```bash
cd /Users/desk/Desktop/PorcPro/ios/App
pod install
```

Puis rouvrez Xcode.

### Erreur : "Signing for App requires a development team"

**Solution** :
1. Dans Xcode : **App** > **Signing & Capabilities**
2. Cochez **"Automatically manage signing"**
3. Sélectionnez votre **Team** (ou créez un compte Apple Developer)

### Erreur : "No devices available"

**Solution** :
1. Menu : **Window > Devices and Simulators**
2. Cliquez sur **"+"** pour ajouter un simulateur
3. Ou connectez un iPhone/iPad en USB

### Le bouton Play est grisé

**Solutions** :
1. Vérifiez qu'un **schéma est sélectionné** (en haut)
2. Vérifiez qu'un **simulateur/appareil est sélectionné**
3. **Product > Clean Build Folder**
4. Fermez et rouvrez Xcode

## 📋 Checklist Rapide

- [ ] CocoaPods installé (`pod --version`)
- [ ] Pods installés (`pod install` dans `ios/App`)
- [ ] Fichier `.xcworkspace` ouvert (pas `.xcodeproj`)
- [ ] Schéma "App" sélectionné en haut
- [ ] Simulateur ou appareil sélectionné
- [ ] Signing configuré avec une Team
- [ ] Build Folder nettoyé si nécessaire

## 🎯 Commandes Rapides

```bash
# Tout réinstaller depuis le début
cd /Users/desk/Desktop/PorcPro
npm run cap:sync
cd ios/App
pod install
npm run cap:ios
```

## 💡 Astuce

**Toujours ouvrir `.xcworkspace`, jamais `.xcodeproj`** quand CocoaPods est utilisé !

Si vous ouvrez `.xcodeproj`, les dépendances ne seront pas chargées et le bouton Run ne fonctionnera pas.

