-- =====================================================
-- Migration: Création du bucket Supabase Storage pour les photos d'animaux
-- =====================================================

-- Créer le bucket pour les photos d'animaux
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pig-photos',
  'pig-photos',
  true, -- Public pour permettre l'affichage direct
  5242880, -- 5MB max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture publique (pour afficher les photos)
CREATE POLICY "Public can view pig photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pig-photos');

-- Politique d'upload pour les utilisateurs authentifiés (seulement leurs propres photos)
CREATE POLICY "Users can upload own pig photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pig-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique de mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Users can update own pig photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pig-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique de suppression pour les utilisateurs authentifiés
CREATE POLICY "Users can delete own pig photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pig-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
