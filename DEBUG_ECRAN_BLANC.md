# Guide de débogage - Écran blanc après connexion/inscription

## ✅ Corrections appliquées

1. **ErrorBoundary ajouté** : Capture les erreurs JavaScript qui causent l'écran blanc
2. **Gestion des redirections améliorée** : Évite les redirections multiples
3. **Gestion d'erreurs Dashboard** : Meilleure gestion des erreurs de chargement

## 🔍 Comment identifier le problème

### 1. Ouvrir la console du navigateur

**Chrome/Edge :**
- `F12` ou `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Onglet "Console"

**Firefox :**
- `F12` ou `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)

### 2. Vérifier les erreurs

Recherchez des erreurs en rouge dans la console après connexion/inscription :

#### Erreurs courantes :

**A. Erreur Supabase (variables d'environnement)**
```
❌ VITE_SUPABASE_URL is missing
```
**Solution :** Vérifiez que `.env` contient les bonnes variables

**B. Erreur de réseau**
```
Failed to fetch
NetworkError
```
**Solution :** Vérifiez votre connexion internet et les CORS Supabase

**C. Erreur de redirection**
```
Cannot read property 'id' of null
```
**Solution :** Problème de session utilisateur

**D. Erreur de composant**
```
Cannot read property 'map' of undefined
```
**Solution :** Problème dans un composant (Dashboard, etc.)

### 3. Vérifier les logs de navigation

Dans la console, vous devriez voir :
```
Auth state changed: SIGNED_IN [user-id]
User authenticated, redirecting to dashboard
```

Si vous ne voyez pas ces logs, le problème vient de l'authentification.

## 🔧 Solutions selon le problème

### Problème 1 : Variables d'environnement manquantes

**Vérification :**
```bash
# Dans le terminal
cd /Users/desk/Desktop/PorcPro
cat .env
```

**Doit contenir :**
```
VITE_SUPABASE_URL=https://mqojrnmryxiggcomfpfx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Solution :** Créez/modifiez `.env` avec les bonnes valeurs

### Problème 2 : Configuration Supabase Auth

**Vérification :**
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Authentication > URL Configuration**
4. Vérifiez que les URLs suivantes sont autorisées :
   - `http://localhost:8080`
   - `http://localhost:8080/**`
   - `https://votre-domaine.vercel.app`
   - `https://votre-domaine.vercel.app/**`

### Problème 3 : Email confirmation activée

Si l'email confirmation est activée dans Supabase :
- Après inscription, l'utilisateur n'est pas automatiquement connecté
- Il doit cliquer sur le lien dans l'email
- C'est normal que l'écran reste sur la page d'inscription

**Solution :** Désactiver temporairement l'email confirmation pour tester :
1. Supabase Dashboard > Authentication > Settings
2. Désactiver "Enable email confirmations"

### Problème 4 : Problème de domaine (Vercel)

Si vous êtes sur Vercel et que ça ne fonctionne pas :

1. **Vérifier les variables d'environnement Vercel :**
   - Allez sur Vercel Dashboard > Votre projet > Settings > Environment Variables
   - Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont définies

2. **Vérifier les URLs de redirection Supabase :**
   - Ajoutez votre domaine Vercel dans les URLs autorisées

3. **Redéployer :**
   ```bash
   git add .
   git commit -m "fix: corrections écran blanc"
   git push origin main
   ```

## 🧪 Test de débogage

Ajoutez ces logs temporaires pour déboguer :

### Dans `src/hooks/useAuth.tsx` (ligne 58) :
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    console.log('🔐 Auth event:', event);
    console.log('👤 Session:', session ? 'exists' : 'null');
    console.log('🆔 User ID:', session?.user?.id);
    // ... reste du code
  }
);
```

### Dans `src/pages/Dashboard.tsx` (début de la fonction) :
```typescript
export default function Dashboard() {
  const { user } = useAuth();
  console.log('📊 Dashboard render - User:', user ? user.id : 'null');
  // ... reste du code
}
```

## 📋 Checklist de vérification

- [ ] Console du navigateur ouverte
- [ ] Pas d'erreurs rouges dans la console
- [ ] Variables d'environnement correctes (`.env` ou Vercel)
- [ ] URLs Supabase configurées correctement
- [ ] Email confirmation désactivée (pour test)
- [ ] Redémarrage du serveur après modifications

## 🆘 Si le problème persiste

1. **Capturez une capture d'écran** de la console avec les erreurs
2. **Vérifiez le réseau** dans les DevTools (onglet Network)
3. **Testez en local** d'abord avant de déployer sur Vercel
4. **Vérifiez les logs Supabase** dans le dashboard

---

**Note :** L'ErrorBoundary devrait maintenant afficher un message d'erreur au lieu d'un écran blanc, ce qui vous aidera à identifier le problème exact.

