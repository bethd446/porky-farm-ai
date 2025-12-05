# 📱 Publier avec Xcode - Guide Simple

## ⚠️ Important

**PorcPro est une application WEB React**, pas une app iOS native. Pour utiliser Xcode, vous devez d'abord convertir l'app en app iOS avec **Capacitor**.

## 🚀 Étapes pour Publier avec Xcode

### Étape 1 : Installer Capacitor (Terminal)

Ouvrez le **Terminal** (pas Xcode) et exécutez :

```bash
cd /Users/desk/Desktop/PorcPro
npm install @capacitor/core @capacitor/cli @capacitor/ios
```

### Étape 2 : Initialiser Capacitor

```bash
npx cap init
```

Quand il demande :
- **App name** : `PorcPro`
- **App ID** : `com.votrenom.porcpro` (remplacez par votre nom)
- **Web dir** : `dist`

### Étape 3 : Ajouter la plateforme iOS

```bash
npx cap add ios
```

### Étape 4 : Build l'application web

```bash
npm run build
```

### Étape 5 : Synchroniser avec iOS

```bash
npx cap sync
```

### Étape 6 : Ouvrir dans Xcode

```bash
npx cap open ios
```

**Xcode s'ouvrira automatiquement !** 🎉

## 📱 Dans Xcode

### 1. Sélectionner le projet
- Dans le navigateur de gauche, cliquez sur **"App"** (le projet bleu en haut)

### 2. Configurer Signing
- Cliquez sur **"App"** dans la liste de gauche (sous TARGETS)
- Allez dans l'onglet **"Signing & Capabilities"**
- Cochez **"Automatically manage signing"**
- Sélectionnez votre **Team** (votre compte Apple Developer)
- Changez le **Bundle Identifier** si nécessaire (ex: `com.votrenom.porcpro`)

### 3. Tester sur Simulateur
- En haut de Xcode, sélectionnez un simulateur (ex: "iPhone 15")
- Cliquez sur le bouton **▶️ Play** (ou ⌘R)
- L'app s'ouvrira dans le simulateur

### 4. Publier sur l'App Store

#### A. Créer un Archive
1. En haut de Xcode, changez "Any iOS Device" en **"Any iOS Device (arm64)"**
2. Menu : **Product > Archive**
3. Attendez que l'archive soit créée

#### B. Distribuer
1. La fenêtre **Organizer** s'ouvrira
2. Sélectionnez votre archive
3. Cliquez sur **"Distribute App"**
4. Choisissez **"App Store Connect"**
5. Suivez les étapes

#### C. Sur App Store Connect
1. Allez sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Créez une nouvelle app si nécessaire
3. Téléversez l'archive
4. Remplissez les informations (description, screenshots, etc.)
5. Soumettez pour review

## ⚡ Alternative Rapide : Vercel (Déjà fait !)

**Votre app est DÉJÀ publiée sur Vercel** et accessible partout :

🌐 **URL** : `https://porky-farm-ai-one.vercel.app`

**Avantages Vercel** :
- ✅ Déjà configuré
- ✅ Gratuit
- ✅ Accessible sur iOS, Android, Desktop
- ✅ Pas besoin de compte Apple Developer ($99/an)
- ✅ Pas besoin de review App Store

## 🎯 Recommandation

**Pour une app web React, utilisez Vercel** (déjà fait !).

**Utilisez Xcode seulement si** :
- Vous voulez absolument une app native iOS
- Vous avez un compte Apple Developer
- Vous voulez être sur l'App Store

## 📞 Besoin d'aide ?

Si vous avez des erreurs dans Xcode, envoyez-moi :
1. Le message d'erreur exact
2. À quelle étape vous êtes bloqué

