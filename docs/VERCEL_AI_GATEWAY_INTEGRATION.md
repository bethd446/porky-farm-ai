# 🚀 Intégration Vercel AI Gateway - PorkyFarm

**Date** : 2025-01-27  
**Objectif** : Intégrer Vercel AI Gateway comme couche d'abstraction IA pour PorkyFarm

---

## 📋 Vue d'ensemble

Vercel AI Gateway est maintenant intégré dans PorkyFarm pour :
- Centraliser l'accès aux modèles IA (OpenAI, Anthropic, etc.)
- Monitoring et contrôle des coûts
- Rate limiting et caching
- Fallback automatique si Gateway indisponible

---

## 🔧 Configuration

### Variables d'environnement

**Local (`.env.local`)** :
```env
# Vercel AI Gateway (prioritaire)
VERCEL_AI_GATEWAY_API_KEY=vck_5lVY3Tx2ohZijtHbpqKxRWpqxtCaGKn08XpGDdrh64IlZRX0vh43xC0Y

# OpenAI (fallback si Gateway non configuré)
OPENAI_API_KEY=sk-...

# Supabase (pour service role key, recommandations)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Vercel (Dashboard → Settings → Environment Variables)** :
- Ajouter `VERCEL_AI_GATEWAY_API_KEY` avec la même valeur
- Ne jamais exposer cette clé côté client

---

## 📁 Structure des Fichiers

### Nouveaux fichiers créés

```
lib/ai/
  ├── client.ts          # Client AI Gateway + modèles
  └── prompts.ts         # Prompts système métier

app/api/ai/
  ├── chat/route.ts            # Chat IA (streaming)
  ├── analyze-photo/route.ts   # Analyse Vision IA
  ├── recommendations/route.ts # Recommandations élevage
  └── report/route.ts           # Rapports mensuels (post-MVP)

components/ai/
  ├── ChatBot.tsx        # Composant chat amélioré (useChat)
  └── PhotoAnalyzer.tsx  # Composant analyse photo
```

---

## 🔌 Endpoints API

### 1. `/api/ai/chat` (POST)

**Description** : Chat IA avec streaming, remplace/enveloppe `/api/chat`

**Body** :
```json
{
  "messages": [
    { "role": "user", "content": "Quelle ration pour une truie gestante ?" }
  ],
  "livestockContext": "Élevage de 50 animaux...",
  "hasImage": false
}
```

**Response** : Stream de données (via `useChat` du SDK AI)

**Exemple curl** :
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Bonjour"}],
    "hasImage": false
  }'
```

---

### 2. `/api/ai/analyze-photo` (POST)

**Description** : Analyse d'image via Vision IA

**Body** :
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "animalType": "sow",
  "context": "L'animal tousse depuis 2 jours"
}
```

**Response** :
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

**Exemple curl** :
```bash
# Convertir image en base64 d'abord
IMAGE_BASE64=$(base64 -i photo.jpg)

curl -X POST http://localhost:3000/api/ai/analyze-photo \
  -H "Content-Type: application/json" \
  -d "{
    \"imageBase64\": \"data:image/jpeg;base64,$IMAGE_BASE64\",
    \"animalType\": \"sow\"
  }"
```

---

### 3. `/api/ai/recommendations` (GET)

**Description** : Recommandations élevage basées sur données Supabase

**Response** :
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

**Exemple curl** :
```bash
curl -X GET http://localhost:3000/api/ai/recommendations \
  -H "Cookie: sb-access-token=..."
```

---

### 4. `/api/ai/report` (POST)

**Description** : Génération rapport mensuel (post-MVP)

**Body** :
```json
{
  "month": 1,
  "year": 2025
}
```

**Response** :
```json
{
  "success": true,
  "report": "# Rapport Mensuel\n\n...",
  "month": 1,
  "year": 2025
}
```

---

## 🎨 Composants Frontend

### `ChatBot` (composant amélioré)

Utilise `useChat` du SDK AI pour le streaming automatique :

```tsx
import { ChatBot } from "@/components/ai/ChatBot"

<ChatBot 
  initialContext="Élevage de 50 animaux..."
  userRole="farmer"
/>
```

### `PhotoAnalyzer`

Composant pour upload et analyse d'images :

```tsx
import { PhotoAnalyzer } from "@/components/ai/PhotoAnalyzer"

<PhotoAnalyzer 
  onAnalysisComplete={(analysis) => {
    console.log("Analyse:", analysis)
  }}
/>
```

---

## 🔄 Migration depuis `/api/chat`

L'ancien endpoint `/api/chat` continue de fonctionner pour compatibilité.

**Pour migrer progressivement** :

1. **Web** : Remplacer `fetch("/api/chat")` par `useChat({ api: "/api/ai/chat" })`
2. **Mobile** : Adapter `apiClient.post("/api/chat")` vers `/api/ai/chat` (mais pas de streaming côté mobile pour l'instant)

---

## 🧪 Tests

### Test Chat

```bash
# Test simple
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Bonjour"}]}'
```

### Test Analyse Photo

```bash
# Convertir image en base64
IMAGE_BASE64=$(base64 -i test-photo.jpg | tr -d '\n')

curl -X POST http://localhost:3000/api/ai/analyze-photo \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d "{
    \"imageBase64\": \"data:image/jpeg;base64,$IMAGE_BASE64\",
    \"animalType\": \"sow\"
  }"
```

### Test Recommandations

```bash
curl -X GET http://localhost:3000/api/ai/recommendations \
  -H "Cookie: sb-access-token=..."
```

---

## ✅ Checklist de Validation

### Configuration

- [ ] `VERCEL_AI_GATEWAY_API_KEY` ajoutée dans `.env.local`
- [ ] `VERCEL_AI_GATEWAY_API_KEY` ajoutée dans Vercel Dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurée (pour recommandations)

### Tests

- [ ] Chat fonctionne (`/api/ai/chat`)
- [ ] Analyse photo fonctionne (`/api/ai/analyze-photo`)
- [ ] Recommandations fonctionnent (`/api/ai/recommendations`)
- [ ] Fallback vers OpenAI direct si Gateway indisponible
- [ ] Rate limiting fonctionne
- [ ] Quotas quotidiens fonctionnent

### Frontend

- [ ] Composant `ChatBot` fonctionne avec streaming
- [ ] Composant `PhotoAnalyzer` fonctionne
- [ ] Gestion d'erreurs claire pour l'utilisateur

### Monitoring

- [ ] Vérifier usage dans Vercel AI Gateway Dashboard
- [ ] Vérifier coûts dans OpenAI Dashboard
- [ ] Vérifier logs dans Vercel Dashboard

---

## 🚨 Points d'Attention

### 1. Clé API Gateway

⚠️ **NE JAMAIS** exposer `VERCEL_AI_GATEWAY_API_KEY` côté client.  
✅ Toujours utiliser `process.env.VERCEL_AI_GATEWAY_API_KEY` côté serveur uniquement.

### 2. Fallback OpenAI

Si `VERCEL_AI_GATEWAY_API_KEY` n'est pas configurée, le système utilise `OPENAI_API_KEY` directement (comportement existant).

### 3. Service Role Key

Pour `/api/ai/recommendations`, la clé `SUPABASE_SERVICE_ROLE_KEY` est nécessaire pour accéder à toutes les données (bypass RLS).  
⚠️ Cette clé ne doit JAMAIS être exposée côté client.

### 4. Streaming vs Non-streaming

- `/api/ai/chat` : Streaming (utilise `streamText` + `useChat`)
- `/api/ai/analyze-photo` : Non-streaming (utilise `generateText`)
- `/api/ai/recommendations` : Non-streaming
- `/api/ai/report` : Non-streaming

---

## 📊 Monitoring Vercel AI Gateway

1. Accéder à [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet PorkyFarm
3. Onglet "AI Gateway" → Voir usage, coûts, requêtes

---

## 🔄 Prochaines Étapes

1. **Migrer progressivement** le frontend vers `/api/ai/chat`
2. **Tester sur mobile** (adapter pour non-streaming si nécessaire)
3. **Ajouter cache** pour recommandations (éviter recalculs fréquents)
4. **Implémenter table `ai_recommendations`** pour stocker les analyses

---

**Dernière mise à jour** : 2025-01-27  
**Maintenu par** : Tech Lead PorkyFarm

