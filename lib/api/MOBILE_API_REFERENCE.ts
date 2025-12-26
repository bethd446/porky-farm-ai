/**
 * =====================================================
 * PORKYFARM - REFERENCE API MOBILE
 * =====================================================
 *
 * Ce fichier documente toutes les APIs disponibles pour l'app mobile.
 * Il ne contient pas de code executable, uniquement de la documentation.
 *
 * =====================================================
 * AUTHENTIFICATION
 * =====================================================
 *
 * Methode : Supabase Auth (cookies HTTP-only)
 * Providers supportes :
 * - Email + mot de passe
 * - Google OAuth
 * - Apple Sign-In (obligatoire iOS)
 *
 * Session : GET /api/auth/session
 * Response : { user: { id, email, ... } } ou { user: null }
 *
 * =====================================================
 * MODULES P0 (MVP)
 * =====================================================
 *
 * 1. CHEPTEL (Animals)
 *    Base URL : /api/animals
 *    Table Supabase : pigs
 *
 *    GET    /api/animals          Liste tous les animaux
 *    POST   /api/animals          Creer un animal
 *    GET    /api/animals/:id      Recuperer un animal
 *    PUT    /api/animals/:id      Modifier un animal
 *    DELETE /api/animals/:id      Supprimer un animal
 *
 *    Champs requis (POST) :
 *    - identifier : string (ex: "TRUIE-001")
 *    - category : "sow" | "boar" | "piglet" | "fattening"
 *
 *    Champs optionnels :
 *    - name, breed, birth_date, weight, status, notes, image_url
 *
 * 2. SANTE (Health Cases)
 *    Base URL : /api/health-cases
 *    Table Supabase : veterinary_cases
 *
 *    GET    /api/health-cases          Liste tous les cas
 *    POST   /api/health-cases          Signaler un probleme
 *    GET    /api/health-cases/:id      Recuperer un cas
 *    PUT    /api/health-cases/:id      Modifier un cas
 *    DELETE /api/health-cases/:id      Supprimer un cas
 *
 *    Champs requis (POST) :
 *    - pig_id : UUID de l'animal concerne
 *    - description : string
 *
 *    Champs optionnels :
 *    - symptoms, priority, treatment, photo_url
 *
 * 3. REPRODUCTION (Gestations)
 *    Base URL : /api/gestations
 *    Table Supabase : gestations
 *
 *    GET    /api/gestations          Liste toutes les gestations
 *    POST   /api/gestations          Enregistrer une saillie
 *    GET    /api/gestations/:id      Recuperer une gestation
 *    PUT    /api/gestations/:id      Modifier une gestation
 *    DELETE /api/gestations/:id      Supprimer une gestation
 *
 *    Champs requis (POST) :
 *    - sow_id : UUID de la truie
 *    - mating_date : date de saillie (YYYY-MM-DD)
 *
 *    Champs optionnels :
 *    - boar_id, expected_farrowing_date, notes
 *
 *    Note : expected_farrowing_date = mating_date + 114 jours
 *
 * 4. ASSISTANT IA
 *    Base URL : /api/chat
 *
 *    POST   /api/chat    Envoyer un message
 *
 *    Body :
 *    - messages : array de { role, content }
 *    - imageUrl : string (optionnel, pour analyse visuelle)
 *
 *    Rate limit : 20 requetes/minute par utilisateur
 *
 * =====================================================
 * MODULES P1 (Post-MVP) - NON DISPONIBLES
 * =====================================================
 *
 * - Mode offline avec synchronisation differee
 * - Notifications push (alertes sante, mises-bas)
 * - Export PDF des fiches animaux
 * - Marketplace entre eleveurs
 * - Comptabilite avancee
 *
 * =====================================================
 * SECURITE
 * =====================================================
 *
 * - Toutes les donnees sont isolees par user_id
 * - RLS (Row Level Security) active sur toutes les tables
 * - Validation Zod sur tous les inputs
 * - Pas de donnees sensibles exposees cote client
 * - Rate limiting sur les endpoints couteux
 *
 * =====================================================
 * HEADERS REQUIS
 * =====================================================
 *
 * Content-Type: application/json
 * Cookie: sb-access-token=... (gere automatiquement par Supabase)
 *
 * Pour React Native/Expo, utiliser credentials: 'include'
 *
 * =====================================================
 * CODES DE RETOUR
 * =====================================================
 *
 * 200 : Succes (GET, PUT, DELETE)
 * 201 : Cree (POST)
 * 400 : Erreur de validation
 * 401 : Non authentifie
 * 404 : Ressource non trouvee
 * 429 : Rate limit depasse
 * 500 : Erreur serveur
 */

export {}
