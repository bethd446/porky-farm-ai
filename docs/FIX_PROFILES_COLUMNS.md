# 🔧 CORRECTION : Colonnes manquantes dans `profiles`

**Date :** 28 Décembre 2024  
**Problème :** La colonne `has_completed_onboarding` n'existe pas dans Supabase

---

## 🐛 PROBLÈME IDENTIFIÉ

**Erreur dans Expo Go :**
```
column profiles.has_completed_onboarding does not exist
```

**Cause :** Le script SQL `006-farm-settings-tasks.sql` n'a pas été exécuté dans Supabase, ou les colonnes n'ont pas été créées.

---

## ✅ SOLUTION

### 1. Script SQL à exécuter dans Supabase

**Fichier :** `scripts/008-fix-profiles-columns.sql`

Ce script ajoute toutes les colonnes manquantes :
- `has_completed_onboarding` (BOOLEAN, default false)
- `onboarding_data` (JSONB)
- `subscription_tier` (TEXT, default 'free')

**Instructions :**
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Copier-coller le contenu de `scripts/008-fix-profiles-columns.sql`
4. Exécuter le script

---

### 2. Corrections appliquées dans le code

#### ✅ Service Onboarding (`porkyfarm-mobile/services/onboarding.ts`)

**Améliorations :**
- ✅ Gestion gracieuse de l'absence des colonnes
- ✅ Fallback avec `select('*')` si colonnes manquantes
- ✅ Ne bloque pas l'utilisateur si colonnes absentes
- ✅ Logs clairs pour identifier le problème

**Méthodes corrigées :**
- `checkOnboardingStatus()` : Fallback si colonnes manquantes
- `markOnboardingCompleted()` : Ne bloque pas si colonne absente
- `saveOnboardingData()` : Sauvegarde au moins `onboarding_data` même si `has_completed_onboarding` n'existe pas

#### ✅ Erreurs TypeScript corrigées

1. **Routes dynamiques** (`health/index.tsx`, `reproduction/index.tsx`) :
   - ✅ Ajout de `as any` pour les routes dynamiques non typées

2. **OfflineIndicator** :
   - ✅ Suppression du spread `...colors.errorLight` (non valide)

---

## 📋 CHECKLIST DE CORRECTION

### À faire dans Supabase :
- [ ] Exécuter `scripts/008-fix-profiles-columns.sql` dans SQL Editor
- [ ] Vérifier que les colonnes existent : `SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'`

### Vérifications dans l'app :
- [ ] Relancer Expo Go
- [ ] Vérifier que l'onboarding fonctionne
- [ ] Vérifier que les logs ne montrent plus d'erreur "column does not exist"

---

## 🎯 RÉSULTAT ATTENDU

Après exécution du script SQL :
- ✅ Plus d'erreur "column does not exist"
- ✅ Onboarding fonctionne correctement
- ✅ `has_completed_onboarding` est sauvegardé
- ✅ `onboarding_data` est sauvegardé
- ✅ `subscription_tier` est disponible

---

## 📝 NOTES

**Comportement actuel (avant exécution du script) :**
- L'app ne bloque pas l'utilisateur
- Les données d'onboarding sont sauvegardées dans `onboarding_data`
- `has_completed_onboarding` est ignoré si la colonne n'existe pas
- Logs clairs pour identifier le problème

**Après exécution du script :**
- Toutes les fonctionnalités fonctionnent normalement
- Onboarding complet avec vérification de statut
- Pas de logs d'erreur

---

**✅ Corrections appliquées dans le code. Exécutez le script SQL dans Supabase pour résoudre complètement le problème.**

