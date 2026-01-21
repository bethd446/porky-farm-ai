# ✅ CHECKLIST PRÉ-BETA - PORKYFARM

## 🔒 SÉCURITÉ SUPABASE

### Script SQL à exécuter
- [ ] Exécuter `scripts/030-fix-supabase-security-alerts.sql` dans Supabase SQL Editor
- [ ] Vérifier que toutes les fonctions ont `SET search_path = public`
- [ ] Vérifier que les index dupliqués sont supprimés
- [ ] Vérifier qu'il n'y a qu'une seule policy RLS par table
- [ ] Vérifier que RLS est activé sur toutes les tables
- [ ] Vérifier dans Supabase Dashboard → Advisors → Security : **0 alertes**

### Vérifications manuelles
```sql
-- Vérifier les fonctions
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_updated_at_column', 'get_gestation_alerts', 'get_health_stats', 'get_dashboard_stats');

-- Vérifier les policies (doit être 1 par table)
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 1;

-- Vérifier RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

---

## 📱 FRONTEND - ÉCRANS CRUD

### Coûts & Dépenses
- [ ] `app/(tabs)/costs/index.tsx` - Liste avec filtres par catégorie
- [ ] `app/(tabs)/costs/add.tsx` - Formulaire d'ajout complet
- [ ] `app/(tabs)/costs/[id].tsx` - Détail avec édition et suppression
- [ ] Pull-to-refresh fonctionnel
- [ ] Gestion d'erreurs visible
- [ ] Empty state avec bouton d'action
- [ ] Total des dépenses affiché

### Détail Animal
- [ ] `app/(tabs)/livestock/[id].tsx` - Édition complète
- [ ] Modification nom, poids, notes
- [ ] Ajout/suppression de tags
- [ ] Upload/modification photo
- [ ] Actions rapides (cas santé, gestation, dépense)
- [ ] Suppression avec confirmation

### Recherche par Tags
- [ ] Champ de recherche dans `app/(tabs)/livestock/index.tsx`
- [ ] Filtrage par tags fonctionnel
- [ ] Affichage des tags sur les cartes animaux

---

## 📧 CONFIGURATION EMAILS

### Supabase Dashboard
- [ ] Aller dans **Authentication > Settings**
- [ ] Activer **Enable email confirmations**
- [ ] Configurer **Email template** → **Confirm signup**
- [ ] Tester l'inscription → Vérifier réception email

### Template Email Recommandé
```
Subject: Confirmez votre inscription à PorkyFarm

Body HTML:
<h2>Bienvenue sur PorkyFarm ! 🐷</h2>
<p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Confirmer mon email</a></p>
<p>Ce lien expire dans 24 heures.</p>
<p>À bientôt sur PorkyFarm !</p>
```

---

## 🖼️ INTÉGRATION IMAGES

### Structure Assets
- [ ] Images copiées dans `assets/images/`
- [ ] `assets/images/backgrounds/farm-background.jpg` (si disponible)
- [ ] `assets/images/reproduction/sow-nursing.jpg` (si disponible)
- [ ] `assets/images/animals/piglets-group.jpg` (si disponible)

### Mise à jour constants/assets.ts
- [ ] Ajouter `BackgroundImages` dans `constants/assets.ts`
- [ ] Ajouter `ReproductionImages` dans `constants/assets.ts`
- [ ] Ajouter `AnimalImages` dans `constants/assets.ts`
- [ ] Vérifier que tous les `require()` fonctionnent

---

## 🧪 TESTS FONCTIONNELS

### Authentification
- [ ] Inscription → Email reçu
- [ ] Clic sur lien confirmation → Compte activé
- [ ] Connexion avec email confirmé → Dashboard affiché
- [ ] Déconnexion → Retour à l'écran login

### CRUD Animaux
- [ ] Ajout animal → Visible dans liste
- [ ] Édition animal → Modifications sauvegardées
- [ ] Ajout tag → Tag visible sur l'animal
- [ ] Recherche par tag → Animal trouvé
- [ ] Suppression animal → Retiré de la liste

### CRUD Coûts
- [ ] Ajout dépense → Visible dans liste
- [ ] Filtrage par catégorie → Filtre appliqué
- [ ] Total calculé correctement
- [ ] Édition dépense → Modifications sauvegardées
- [ ] Suppression dépense → Retirée de la liste

### Navigation
- [ ] Toutes les navigations fonctionnent
- [ ] Boutons retour fonctionnent
- [ ] Deep links fonctionnent (ex: `/livestock/[id]`)

---

## 🔧 CONFIGURATION TECHNIQUE

### TypeScript
- [ ] `npx tsc --noEmit` → 0 erreurs
- [ ] Tous les types correctement définis
- [ ] Pas de `any` non nécessaires

### Variables d'environnement
- [ ] `eas.json` contient les variables Supabase
- [ ] `.env.local` existe (local uniquement)
- [ ] Variables testées en local

### Build
- [ ] `eas build:configure` exécuté
- [ ] Profils de build configurés (development, preview, production)
- [ ] `eas.json` validé

---

## 📊 MÉTRIQUES FINALES

| Métrique | Cible | État |
|----------|-------|------|
| Alertes Supabase | 0 | ⬜ |
| Écrans CRUD complets | 100% | ⬜ |
| Erreurs TypeScript | 0 | ⬜ |
| Tests fonctionnels | 100% | ⬜ |
| Emails confirmation | ✅ | ⬜ |
| Images intégrées | ✅ | ⬜ |

---

## 🚀 COMMANDES FINALES

```bash
cd /Users/desk/Desktop/porky-farm-ai-V1/porkyfarm-mobile

# 1. Vérifier TypeScript
npx tsc --noEmit

# 2. Tester localement
npx expo start -c

# 3. Build APK beta
eas build --platform android --profile preview --clear-cache

# 4. Build iOS (si compte Apple)
eas build --platform ios --profile preview
```

---

## 📝 NOTES

- Tester chaque fonctionnalité après chaque correction
- Faire des commits Git fréquents
- Documenter les problèmes rencontrés
- Vérifier les performances sur device réel

---

**Date de complétion:** _______________
**Build beta créé:** ⬜ Oui ⬜ Non
**Prêt pour déploiement:** ⬜ Oui ⬜ Non

