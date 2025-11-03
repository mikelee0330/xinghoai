-- Add file storage columns and AI analysis to brand_settings
ALTER TABLE public.brand_settings
ADD COLUMN IF NOT EXISTS brand_files text[], -- Array of file URLs
ADD COLUMN IF NOT EXISTS ai_analysis text; -- AI-generated brand analysis

-- Add brand_id to generation_history
ALTER TABLE public.generation_history
ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brand_settings(id) ON DELETE SET NULL;

-- Add language preference to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT '繁體中文';

-- Create storage bucket for brand files
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-files', 'brand-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for brand files
CREATE POLICY "Users can view their own brand files"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own brand files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own brand files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own brand files"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-files' AND auth.uid()::text = (storage.foldername(name))[1]);