# Documentation RLS (Row Level Security) - PorcPro

## ✅ Vérification des Permissions RLS

Toutes les tables ont RLS activé avec des politiques qui garantissent que les utilisateurs ne peuvent accéder qu'à leurs propres données.

## 📋 Politiques RLS par Table

### Table: `profiles`
- **SELECT** : `auth.uid() = id` - Les utilisateurs peuvent voir leur propre profil
- **INSERT** : `auth.uid() = id` - Les utilisateurs peuvent créer leur propre profil
- **UPDATE** : `auth.uid() = id` - Les utilisateurs peuvent modifier leur propre profil

### Table: `pigs`
- **SELECT** : `auth.uid() = user_id` - Les utilisateurs peuvent voir leurs propres porcs
- **INSERT** : `auth.uid() = user_id` - Les utilisateurs peuvent créer leurs propres porcs
- **UPDATE** : `auth.uid() = user_id` - Les utilisateurs peuvent modifier leurs propres porcs
- **DELETE** : `auth.uid() = user_id` - Les utilisateurs peuvent supprimer leurs propres porcs

### Table: `feed_formulations`
- **SELECT** : `auth.uid() = user_id` - Les utilisateurs peuvent voir leurs propres formulations
- **INSERT** : `auth.uid() = user_id` - Les utilisateurs peuvent créer leurs propres formulations
- **DELETE** : `auth.uid() = user_id` - Les utilisateurs peuvent supprimer leurs propres formulations

### Table: `events`
- **SELECT** : `auth.uid() = user_id` - Les utilisateurs peuvent voir leurs propres événements
- **INSERT** : `auth.uid() = user_id` - Les utilisateurs peuvent créer leurs propres événements
- **UPDATE** : `auth.uid() = user_id` - Les utilisateurs peuvent modifier leurs propres événements
- **DELETE** : `auth.uid() = user_id` - Les utilisateurs peuvent supprimer leurs propres événements

### Table: `transactions`
- **SELECT** : `auth.uid() = user_id` - Les utilisateurs peuvent voir leurs propres transactions
- **INSERT** : `auth.uid() = user_id` - Les utilisateurs peuvent créer leurs propres transactions
- **UPDATE** : `auth.uid() = user_id` - Les utilisateurs peuvent modifier leurs propres transactions
- **DELETE** : `auth.uid() = user_id` - Les utilisateurs peuvent supprimer leurs propres transactions

## 🔒 Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Toutes les politiques utilisent `auth.uid()` pour l'isolation des données
- ✅ Pas d'accès cross-user possible
- ✅ Les foreign keys garantissent l'intégrité référentielle

## ✅ Vérification

Pour vérifier que RLS fonctionne correctement :

1. Connectez-vous avec un compte de test
2. Créez des données (porcs, événements, etc.)
3. Déconnectez-vous et connectez-vous avec un autre compte
4. Vérifiez que vous ne voyez que vos propres données

## 📝 Notes

- Les politiques RLS sont créées automatiquement par les migrations SQL
- Toute modification des politiques doit être faite via des migrations
- Les tests de sécurité doivent vérifier que les utilisateurs ne peuvent pas accéder aux données d'autres utilisateurs

