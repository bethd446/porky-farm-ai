# 🧪 Tests Vercel AI Gateway - PorkyFarm

**Date** : 2025-01-27  
**Objectif** : Commandes de test pour valider l'intégration Vercel AI Gateway

---

## 🔧 Prérequis

1. **Variables d'environnement configurées** :
   ```bash
   # .env.local
   VERCEL_AI_GATEWAY_API_KEY=vck_5lVY3Tx2ohZijtHbpqKxRWpqxtCaGKn08XpGDdrh64IlZRX0vh43xC0Y
   OPENAI_API_KEY=sk-...  # Fallback
   SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Pour recommandations
   ```

2. **Serveur Next.js démarré** :
   ```bash
   npm run dev
   ```

3. **Session Supabase active** (pour tests authentifiés) :
   - Se connecter sur `http://localhost:3000`
   - Récupérer le cookie `sb-access-token` depuis les DevTools

---

## 📝 Tests des Endpoints

### 1. Test Chat IA (`/api/ai/chat`)

#### Test simple (non authentifié)

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Quelle ration pour une truie gestante de 200kg ?"}
    ],
    "hasImage": false
  }'
```

**Résultat attendu** : Stream de données (format AI SDK)

#### Test avec contexte d'élevage

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Comment améliorer mon élevage ?"}
    ],
    "livestockContext": "Élevage de 50 animaux: 20 truies, 2 verrats, 15 porcelets, 13 porcs",
    "hasImage": false
  }'
```

#### Test avec image (Vision IA)

```bash
# Convertir image en base64
IMAGE_BASE64=$(base64 -i test-photo.jpg | tr -d '\n')

curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"Que voyez-vous sur cette image ?\",
        \"image\": \"data:image/jpeg;base64,$IMAGE_BASE64\"
      }
    ],
    \"hasImage\": true
  }"
```

---

### 2. Test Analyse Photo (`/api/ai/analyze-photo`)

#### Test simple

```bash
# Convertir image en base64
IMAGE_BASE64=$(base64 -i test-photo.jpg | tr -d '\n')

curl -X POST http://localhost:3000/api/ai/analyze-photo \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d "{
    \"imageBase64\": \"data:image/jpeg;base64,$IMAGE_BASE64\",
    \"animalType\": \"sow\",
    \"context\": \"L'animal tousse depuis 2 jours\"
  }"
```

**Résultat attendu** :
```json
{
  "analysis": "Analyse structurée avec niveau d'urgence...",
  "timestamp": "2025-01-27T...",
  "usage": {
    "promptTokens": 1000,
    "completionTokens": 500,
    "totalTokens": 1500
  }
}
```

#### Test sans authentification (doit échouer)

```bash
curl -X POST http://localhost:3000/api/ai/analyze-photo \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,..."
  }'
```

**Résultat attendu** : `401 Unauthorized`

---

### 3. Test Recommandations (`/api/ai/recommendations`)

#### Test GET

```bash
curl -X GET http://localhost:3000/api/ai/recommendations \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

**Résultat attendu** :
```json
{
  "success": true,
  "analysis": {
    "summary": "...",
    "strengths": [...],
    "improvements": [...],
    "recommendations": [...]
  },
  "farmData": {
    "totalAnimals": 50,
    "activeHealthCases": 2,
    ...
  }
}
```

**Note** : Nécessite `SUPABASE_SERVICE_ROLE_KEY` pour accéder aux données.

---

### 4. Test Rapport (`/api/ai/report`)

#### Test POST

```bash
curl -X POST http://localhost:3000/api/ai/report \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "month": 1,
    "year": 2025
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "report": "# Rapport Mensuel\n\n...",
  "month": 1,
  "year": 2025,
  "timestamp": "2025-01-27T...",
  "usage": {...}
}
```

---

## 🧪 Tests Frontend

### Test Composant ChatBot

1. Ouvrir `http://localhost:3000/dashboard/ai-assistant`
2. Taper une question : "Quelle ration pour une truie gestante ?"
3. Vérifier que la réponse s'affiche en streaming
4. Vérifier qu'aucune erreur n'apparaît dans la console

### Test Composant PhotoAnalyzer

1. Créer une page de test ou intégrer dans un module existant
2. Uploader une image
3. Sélectionner le type d'animal
4. Cliquer sur "Analyser l'image"
5. Vérifier que l'analyse s'affiche

---

## 🔍 Vérifications

### 1. Vérifier que Vercel AI Gateway est utilisé

Dans les logs du serveur Next.js, chercher :
```
[AI Client] Using Vercel AI Gateway
```

Si la clé n'est pas configurée, vous verrez :
```
[AI Client] VERCEL_AI_GATEWAY_API_KEY non configurée. L'IA utilisera OpenAI directement.
```

### 2. Vérifier le fallback OpenAI

1. Retirer temporairement `VERCEL_AI_GATEWAY_API_KEY` de `.env.local`
2. Redémarrer le serveur
3. Tester `/api/ai/chat`
4. Vérifier que ça fonctionne quand même (via OpenAI direct)

### 3. Vérifier le rate limiting

```bash
# Faire 21 requêtes rapides (limite: 20/min)
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Test"}]}'
  echo "Request $i"
done
```

**Résultat attendu** : La 21ème requête doit retourner `429 Too Many Requests`

### 4. Vérifier les quotas quotidiens

1. Faire 50 requêtes IA (limite quotidienne)
2. Vérifier que la 51ème retourne `429` avec message de quota dépassé

---

## 📊 Monitoring

### Vercel AI Gateway Dashboard

1. Accéder à [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet PorkyFarm
3. Onglet "AI Gateway"
4. Vérifier :
   - Nombre de requêtes
   - Coûts
   - Latence moyenne
   - Erreurs

### Logs Next.js

Vérifier les logs pour :
- Erreurs de connexion
- Timeouts
- Erreurs de parsing

---

## ✅ Checklist de Validation

### Configuration

- [ ] `VERCEL_AI_GATEWAY_API_KEY` configurée
- [ ] `OPENAI_API_KEY` configurée (fallback)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurée (pour recommandations)

### Endpoints

- [ ] `/api/ai/chat` fonctionne (streaming)
- [ ] `/api/ai/analyze-photo` fonctionne (avec auth)
- [ ] `/api/ai/recommendations` fonctionne (avec auth)
- [ ] `/api/ai/report` fonctionne (avec auth)

### Sécurité

- [ ] Rate limiting fonctionne
- [ ] Quotas quotidiens fonctionnent
- [ ] Authentification requise pour endpoints sensibles
- [ ] Aucune clé API exposée côté client

### Frontend

- [ ] Composant `ChatBot` fonctionne avec streaming
- [ ] Composant `PhotoAnalyzer` fonctionne
- [ ] Gestion d'erreurs claire pour l'utilisateur

### Fallback

- [ ] Fallback vers OpenAI direct si Gateway indisponible
- [ ] Message d'avertissement si Gateway non configuré

---

## 🐛 Dépannage

### Erreur "AI Gateway API key not found"

**Solution** : Vérifier que `VERCEL_AI_GATEWAY_API_KEY` est dans `.env.local` et redémarrer le serveur.

### Erreur "401 Unauthorized" sur `/api/ai/analyze-photo`

**Solution** : Vérifier que vous êtes connecté et que le cookie `sb-access-token` est présent.

### Erreur "Service role key not found" sur `/api/ai/recommendations`

**Solution** : Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`.

### Streaming ne fonctionne pas

**Solution** : Vérifier que vous utilisez `useChat` du SDK AI, pas `fetch` direct.

---

**Dernière mise à jour** : 2025-01-27  
**Maintenu par** : Tech Lead PorkyFarm

