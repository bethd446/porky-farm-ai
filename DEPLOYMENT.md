# Guide de Deploiement PorkyFarm

## Pre-requis

- Compte Vercel (gratuit ou Pro)
- Projet Supabase configure
- Cle API OpenAI (pour l'assistant IA)

---

## 1. Variables d'environnement requises

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Cle publique Supabase |
| `OPENAI_API_KEY` | Secret | Cle API OpenAI (ne pas prefixer NEXT_PUBLIC_) |
| `NEXT_PUBLIC_APP_URL` | Public | URL de production (https://www.porkyfarm.app) |

---

## 2. Configuration Supabase

### Tables requises

Executez les scripts SQL dans l'ordre :
1. `scripts/001-create-tables.sql` - Tables principales
2. `scripts/001-admin-roles-setup.sql` - Systeme admin (optionnel)
3. `scripts/002-admin-policies-update.sql` - Policies RLS (optionnel)

### Authentication

1. Dans Supabase Dashboard > Authentication > URL Configuration
2. Ajoutez `https://www.porkyfarm.app` dans "Site URL"
3. Ajoutez `https://www.porkyfarm.app/auth/callback` dans "Redirect URLs"

---

## 3. Deploiement sur Vercel

### Option A : Via v0.app (Recommande)

1. Cliquez sur "Publish" dans l'interface v0
2. Suivez les instructions pour connecter votre compte Vercel
3. Configurez les variables d'environnement dans l'onglet "Vars"

### Option B : Via GitHub

1. Poussez le code vers un repo GitHub
2. Connectez le repo a Vercel : https://vercel.com/new
3. Configurez les variables d'environnement dans Settings > Environment Variables

### Option C : Via CLI

\`\`\`bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deployer (suivre les prompts)
vercel

# Deployer en production
vercel --prod
\`\`\`

---

## 4. Checklist avant mise en ligne

### Tests manuels

- [ ] Landing page s'affiche correctement
- [ ] Inscription fonctionne (verifier email de confirmation)
- [ ] Connexion fonctionne
- [ ] Dashboard s'affiche apres connexion
- [ ] Ajout d'un animal fonctionne
- [ ] Assistant IA repond
- [ ] Meteo s'affiche (geolocalisation)
- [ ] Deconnexion fonctionne

### SEO & Accessibilite

- [ ] Titres de pages uniques (deja configure)
- [ ] Meta descriptions presentes
- [ ] Images ont des attributs alt
- [ ] Contraste des couleurs suffisant
- [ ] Navigation au clavier fonctionne
- [ ] Site responsive (mobile/tablette)

### Performance

- [ ] Lighthouse score > 80 sur mobile
- [ ] Pas d'erreurs dans la console
- [ ] Images optimisees

### Securite

- [ ] Variables sensibles dans Vercel (pas dans le code)
- [ ] HTTPS actif (automatique sur Vercel)
- [ ] Headers de securite configures (vercel.json)

---

## 5. Domaine personnalise

1. Dans Vercel Dashboard > Settings > Domains
2. Ajoutez `porkyfarm.app` et `www.porkyfarm.app`
3. Configurez les DNS chez votre registrar :
   - Type A : `76.76.21.21`
   - Type CNAME (www) : `cname.vercel-dns.com`

---

## 6. Monitoring post-deploiement

### Vercel Analytics (inclus)

- Metriques de performance automatiques
- Core Web Vitals en temps reel

### Logs

- Vercel Dashboard > Logs pour voir les erreurs
- Filtrez par "Error" pour identifier les problemes

### Optionnel : Sentry

Pour un monitoring d'erreurs avance :
1. Creez un projet sur sentry.io
2. Ajoutez `SENTRY_DSN` dans les variables Vercel
3. Installez `@sentry/nextjs` si necessaire

---

## Support

- Documentation : `/guide`
- Contact : support@porkyfarm.app
