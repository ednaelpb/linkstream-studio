
-- Add cover_image column to bio_links for audio cover art
ALTER TABLE public.bio_links ADD COLUMN IF NOT EXISTS cover_image text DEFAULT NULL;
