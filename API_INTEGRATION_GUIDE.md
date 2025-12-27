# Guide d'intégration des APIs externes - PorkyFarm

Ce document décrit l'intégration des 4 APIs externes dans PorkyFarm : Météo, Cartes/Géocodage, SMS et Analytics.

## 📋 Configuration des variables d'environnement

### Backend (Next.js) - `.env.local`

```env
# Météo - OpenWeatherMap
OPENWEATHER_API_KEY=votre_clé_openweather

# Cartes - Mapbox
MAPBOX_ACCESS_TOKEN=votre_token_mapbox

# SMS - Twilio
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_FROM_NUMBER=+2250123456789

# Analytics - PostHog
POSTHOG_API_KEY=votre_clé_posthog
POSTHOG_HOST=https://app.posthog.com

# Feature Flags (optionnel)
ENABLE_WEATHER=true
ENABLE_SMS=true
ENABLE_ANALYTICS=true
```

### Mobile (Expo) - `porkyfarm-mobile/.env.local`

```env
# Backend API
EXPO_PUBLIC_API_URL=http://localhost:3000
# ou en production: https://www.porkyfarm.app

# PostHog (optionnel, si utilisé côté client)
EXPO_PUBLIC_POSTHOG_KEY=votre_clé_posthog
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**⚠️ Important** : Ne jamais exposer les clés secrètes (OpenWeather, Twilio, Mapbox) dans `EXPO_PUBLIC_*`. Tous les appels se font via le backend.

## 🔧 Services backend créés

### 1. Service Météo (`lib/services/weather.ts`)

- **API utilisée** : OpenWeatherMap (Current Weather + One Call 3.0)
- **Fonction principale** : `getWeatherForFarm(lat, lon)`
- **Retourne** : Température, humidité, vent, condition, icône, alertes météo

### 2. Service Géocodage (`lib/services/geocoding.ts`)

- **API utilisée** : Mapbox Geocoding API
- **Fonctions** :
  - `geocodeAddress(address)` : Adresse → Coordonnées
  - `reverseGeocode(lat, lon)` : Coordonnées → Adresse

### 3. Service SMS (`lib/services/sms.ts`)

- **API utilisée** : Twilio SMS API
- **Fonction principale** : `sendAlertSms(to, message)`
- **Format numéro** : E.164 (ex: +2250123456789)
- **Helper** : `formatPhoneNumber(phone)` pour formater automatiquement

### 4. Service Analytics (`lib/services/analytics.ts`)

- **API utilisée** : PostHog
- **Fonctions** :
  - `trackEvent(userId, event, properties)` : Événement unique
  - `trackBatch(events)` : Plusieurs événements en batch
- **Événements prédéfinis** : `AnalyticsEvents` (ANIMAL_CREATED, HEALTH_CASE_CRITICAL, etc.)

## 🌐 Routes API créées

### `/api/weather` (GET)

**Paramètres** :
- `lat` : Latitude (requis)
- `lon` : Longitude (requis)

**Réponse** :
```json
{
  "data": {
    "temperature": 28,
    "humidity": 75,
    "windSpeed": 15,
    "condition": "Nuageux",
    "icon": "⛅",
    "location": "Abidjan",
    "alerts": [...]
  }
}
```

### `/api/geocode` (POST)

**Body** :
```json
{
  "address": "Abidjan, Côte d'Ivoire"
}
// ou
{
  "lat": 5.359952,
  "lon": -4.008256
}
```

**Réponse** :
```json
{
  "data": {
    "lat": 5.359952,
    "lon": -4.008256,
    "address": "Abidjan, Côte d'Ivoire",
    "placeName": "Abidjan"
  }
}
```

### `/api/alerts/send-sms` (POST)

**Body** :
```json
{
  "to": "+2250123456789",
  "message": "Alerte: Cas santé critique",
  "alertType": "health_critical"
}
```

**Réponse** :
```json
{
  "success": true,
  "messageId": "SM1234567890"
}
```

## 📱 Intégration mobile

### Widget Météo

Le composant `WeatherWidget` est intégré dans le dashboard mobile (`app/(tabs)/index.tsx`).

**Utilisation** :
```tsx
import { WeatherWidget } from '../../components/WeatherWidget'

<WeatherWidget />
```

Le widget :
- Appelle `/api/weather` via le backend
- Affiche température, condition, vent, humidité
- Affiche une alerte si température > 35°C

## 🎯 Points d'intégration analytics

Le tracking analytics est automatiquement ajouté dans :

1. **Création d'animal** (`/api/animals` POST) → `ANIMAL_CREATED`
2. **Création cas santé** (`/api/health-cases` POST) → `HEALTH_CASE_CREATED` ou `HEALTH_CASE_CRITICAL`
3. **Création gestation** (`/api/gestations` POST) → `GESTATION_CREATED`
4. **Utilisation IA** (`/api/chat` POST) → `AI_CHAT_USED` ou `AI_CHAT_ERROR`
5. **Envoi SMS** (`/api/alerts/send-sms` POST) → `SMS_SENT` ou `SMS_FAILED`

## 🚨 SMS automatiques pour alertes critiques

Les SMS sont automatiquement envoyés lorsque :

- Un cas de santé avec priorité `high` ou `critical` est créé
- Le numéro de téléphone est disponible dans le profil utilisateur (`profiles.phone`)

**Format du message SMS** :
```
🚨 Alerte PorkyFarm: Cas santé critique - [Problème] - [Animal]. Détails: [Description]
```

## 🧪 Scénario de test

1. **Configurer les clés API** :
   - Créer un compte OpenWeatherMap → obtenir `OPENWEATHER_API_KEY`
   - Créer un compte Mapbox → obtenir `MAPBOX_ACCESS_TOKEN`
   - Créer un compte Twilio → obtenir `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
   - Créer un compte PostHog → obtenir `POSTHOG_API_KEY`

2. **Mettre à jour `.env.local`** (backend) avec les vraies clés

3. **Tester la météo** :
   - Ouvrir le dashboard web → widget météo doit s'afficher
   - Ouvrir le dashboard mobile → widget météo doit s'afficher
   - Vérifier que les données météo sont correctes

4. **Tester le géocodage** :
   - Appeler `/api/geocode` avec une adresse → doit retourner des coordonnées
   - Appeler `/api/geocode` avec des coordonnées → doit retourner une adresse

5. **Tester les SMS** :
   - Créer un cas de santé avec priorité `high` ou `critical`
   - Vérifier que le SMS est envoyé au numéro du profil
   - Vérifier dans Twilio Console que le message est bien parti

6. **Tester l'analytics** :
   - Créer un animal → vérifier dans PostHog que l'événement `animal_created` apparaît
   - Utiliser l'IA → vérifier que `ai_chat_used` apparaît
   - Créer un cas santé critique → vérifier que `health_case_critical` et `sms_sent` apparaissent

## 🔒 Sécurité

- ✅ Toutes les clés secrètes sont côté backend uniquement
- ✅ L'app mobile n'appelle jamais directement les APIs externes
- ✅ Toutes les routes API vérifient l'authentification
- ✅ Les numéros de téléphone sont partiellement masqués dans les logs analytics

## 📝 Notes

- Les services sont conçus pour ne pas bloquer l'application si une API externe échoue
- En mode développement, les erreurs analytics sont loggées mais n'interrompent pas le flux
- Les SMS ne sont envoyés que si Twilio est configuré et si le profil utilisateur contient un numéro

