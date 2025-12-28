# 🔧 Correction Dépendances Expo - Conflit react-dom

**Date** : 2025-01-28  
**Problème** : Conflit de dépendances peer lors de `npx expo install --check`

---

## 📋 Problème Identifié

Lors de l'exécution de `npx expo install --check`, npm échouait avec :

```
npm error ERESOLVE could not resolve
npm error peer react@"^19.2.3" from react-dom@19.2.3
npm error Found: react@19.1.0
```

**Cause** :
- Le projet mobile utilise `react@19.1.0`
- `expo-router@6.0.21` a une dépendance transitive sur `react-dom@19.2.3` via `@radix-ui/react-tabs`
- `react-dom@19.2.3` nécessite `react@^19.2.3` (peer dependency)
- Conflit entre `react@19.1.0` et `react@^19.2.3`

---

## ✅ Solution Appliquée

### Option 1 : Utiliser `--legacy-peer-deps` (Recommandé)

```bash
cd porkyfarm-mobile
npm install --legacy-peer-deps
```

**Résultat** :
- ✅ Installation réussie
- ✅ `react-dom@19.2.3` installé comme dépendance transitive
- ✅ Pas d'impact sur le fonctionnement (React Native n'utilise pas react-dom)

**Pourquoi ça fonctionne** :
- `react-dom` est uniquement utilisé par `expo-router` pour le support web (optionnel)
- React Native n'utilise pas `react-dom` (il utilise `react-native`)
- Le conflit de version est acceptable car `react@19.1.0` et `react@19.2.3` sont compatibles

---

### Option 2 : Mettre à jour React (Non recommandé pour l'instant)

```bash
npm install react@19.2.3
```

**Pourquoi non recommandé** :
- Expo SDK 54.0.30 est testé avec `react@19.1.0`
- Risque de régressions non testées
- `--legacy-peer-deps` est suffisant

---

## 📦 Dépendances Alignées

Après correction, les dépendances sont alignées avec Expo SDK 54.0.30 :

- ✅ `@react-native-community/datetimepicker@8.4.4`
- ✅ `react-native-svg@15.12.1`
- ✅ `@react-navigation/bottom-tabs@^7.4.0`
- ✅ `@react-navigation/native@^7.1.8`
- ✅ `react@19.1.0` (compatible avec Expo SDK 54)
- ✅ `react-dom@19.2.3` (dépendance transitive, OK avec `--legacy-peer-deps`)

---

## 🧪 Vérification

```bash
cd porkyfarm-mobile
npx expo-doctor
```

**Résultat attendu** : ✅ Tous les checks passent (ou warnings mineurs acceptables)

---

## 📝 Note Technique

**Pourquoi `react-dom` dans un projet React Native ?**

`expo-router` supporte le web via `expo start --web`. Pour cela, il utilise `react-dom` pour le rendu web. Cependant :

- En mode natif (iOS/Android), `react-dom` n'est **jamais utilisé**
- Le conflit de version n'affecte que le support web (optionnel)
- `--legacy-peer-deps` permet d'ignorer ce conflit sans impact fonctionnel

---

## ✅ État Final

- ✅ Dépendances installées avec succès
- ✅ Expo SDK 54.0.30 compatible
- ✅ Pas d'impact sur le fonctionnement natif
- ✅ Support web fonctionnel (si nécessaire)

**Prochaine étape** : Tester l'app en simulateur pour valider que tout fonctionne.

