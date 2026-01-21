# ✅ Migration V2.0 - Installation Complète

**Date** : $(date)  
**Statut** : ✅ **SUCCÈS**

---

## 📊 Résumé de l'Installation

### Tables Créées : 15 tables principales

✅ **profiles** - Profils utilisateurs  
✅ **farms** - Fermes  
✅ **pigs** - Animaux  
✅ **health_cases** - Cas de santé  
✅ **gestations** - Gestations  
✅ **costs** - Coûts  
✅ **feed_stock** - Stock alimentaire  
✅ **feed_ingredients** - Ingrédients alimentaires  
✅ **feed_formulas** - Formules alimentaires  
✅ **feed_formula_ingredients** - Ingrédients des formules  
✅ **feed_productions** - Productions alimentaires  
✅ **treatments** - Traitements médicaux  
✅ **events** - Journal d'activité  
✅ **symptoms** - Référentiel symptômes  
✅ **diseases** - Référentiel maladies  

### Données de Référence

✅ **34 symptômes** insérés (respiratoires, digestifs, reproductifs, cutanés, comportementaux)  
✅ **18 maladies** insérées (virales, bactériennes, MADO)  

### Fonctionnalités

✅ **Triggers automatiques** :
- Création profil automatique à l'inscription
- Calcul date mise-bas prévue (114 jours)
- Calcul délai d'attente viande (withdrawal_date)

✅ **RPC Functions** :
- `complete_onboarding(p_farm_name, p_farm_address)` - Finalisation onboarding
- `get_dashboard_stats(p_farm_id)` - Statistiques dashboard
- `suggest_diseases(p_symptom_codes)` - Diagnostic suggéré

✅ **Row Level Security (RLS)** :
- Activé sur toutes les tables
- Politiques par utilisateur/farm
- Symptômes et maladies en lecture publique

✅ **Index** :
- Index sur clés étrangères (farm_id, user_id)
- Index sur colonnes fréquemment filtrées (status, category)
- Index GIN sur tableaux (symptoms, common_symptoms)

---

## 🔍 Vérifications

### Tables Principales
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Résultat : 24 tables (incluant tables existantes)
```

### Données de Référence
```sql
SELECT COUNT(*) FROM symptoms;  -- 34 symptômes
SELECT COUNT(*) FROM diseases;  -- 18 maladies
```

### RLS Activé
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
-- Toutes les tables principales ont RLS activé
```

---

## 🚀 Prochaines Étapes

### 1. Vérifier les Services Mobile

Les services suivants doivent être mis à jour pour utiliser les nouvelles tables :

- ✅ `services/healthPro.ts` - Déjà compatible avec `symptoms` et `diseases`
- ⚠️ `services/healthCases.ts` - Vérifier mapping avec `health_cases` (nouvelle structure)
- ⚠️ `services/animals.ts` - Vérifier mapping avec `pigs` (nouvelle structure avec `farm_id`)
- ⚠️ `services/gestations.ts` - Vérifier mapping avec `gestations` (nouvelle structure)
- ⚠️ `services/costs.ts` - Vérifier mapping avec `costs` (nouvelle structure)
- ⚠️ `services/feeding.ts` - Vérifier mapping avec `feed_stock`, `feed_ingredients`, etc.

### 2. Adapter le Code Mobile

**Changements majeurs** :
- Les tables utilisent maintenant `farm_id` au lieu de `user_id` directement
- Il faut d'abord récupérer le `farm_id` de l'utilisateur avant de créer des données
- La table `pigs` utilise `identifier` au lieu de `tag_number` (ou les deux ?)
- La table `health_cases` a une structure enrichie (symptoms, diseases, etc.)

### 3. Tester les RPC Functions

```sql
-- Test complete_onboarding
SELECT complete_onboarding('Ma Ferme', 'Adresse test');

-- Test get_dashboard_stats (nécessite un farm_id valide)
SELECT get_dashboard_stats('farm_id_here');

-- Test suggest_diseases
SELECT suggest_diseases(ARRAY['COUGH', 'FEVER', 'DYSPNEA']);
```

---

## 📝 Notes Importantes

### Structure `health_cases`

La nouvelle table `health_cases` inclut :
- `symptoms TEXT[]` - Liste des codes symptômes
- `suspected_disease_id UUID` - Maladie suspectée
- `confirmed_disease_id UUID` - Maladie confirmée
- `temperature DECIMAL(4,1)` - Température
- `quarantine_applied BOOLEAN` - Quarantaine appliquée
- `vet_consulted BOOLEAN` - Vétérinaire consulté
- `lab_results TEXT` - Résultats laboratoire

### Structure `pigs`

La nouvelle table `pigs` inclut :
- `farm_id UUID` - Référence à la ferme (OBLIGATOIRE)
- `identifier VARCHAR(50)` - Identifiant unique
- `category VARCHAR(50)` - Catégorie (truie, verrat, porcelet, engraissement)
- `gender VARCHAR(10)` - Sexe (male, female)
- `tags TEXT[]` - Tags multiples

### Gestion des Fermes

**Important** : Chaque utilisateur doit avoir au moins une ferme. Le workflow est :
1. Utilisateur s'inscrit → profil créé automatiquement
2. Utilisateur complète onboarding → ferme créée via `complete_onboarding()`
3. Toutes les données (pigs, health_cases, etc.) sont liées à `farm_id`

---

## 🔒 Sécurité

✅ **RLS activé** sur toutes les tables  
✅ **Politiques par utilisateur** - Chaque utilisateur ne voit que ses données  
✅ **Politiques par ferme** - Les données sont isolées par ferme  
✅ **Fonctions RPC sécurisées** - Utilisation de `SECURITY DEFINER` avec vérification `auth.uid()`

---

## ✅ Checklist Finale

- [x] Tables principales créées
- [x] Triggers automatiques configurés
- [x] RPC Functions créées
- [x] RLS activé et politiques configurées
- [x] Index créés
- [x] Données de référence (symptoms, diseases) insérées
- [ ] Services mobile adaptés (à faire)
- [ ] Tests d'intégration (à faire)
- [ ] Documentation API mise à jour (à faire)

---

**Migration terminée avec succès ! 🎉**

