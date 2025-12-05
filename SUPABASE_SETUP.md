# Configuration Supabase - PorcPro

## ✅ Configuration terminée

Votre application est maintenant configurée avec Supabase :

- **URL** : `https://mqojrnmryxiggcomfpfx.supabase.co`
- **API Key** : Configurée dans `.env`

## 📋 Étapes suivantes

### 1. Exécuter les migrations SQL

**⚠️ IMPORTANT : Ne copiez PAS le nom du fichier, copiez son CONTENU !**

Deux options :

#### Option A : Utiliser les fichiers simplifiés (RECOMMANDÉ)

1. Ouvrez le fichier `MIGRATION_1.sql` à la racine du projet
2. Sélectionnez TOUT le contenu (Cmd+A / Ctrl+A)
3. Copiez (Cmd+C / Ctrl+C)
4. Allez sur [Supabase Dashboard](https://supabase.com/dashboard) → Votre projet → **SQL Editor**
5. Collez le contenu et cliquez sur **Run**
6. Répétez avec `MIGRATION_2.sql`

#### Option B : Utiliser les fichiers originaux

1. Ouvrez `supabase/migrations/20251205164658_6d1bd718-acac-42e6-9f12-3a85afb7a2c9.sql`
2. **Sélectionnez TOUT le contenu** (pas le nom du fichier !)
3. Copiez et collez dans Supabase SQL Editor
4. Exécutez
5. Répétez avec le deuxième fichier

📖 Voir le guide détaillé : `MIGRATION_GUIDE.md`

### 2. Vérifier les tables créées

Après avoir exécuté les migrations, vous devriez avoir ces tables :
- ✅ `profiles` - Profils utilisateurs
- ✅ `pigs` - Porcs
- ✅ `feed_formulations` - Formulations alimentaires
- ✅ `events` - Événements
- ✅ `transactions` - Transactions financières

### 3. Vérifier les politiques RLS (Row Level Security)

Toutes les tables ont RLS activé avec des politiques qui permettent :
- Les utilisateurs peuvent voir/modifier/supprimer uniquement leurs propres données
- Les utilisateurs peuvent créer leurs propres enregistrements

### 4. Vérifier le trigger de création de profil

Un trigger automatique crée un profil dans la table `profiles` lorsqu'un nouvel utilisateur s'inscrit.

### 5. Tester l'authentification

1. Lancez l'application : `npm run dev`
2. Allez sur `/auth`
3. Créez un compte de test
4. Vérifiez que vous êtes redirigé vers `/dashboard`

## 🔐 Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Politiques de sécurité configurées
- ✅ Variables d'environnement dans `.env` (non commitées)
- ✅ Validation côté client avec Zod
- ✅ Sanitization des données utilisateur

## 🚀 Fonctionnalités disponibles

Une fois les migrations exécutées, vous pourrez :

- ✅ S'inscrire et se connecter
- ✅ Gérer les porcs (CRUD complet)
- ✅ Créer des formulations alimentaires
- ✅ Gérer les événements
- ✅ Suivre les transactions financières
- ✅ Voir le tableau de bord avec statistiques

## 📝 Notes importantes

1. **Storage** : Si vous voulez uploader des photos de porcs, configurez Supabase Storage :
   - Créez un bucket `pig-photos`
   - Configurez les politiques de sécurité

2. **Edge Functions** : La fonction `generate-feed-formulation` doit être déployée :
   ```bash
   supabase functions deploy generate-feed-formulation
   ```

3. **Email** : Configurez les templates d'email dans Supabase Dashboard > Authentication > Email Templates

## 🐛 Dépannage

### Problème : "Invalid API key"
- Vérifiez que le fichier `.env` contient bien les bonnes valeurs
- Redémarrez le serveur de développement après modification de `.env`

### Problème : "Table does not exist"
- Exécutez les migrations SQL dans Supabase Dashboard

### Problème : "Permission denied"
- Vérifiez que RLS est activé et que les politiques sont correctes
- Vérifiez que l'utilisateur est bien authentifié

## 📞 Support

Pour toute question, consultez la [documentation Supabase](https://supabase.com/docs).

