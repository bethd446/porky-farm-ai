# 🔒 Activation de la Protection Mots de Passe - Guide Rapide

## Étapes Rapides

1. **Ouvrez Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Sélectionnez votre projet**
   - Projet: mqojrnmryxiggcomfpfx

3. **Allez dans Authentication**
   - Menu gauche → **Authentication**

4. **Ouvrez Settings ou Policies**
   - Cherchez **"Password Protection"** ou **"Security"**

5. **Activez "Check passwords against HaveIBeenPwned"**
   - Cochez la case ou activez le toggle
   - Cliquez sur **Save**

## Emplacement Probable

```
Dashboard → Authentication → Settings → Security → Password Protection
```

OU

```
Dashboard → Authentication → Policies → Password Policies
```

## Message d'Erreur Attendu (après activation)

Si un utilisateur essaie un mot de passe compromis :
```
"Ce mot de passe a été compromis dans une fuite de données. 
Veuillez en choisir un autre."
```

## ✅ Vérification

Après activation, testez avec un mot de passe connu comme compromis :
- `password123`
- `12345678`
- `qwerty`

Ces mots de passe devraient être rejetés.

## 💡 Note

Cette fonctionnalité améliore la sécurité sans impact sur les performances.
Elle utilise l'API HaveIBeenPwned de manière sécurisée (k-anonymity).
