# 🔒 Règles RLS (Row Level Security) - PorkyFarm

**Date** : 2025-01-27  
**Objectif** : Documenter toutes les policies RLS pour garantir l'isolation des données par utilisateur

---

## 📋 Vue d'ensemble

Toutes les tables métier de PorkyFarm utilisent **Row Level Security (RLS)** pour garantir que :
- Chaque utilisateur ne voit que **ses propres données**
- Les admins peuvent voir **toutes les données** (pour support)
- Les vétérinaires (rôle consultant) peuvent voir **les données des fermes qu'ils suivent** (futur)

---

## 🗂️ Tables et Policies

### 1. `profiles`

**RLS** : ✅ Activé

**Policies** :
- `Users can view own profile` : Un utilisateur peut voir uniquement son propre profil
- `Users can update own profile` : Un utilisateur peut modifier uniquement son propre profil
- `Users can insert own profile` : Un utilisateur peut créer son propre profil
- `Admin can view all profiles` : Les admins peuvent voir tous les profils
- `Admin can update all profiles` : Les admins peuvent modifier tous les profils

**Isolation** : `auth.uid() = id`

---

### 2. `pigs` (Animaux)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own pigs` : Un utilisateur peut voir uniquement ses animaux
- `Users can insert own pigs` : Un utilisateur peut créer ses animaux
- `Users can update own pigs` : Un utilisateur peut modifier ses animaux
- `Users can delete own pigs` : Un utilisateur peut supprimer ses animaux
- `Admin can view all pigs` : Les admins peuvent voir tous les animaux
- `Admin can write all pigs` : Les admins peuvent modifier tous les animaux

**Isolation** : `auth.uid() = user_id`

---

### 3. `health_records` (Cas de santé)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own health_records` : Un utilisateur peut voir uniquement ses cas de santé
- `Users can insert own health_records` : Un utilisateur peut créer ses cas de santé
- `Users can update own health_records` : Un utilisateur peut modifier ses cas de santé
- `Users can delete own health_records` : Un utilisateur peut supprimer ses cas de santé
- `Admin can view all health_records` : Les admins peuvent voir tous les cas

**Isolation** : `auth.uid() = user_id`

**Note** : La table `veterinary_cases` (utilisée par le web) suit les mêmes règles.

---

### 4. `vaccinations`

**RLS** : ✅ Activé

**Policies** :
- `Users can view own vaccinations` : Un utilisateur peut voir uniquement ses vaccinations
- `Users can insert own vaccinations` : Un utilisateur peut créer ses vaccinations
- `Users can update own vaccinations` : Un utilisateur peut modifier ses vaccinations
- `Users can delete own vaccinations` : Un utilisateur peut supprimer ses vaccinations

**Isolation** : `auth.uid() = user_id`

---

### 5. `gestations`

**RLS** : ✅ Activé

**Policies** :
- `Users can view own gestations` : Un utilisateur peut voir uniquement ses gestations
- `Users can insert own gestations` : Un utilisateur peut créer ses gestations
- `Users can update own gestations` : Un utilisateur peut modifier ses gestations
- `Users can delete own gestations` : Un utilisateur peut supprimer ses gestations
- `Admin can view all gestations` : Les admins peuvent voir toutes les gestations

**Isolation** : `auth.uid() = user_id`

---

### 6. `feeding_records` (Enregistrements d'alimentation)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own feeding_records` : Un utilisateur peut voir uniquement ses enregistrements
- `Users can insert own feeding_records` : Un utilisateur peut créer ses enregistrements

**Isolation** : `auth.uid() = user_id`

---

### 7. `feed_stock` (Stock d'aliments)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own feed_stock` : Un utilisateur peut voir uniquement son stock
- `Users can manage own feed_stock` : Un utilisateur peut gérer (INSERT, UPDATE, DELETE) son stock

**Isolation** : `auth.uid() = user_id`

---

### 8. `feeding_schedule` (Planning d'alimentation)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own feeding_schedule` : Un utilisateur peut voir uniquement son planning
- `Users can insert own feeding_schedule` : Un utilisateur peut créer son planning
- `Users can update own feeding_schedule` : Un utilisateur peut modifier son planning
- `Users can delete own feeding_schedule` : Un utilisateur peut supprimer son planning

**Isolation** : `auth.uid() = user_id`

---

### 9. `transactions` (Transactions financières)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own transactions` : Un utilisateur peut voir uniquement ses transactions
- `Users can manage own transactions` : Un utilisateur peut gérer (INSERT, UPDATE, DELETE) ses transactions

**Isolation** : `auth.uid() = user_id`

---

### 10. `ai_usage` (Utilisation IA)

**RLS** : ✅ Activé

**Policies** :
- `Users can view own ai_usage` : Un utilisateur peut voir uniquement son usage IA
- `Admins can view all ai_usage` : Les admins peuvent voir tous les usages

**Isolation** : `auth.uid() = user_id`

**Note** : Les utilisateurs ne peuvent pas insérer directement (via fonction `increment_ai_usage` uniquement).

---

## 🔐 Fonctions RLS

### `is_admin()`
Vérifie si l'utilisateur actuel est admin ou super_admin.

**Usage** : Dans les policies admin bypass.

### `is_super_admin()`
Vérifie si l'utilisateur actuel est super_admin.

**Usage** : Pour les actions critiques (suppression de données, etc.).

### `get_user_role()`
Retourne le rôle de l'utilisateur actuel.

**Usage** : Pour la logique conditionnelle.

---

## ✅ Vérifications de Sécurité

### Tests à effectuer

1. **Isolation utilisateur** :
   - Se connecter avec User A
   - Vérifier qu'on ne voit que les données de User A
   - Se connecter avec User B
   - Vérifier qu'on ne voit pas les données de User A

2. **Admin bypass** :
   - Se connecter avec un compte admin
   - Vérifier qu'on peut voir toutes les données
   - Vérifier qu'on peut modifier toutes les données (si policy admin_write existe)

3. **Insertion** :
   - Créer une nouvelle donnée (animal, cas santé, etc.)
   - Vérifier que `user_id` est automatiquement défini à `auth.uid()`
   - Vérifier qu'un autre utilisateur ne peut pas voir cette donnée

4. **Modification** :
   - Essayer de modifier une donnée d'un autre utilisateur
   - Vérifier que la modification est refusée (erreur 403 ou 0 rows updated)

5. **Suppression** :
   - Essayer de supprimer une donnée d'un autre utilisateur
   - Vérifier que la suppression est refusée

---

## 🚨 Points d'Attention

### ⚠️ Tables sans RLS (à vérifier)

Aucune table métier ne devrait être sans RLS. Si une nouvelle table est créée, **activer RLS immédiatement**.

### ⚠️ Policies manquantes

Si une table a RLS activé mais aucune policy, **aucun utilisateur ne pourra accéder aux données**. Toujours créer au moins une policy SELECT.

### ⚠️ Service Role Key

La clé `service_role` de Supabase **bypass toutes les policies RLS**. Ne jamais l'utiliser côté client (web ou mobile). Uniquement côté backend (Next.js API Routes) et avec précaution.

---

## 📝 Scripts SQL

Tous les scripts SQL sont dans `scripts/` :
- `001-create-tables.sql` : Création des tables + policies de base
- `001-admin-roles-setup.sql` : Setup des rôles admin + policies admin
- `002-admin-policies-update.sql` : Mise à jour des policies admin
- `003-feeding-tables.sql` : Tables alimentation + policies
- `005-ai-usage-table.sql` : Table usage IA + policies

---

## 🔄 Mise à Jour des Policies

Si une policy doit être modifiée :

1. Créer un nouveau script SQL (ex: `006-update-policies.sql`)
2. Utiliser `DROP POLICY IF EXISTS` puis `CREATE POLICY`
3. Tester sur staging avant production
4. Documenter les changements ici

---

**Dernière mise à jour** : 2025-01-27  
**Maintenu par** : Tech Lead PorkyFarm

