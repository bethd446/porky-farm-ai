# 🐷 PORKYFARM - Mémoire de Travail Claude

## 📅 Dernière mise à jour
2026-01-XX - Session MEGA PROMPT V2.0 - Script SQL 035 exécuté ✅

## 🎯 Objectif
Application de gestion d'élevage porcin pour le marché africain.
Stack: React Native + Expo SDK 52 + Supabase
Langue UI: Français | Monnaie: FCFA (XOF)

## ✅ Corrigé
- [x] RLS Supabase configuré (script 035) - 14 policies créées
- [x] Logger conditionnel implémenté
- [x] EmptyState utilise des icônes (pas d'emojis)
- [x] Console.log remplacés par logger dans les écrans principaux
- [x] Erreur user_id corrigée (user_id rendu nullable sur pigs)
- [x] Index performance créés (15 index sur farm_id et colonnes clés)
- [x] AnimalAvatar avec photos (composant existant et fonctionnel)
- [x] Timeout useData augmenté à 15s
- [x] Storage bucket 'animals' configuré avec policies
- [x] Triggers updated_at créés (pigs, costs, tasks)

## 🔧 En cours
- [x] Exécution script SQL complet ✅
- [x] Correction service animals (ne pas envoyer user_id) ✅
- [ ] Module tâches avec notifications (partiellement fait)
- [x] Photos animaux dans liste (AnimalAvatar utilisé) ✅
- [ ] Module coûts complet (CRUD à finaliser)

## ✅ Design Premium 2026 (Session actuelle)
- [x] Design tokens créés (`lib/theme/tokens.ts`)
- [x] ThemeContext avec dark mode auto
- [x] Config animations Lottie (15 animations)
- [x] FeedbackAnimations (Success, Error, Confetti, Toast)
- [x] GlassCard avec glassmorphism
- [x] AlertCard avec pulse animation
- [x] Dashboard intégré avec AlertBanner/AlertCard
- [x] Health filter + badges sur Mon Cheptel

## ❌ À faire
- [ ] Télécharger fichiers Lottie JSON depuis LottieFiles
- [ ] Tests E2E
- [ ] CRUD complet pour tous les modules

## 📋 Règles
1. Toujours utiliser farm_id (pas user_id) pour les animaux
2. Timeout 15s sur tous les chargements
3. Une seule policy RLS par table (FOR ALL)
4. Design system: vert #10B981
5. Logger conditionnel pour production

## ⚠️ Ne pas faire
- Ne JAMAIS supprimer les policies RLS
- Ne JAMAIS exposer de clés API
- Ne JAMAIS ignorer les erreurs Supabase
- Ne JAMAIS créer plusieurs policies par table

## 🐛 Erreurs connues
1. ~~Permission denied (42501) sur gestations~~ → ✅ CORRIGÉ (RLS configuré)
2. ~~user_id NOT NULL violation~~ → ✅ CORRIGÉ (user_id nullable)
3. ~~Skeleton loading infini~~ → ✅ CORRIGÉ (Timeout 15s)
4. ~~Performance lente~~ → ✅ CORRIGÉ (15 index créés)

## 📊 Progression
- SQL: 100% ✅ (Script 035 + fix sex CHECK constraint)
- Frontend: 90% (Logger, EmptyState, AnimalAvatar, useData timeout, animals service corrigé, formulaire validé)
- Tests: 0% (À faire)

## ✅ Actions terminées aujourd'hui
1. ✅ Script SQL 035 exécuté (RLS, index, triggers, storage)
2. ✅ Service animals.ts corrigé (user_id retiré, logger ajouté)
3. ✅ Timeout useData augmenté à 15s
4. ✅ Tous les console.error remplacés par logger dans animals.ts
5. ✅ Service notifications.ts corrigé (NotificationBehavior complet)
6. ✅ Formulaire ajout animal corrigé (validation, trim, messages d'erreur)
7. ✅ CLAUDE.md créé et mis à jour

## 🐛 Erreurs corrigées (ajout animal)
1. ✅ Validation du tag_number (trim, non vide, maxLength 50)
2. ✅ Validation du poids (nombre positif, max 1000kg)
3. ✅ S'assurer que sex n'est jamais null (NOT NULL constraint)
4. ✅ S'assurer que identifier = tag_number (NOT NULL constraint)
5. ✅ **Contrainte CHECK sur sex corrigée** (accepte maintenant 'unknown')
6. ✅ Messages d'erreur plus explicites (duplicate, null value, permission, CHECK)
7. ✅ Trim sur tous les champs texte (name, breed, notes)
8. ✅ MaxLength sur les champs texte pour éviter les erreurs DB
9. ✅ Logger amélioré avec détails complets des erreurs Supabase

## 🔧 Corrections mineures (2.0.76)
1. ✅ CostItem.tsx - Utilise cost_date (avec fallback transaction_date)
2. ✅ plus/taches.tsx - Cast route "as any" déjà présent
3. ✅ ai-assistant.tsx - icon="bulb-outline" déjà présent
4. ✅ livestock/index.tsx - type="cheptel" déjà présent

## 🐛 Erreur chargement symptômes corrigée
1. ✅ **Politique RLS créée pour symptoms** (lecture publique pour données de référence)
2. ✅ **Politique RLS créée pour diseases** (lecture publique pour données de référence)
3. ✅ Tous les `console.error` remplacés par `logger.error` dans `healthPro.ts` (8 occurrences)
4. ✅ Tous les `console.error` remplacés par `logger.error` dans `add.tsx` (5 occurrences)
5. ✅ Gestion d'erreur améliorée : fallback silencieux si symptômes ne se chargent pas (l'app fonctionne sans)

## 🎨 Remplacement ActivityIndicator par composants Lottie (2.0.76)
1. ✅ **3 ActivityIndicator remplacés** dans `health/add.tsx` :
   - Chargement initial → `LoadingScreen` (plein écran)
   - Chargement symptômes → `LoadingInline` (inline)
   - Bouton sauvegarde → `LoadingInline` (inline)
2. ✅ Import `ActivityIndicator` retiré (plus utilisé)
3. ✅ Composants `LoadingScreen` et `LoadingInline` utilisés (avec fallback ActivityIndicator si Lottie non disponible)

## 📝 Notes techniques
- **RLS**: 14 policies créées (une par table, FOR ALL)
- **Index**: 15 index créés pour performance (farm_id, status, category, etc.)
- **Storage**: Bucket 'animals' configuré (5MB max, jpeg/png/webp)
- **Triggers**: updated_at automatique sur pigs, costs, tasks
- **Fonctions**: get_gestation_alerts() et get_dashboard_stats() créées

