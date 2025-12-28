# 📋 Implémentation Onboarding & To-Do Quotidienne - PorkyFarm

## ✅ Résumé des implémentations

### 1. Navigation Bottom Tabs (Confirmée)

**Structure finale** (`porkyfarm-mobile/app/(tabs)/_layout.tsx`) :
- **Tab 1** : Accueil (`index`) - Dashboard avec stats, to-do, alertes
- **Tab 2** : Animaux (`livestock/index`) - Liste du cheptel
- **Tab 3** : Bouton central "+" (`livestock/add`) - Ouvre `ActionsModal` avec 4 actions rapides
- **Tab 4** : Rapports (`reports/index`) - Statistiques et finances
- **Tab 5** : Assistant IA (`ai-assistant`) - Chat IA

**Composants** :
- `ActionsModal.tsx` : Modal avec actions (Ajouter animal, cas santé, gestation, mouvement stock)

---

### 2. Onboarding Intelligent (5-6 écrans)

**Flux complet** (`porkyfarm-mobile/app/onboarding/`) :

1. **`index.tsx`** - Écran d'accueil
   - Présentation du wizard
   - Bénéfices (création auto cheptel, routine, to-do)
   - Bouton "Commencer"

2. **`step1.tsx`** - Nombre total de porcs
   - Input numérique
   - Validation : > 0

3. **`step2.tsx`** - Répartition par catégorie
   - 4 champs : Truies, Verrats, Porcs d'engraissement, Porcelets
   - Résumé : Total saisi / Total déclaré
   - Validation : Au moins une catégorie > 0

4. **`step3.tsx`** - Races principales
   - Multi-sélection : Large White, Landrace, Pietrain, Duroc, Autre
   - Valeur par défaut si aucune sélection

5. **`step4.tsx`** - Habitudes d'alimentation
   - Fréquence : Matin et soir / Matin, midi et soir
   - Rations (kg/jour) : Truies gestantes, Truies en lactation, Porcs d'engraissement, Porcelets

6. **`step5.tsx`** - Superficie & type de bâtiment (optionnel)
   - Superficie (m²)
   - Type : Bâtiment fermé / Semi-ouvert / Plein air

7. **`step6.tsx`** - Objectif principal + Résumé + Finalisation
   - Choix priorité : Santé / Reproduction / Coûts / Tout
   - Résumé complet de la configuration
   - Bouton "Terminer" → Appelle `completeOnboarding()`

**Layout** : `onboarding/_layout.tsx` (Stack navigator)

**Guard** : `app/_layout.tsx` - `OnboardingGuard` redirige vers `/onboarding` si `has_completed_onboarding = false`

---

### 3. Services Créés

#### `porkyfarm-mobile/services/onboarding.ts`

**Fonctions** :
- `checkOnboardingStatus()` : Vérifie `profiles.has_completed_onboarding`
- `saveOnboardingData(data)` : Sauvegarde dans `profiles.onboarding_data` (JSONB)
- `completeOnboarding(data)` : 
  1. Sauvegarde les données
  2. Crée les animaux automatiquement (TRUIE-001, VERRAT-001, etc.)
  3. Crée les tâches récurrentes quotidiennes
  4. Marque l'onboarding comme complété

#### `porkyfarm-mobile/services/tasks.ts`

**Fonctions** :
- `getAll(filters?)` : Liste toutes les tâches (filtres : completed, type, dueDate)
- `getToday()` : Tâches du jour (non complétées + quotidiennes)
- `getById(id)` : Détails d'une tâche
- `create(task)` : Créer une tâche
- `update(id, updates)` : Mettre à jour
- `complete(id)` : Marquer comme complétée
- `delete(id)` : Supprimer
- `createRecurringDailyTasks(onboardingData)` : Génère automatiquement les tâches quotidiennes basées sur l'onboarding

**Types de tâches** :
- `health` : Santé
- `feeding` : Alimentation
- `cleaning` : Nettoyage
- `reproduction` : Reproduction
- `admin` : Administration
- `other` : Autre

**Fréquences** :
- `daily` : Quotidienne
- `weekly` : Hebdomadaire
- `event_based` : Basée sur événement (ex: J+7 après mise-bas)
- `one_time` : Unique

---

### 4. Base de Données

**Script SQL** : `scripts/006-farm-settings-tasks.sql`

**Modifications** :
- `profiles` : Ajout colonnes `has_completed_onboarding` (BOOLEAN) et `onboarding_data` (JSONB)

**Nouvelle table** : `tasks`
- `id`, `user_id`, `title`, `description`
- `type` (health, feeding, cleaning, reproduction, admin, other)
- `frequency` (daily, weekly, event_based, one_time)
- `due_date`, `due_time`
- `completed`, `completed_at`
- `related_animal_id`, `related_health_case_id`, `related_gestation_id`
- `metadata` (JSONB)
- RLS activé + policies

---

### 5. Composants UI

#### `porkyfarm-mobile/components/TodoList.tsx`

**Props** :
- `maxItems?` : Nombre max de tâches affichées (défaut: 6)
- `showCompleted?` : Afficher les tâches complétées (défaut: false)

**Fonctionnalités** :
- Affiche les tâches du jour (via `tasksService.getToday()`)
- Cases à cocher pour marquer complété/non complété
- Badges par type (Santé, Alimentation, Nettoyage, Repro, Autre)
- Icônes d'état (CheckCircle2, Circle, Clock, AlertCircle)
- EmptyState si aucune tâche
- ErrorState avec retry

**Intégration** : Dashboard (`app/(tabs)/index.tsx`) - Section après header

---

### 6. Automatisation Post-Onboarding

**Fonction `completeOnboarding()`** :

1. **Création automatique des animaux** :
   - Pour chaque catégorie (truies, verrats, engraissement, porcelets)
   - Identifiants auto : `TRUIE-001`, `TRUIE-002`, ..., `VERRAT-001`, etc.
   - Catégorie, race (première sélectionnée), statut `active`
   - Champs vides : nom, date de naissance, poids, photo (à compléter plus tard)

2. **Génération des tâches quotidiennes** :
   - **Alimentation** : Basée sur fréquence (2 ou 3 fois/jour) et catégories présentes
     - Ex: "Nourrir les truies (08:00)" avec ration dans description
   - **Santé** : "Vérifier l'état de santé général" (09:00)
   - **Nettoyage** : "Nettoyer les principales cases" (10:00)

3. **Sauvegarde configuration** :
   - `profiles.onboarding_data` : Toutes les données (JSONB)
   - `profiles.has_completed_onboarding` : `true`

---

### 7. Intégration Dashboard

**Dashboard** (`app/(tabs)/index.tsx`) :

**Sections** :
1. **Header** : Salutation + sous-titre
2. **To-Do Liste du jour** : Composant `TodoList` (max 5 tâches)
3. **Stats Row** : 4 cartes (Total Porcs, En Santé, Soins Requis, Porcelets)
4. **Actions Rapides** : 4 boutons (Ajouter, Vaccin, Stock, Registres)
5. **Assistant IA Banner** : Carte avec gradient violet
6. **Alertes Récentes** : Cartes colorées (température, vaccination)
7. **Animaux Récents** : Liste avec photos/badges

---

## 📝 Checklist de Test

### Scénario 1 : Nouvel utilisateur
- [ ] Inscription → Redirection automatique vers `/onboarding`
- [ ] Étape 1 : Saisir nombre total de porcs → Validation OK
- [ ] Étape 2 : Répartition par catégorie → Résumé affiché
- [ ] Étape 3 : Sélection races → Multi-sélection fonctionnelle
- [ ] Étape 4 : Alimentation → Fréquence + rations
- [ ] Étape 5 : Superficie (optionnel) → Peut être vide
- [ ] Étape 6 : Objectif + Résumé → Affichage correct
- [ ] Finalisation → Création animaux + tâches → Redirection dashboard

### Scénario 2 : Dashboard après onboarding
- [ ] Dashboard se charge sans erreur
- [ ] To-Do liste affiche les tâches du jour
- [ ] Cocher une tâche → Marque comme complétée
- [ ] Stats affichent le bon nombre d'animaux
- [ ] Animaux récents affichent les animaux créés (TRUIE-001, etc.)

### Scénario 3 : Navigation
- [ ] Accueil → OK
- [ ] Animaux → Liste avec animaux auto-créés
- [ ] Bouton "+" → Modal avec 4 actions
- [ ] Rapports → Stats complètes
- [ ] Assistant IA → Chat fonctionnel

### Scénario 4 : Modification animaux
- [ ] Ouvrir fiche animal (TRUIE-001)
- [ ] Ajouter photo → Upload fonctionnel
- [ ] Modifier poids, date de naissance → Sauvegarde OK
- [ ] Ajouter notes → Persistance OK

### Scénario 5 : Tâches
- [ ] Marquer tâche comme complétée → Disparaît de la liste (si `showCompleted=false`)
- [ ] Recharger dashboard → Tâches quotidiennes toujours présentes
- [ ] Tâches liées à événements (à implémenter plus tard) : J+7 après mise-bas, etc.

---

## 🔧 Fichiers Créés/Modifiés

### Nouveaux fichiers
- `porkyfarm-mobile/app/onboarding/index.tsx`
- `porkyfarm-mobile/app/onboarding/step1.tsx`
- `porkyfarm-mobile/app/onboarding/step2.tsx`
- `porkyfarm-mobile/app/onboarding/step3.tsx`
- `porkyfarm-mobile/app/onboarding/step4.tsx`
- `porkyfarm-mobile/app/onboarding/step5.tsx`
- `porkyfarm-mobile/app/onboarding/step6.tsx`
- `porkyfarm-mobile/app/onboarding/_layout.tsx`
- `porkyfarm-mobile/services/onboarding.ts`
- `porkyfarm-mobile/services/tasks.ts`
- `porkyfarm-mobile/components/TodoList.tsx`
- `scripts/006-farm-settings-tasks.sql`

### Fichiers modifiés
- `porkyfarm-mobile/app/_layout.tsx` : Ajout `OnboardingGuard`
- `porkyfarm-mobile/app/(tabs)/index.tsx` : Intégration `TodoList`
- `porkyfarm-mobile/app/(tabs)/_layout.tsx` : Navigation confirmée (5 tabs)

---

## 🎯 Prochaines étapes (Post-MVP)

1. **Tâches liées à événements** :
   - Mise-bas → Tâches J+1, J+7, J+21 (sevrage)
   - Cas santé → Rappel fin de traitement
   - Vaccination → Rappel prochaine dose

2. **Notifications push** :
   - Rappels tâches (heure due)
   - Alertes santé critiques
   - Rappels gestations (J-7 avant mise-bas)

3. **Réconfiguration** :
   - Bouton "Reconfigurer ma ferme" dans Profil
   - Réinitialise `has_completed_onboarding` → Relance onboarding

4. **Hooks santé/repro dans fiches** :
   - Fiche animal → Bouton "Signaler maladie" → Formulaire cas santé
   - Fiche truie → Onglet Repro → "Nouvelle saillie" → Crée gestation
   - Mise-bas → Crée automatiquement porcelets liés

---

## ✅ Statut

**Implémenté et fonctionnel** :
- ✅ Navigation bottom tabs (5 onglets)
- ✅ Onboarding complet (6 écrans)
- ✅ Service onboarding + tasks
- ✅ Table tasks + colonnes profiles
- ✅ Composant TodoList
- ✅ Intégration dashboard
- ✅ Automatisation création animaux
- ✅ Génération tâches quotidiennes

**À compléter** (hors scope actuel) :
- ⏳ Hooks santé/repro dans fiches animaux (à faire dans prochaine itération)
- ⏳ Notifications push
- ⏳ Tâches événementielles automatiques

