# Améliorations Smart Farming - PorcPro

## 🎨 Design inspiré de Smart Farming App

Inspiré du design [Smart Farming App Design](https://dribbble.com/shots/26012307-Smart-Farming-App-Design) de Safayet Hossain.

## ✨ Nouvelles fonctionnalités

### 1. 📍 Géolocalisation
- **Hook `useGeolocation`** : Accès à la position GPS de l'utilisateur
- **Intégration dans AddPigDialog** : Enregistrement automatique de la localisation lors de l'ajout d'un porc
- **Widget météo** : Utilise la localisation pour afficher les conditions météorologiques

### 2. 📷 Caméra
- **Hook `useCamera`** : Accès à la caméra pour capturer des photos
- **Composant `CameraCapture`** : Interface pour prendre des photos
- **Intégration dans AddPigDialog** : Onglet dédié pour ajouter une photo au porc
- **Gestion des permissions** : Demande automatique des permissions caméra

### 3. 🎤 Audio (en préparation)
- **Hook `useAudio`** : Enregistrement audio pour notes vocales
- **À venir** : Intégration dans les notes des porcs

### 4. 🌤️ Widget Météo
- **Composant `WeatherWidget`** : Affichage des conditions météorologiques
- **Données affichées** :
  - Température actuelle, maximale et minimale
  - Humidité, précipitations, pression, vent
  - Lever et coucher du soleil
  - Localisation GPS
- **Design moderne** : Gradient avec couleurs primaires

### 5. 🎨 Améliorations du design

#### Dashboard
- **Header personnalisé** : Salutation avec nom d'utilisateur et date
- **Widget météo** : Carte avec gradient et ombres douces
- **Animations** : Transitions fluides et hover effects

#### AddPigDialog
- **Onglets** : Organisation en 3 onglets (Informations, Photo, Localisation)
- **Interface moderne** : Design épuré avec bordures et ombres
- **Feedback visuel** : Indicateurs de statut pour photo et localisation

#### CSS amélioré
- **Classes utilitaires** : `.gradient-card`, `.modern-card`
- **Hover effects** : Scale et shadow améliorés
- **Transitions** : Animations plus fluides

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `src/hooks/useGeolocation.ts` - Hook pour géolocalisation
- `src/hooks/useCamera.ts` - Hook pour caméra
- `src/hooks/useAudio.ts` - Hook pour audio
- `src/components/ui/permission-request.tsx` - Composant de demande de permissions
- `src/components/features/WeatherWidget.tsx` - Widget météo
- `src/components/features/CameraCapture.tsx` - Composant de capture photo

### Fichiers modifiés
- `src/pages/Dashboard.tsx` - Ajout du widget météo et header personnalisé
- `src/components/features/AddPigDialog.tsx` - Intégration caméra et localisation
- `src/index.css` - Améliorations CSS pour design moderne

## 🚀 Utilisation

### Géolocalisation
```typescript
import { useGeolocation } from '@/hooks/useGeolocation';

const { latitude, longitude, getCurrentPosition, loading, error } = useGeolocation();
```

### Caméra
```typescript
import { useCamera } from '@/hooks/useCamera';

const { startCamera, stopCamera, capturePhoto, videoRef, isActive } = useCamera();
```

### Audio
```typescript
import { useAudio } from '@/hooks/useAudio';

const { startRecording, stopRecording, audioBlob, audioUrl } = useAudio();
```

## 🔐 Permissions

L'application demande automatiquement les permissions pour :
- **Géolocalisation** : Pour enregistrer l'emplacement des porcs
- **Caméra** : Pour prendre des photos
- **Microphone** : Pour enregistrer des notes vocales (à venir)

## 📱 Responsive

Toutes les nouvelles fonctionnalités sont optimisées pour :
- **Desktop** : Interface complète avec tous les détails
- **Mobile** : Interface adaptée avec gestes tactiles
- **Tablette** : Layout optimisé pour écrans moyens

## 🎯 Prochaines étapes

- [ ] Intégrer l'audio dans les notes des porcs
- [ ] Ajouter une API météo réelle (OpenWeatherMap)
- [ ] Améliorer la gestion des photos (upload vers Supabase Storage)
- [ ] Ajouter une carte interactive pour visualiser les localisations
- [ ] Créer des notes vocales avec transcription

## 📝 Notes

- Les données météo sont actuellement mockées (à remplacer par une vraie API)
- Les photos sont stockées en base64 (à migrer vers Supabase Storage)
- La localisation est stockée dans la base de données (latitude/longitude)

