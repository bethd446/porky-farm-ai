# 📦 Composants V0

Ce dossier contient les composants générés par V0 de Vercel.

## 📁 Structure

```
v0/
├── dashboard/     # Composants pour le Dashboard
├── auth/          # Composants pour l'authentification
├── pigs/          # Composants pour la gestion des porcs
└── shared/        # Composants partagés
```

## 🔄 Processus d'intégration

1. **Copier le code V0** dans le dossier approprié
2. **Adapter les imports** selon le guide d'intégration
3. **Tester** le composant isolément
4. **Intégrer** dans la page correspondante
5. **Vérifier** que tout fonctionne avec Supabase

## ⚠️ Important

- Toujours utiliser `useAuth()` pour l'authentification
- Toujours utiliser `supabase` depuis `@/integrations/supabase/client`
- Toujours utiliser les types depuis `@/types/database`
- Respecter le design system OKLCH

