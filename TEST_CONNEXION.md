# 🧪 Guide de Test de Connexion

## ✅ Problème résolu

Le fichier `.env` contenait des **guillemets** autour des valeurs, ce qui causait une erreur de connexion.

### Correction appliquée

```bash
# ❌ AVANT (incorrect)
VITE_SUPABASE_URL="https://cjzyvcrnwqejlplbkexg.supabase.co"

# ✅ APRÈS (correct)
VITE_SUPABASE_URL=https://cjzyvcrnwqejlplbkexg.supabase.co
```

## 📋 Tests disponibles

### 1. Test de connexion Supabase

```bash
npm run check:supabase
# ou
node check-supabase.js
```

**Vérifie :**
- ✅ Variables d'environnement
- ✅ Connexion à Supabase
- ✅ Service d'authentification
- ✅ Existence des tables

### 2. Test d'authentification

```bash
node test-auth.js
```

**Vérifie :**
- ✅ Connexion avec compte test
- ✅ Récupération du profil
- ✅ Accès aux données (RLS)
- ✅ Déconnexion

## 🔍 Résultats des tests

### ✅ Connexion Supabase
```
✅ Connexion réussie à Supabase
✅ Service d'authentification accessible
✅ Toutes les tables sont créées
```

### ⚠️ Si les tests échouent

1. **Variables d'environnement manquantes**
   ```bash
   # Vérifiez le fichier .env
   cat .env
   ```

2. **URL Supabase invalide**
   - Vérifiez qu'il n'y a pas de guillemets
   - Vérifiez que l'URL commence par `https://`

3. **Clé API invalide**
   - Vérifiez qu'il n'y a pas de guillemets
   - Vérifiez que la clé est complète

4. **Tables manquantes**
   - Exécutez les migrations SQL dans Supabase
   - Vérifiez que l'assistant IA a terminé

## 🚀 Prochaines étapes

1. ✅ Connexion Supabase : **OK**
2. ⏳ Test d'authentification : **À tester**
3. ⏳ Test de l'application : **À tester**

## 📝 Compte test

- **Email:** `openformac@gmail.com`
- **Password:** `Paname12@@`

**⚠️ Important :** Ce compte doit exister dans Supabase Auth pour que les tests passent.

