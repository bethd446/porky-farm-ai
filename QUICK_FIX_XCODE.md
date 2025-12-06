# ⚡ Fix Rapide : Bouton Run Xcode

## 🎯 Solution en 3 Étapes

### 1. Installer CocoaPods (Terminal)

```bash
sudo gem install cocoapods
```

### 2. Installer les Pods

```bash
cd /Users/desk/Desktop/PorcPro/ios/App
pod install
```

### 3. Ouvrir le BON Fichier

**Dans le Terminal** :
```bash
cd /Users/desk/Desktop/PorcPro
open ios/App/App.xcworkspace
```

**OU** double-cliquez sur `App.xcworkspace` dans Finder (fichier BLANC, pas bleu)

## ✅ Dans Xcode

1. En haut, sélectionnez **"App"** comme schéma
2. Sélectionnez un simulateur (ex: iPhone 15 Pro)
3. Le bouton Play (▶️) devrait apparaître

## ⚠️ Important

- ✅ Ouvrir **`.xcworkspace`** (fichier blanc)
- ❌ NE PAS ouvrir **`.xcodeproj`** (fichier bleu)

