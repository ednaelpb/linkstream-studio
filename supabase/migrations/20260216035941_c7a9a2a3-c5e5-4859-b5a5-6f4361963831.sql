
-- Site settings table (single row per admin)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL DEFAULT 'Minha Marca',
  description TEXT DEFAULT 'Conecte-se comigo em todas as plataformas',
  logo TEXT DEFAULT '',
  button_color TEXT DEFAULT '190 80% 50%',
  button_text_color TEXT DEFAULT '0 0% 100%',
  background_color TEXT DEFAULT '200 50% 10%',
  background_gradient TEXT DEFAULT 'linear-gradient(135deg, hsl(200 50% 10%) 0%, hsl(220 50% 15%) 50%, hsl(190 60% 20%) 100%)',
  background_image TEXT DEFAULT '',
  shadow_intensity NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.site_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.site_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow public read of settings (for the public page)
CREATE POLICY "Public can view first settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Bio links table
CREATE TABLE public.bio_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Novo Link',
  url TEXT NOT NULL DEFAULT 'https://',
  icon TEXT DEFAULT 'external-link',
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bio_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own links"
  ON public.bio_links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view enabled links"
  ON public.bio_links FOR SELECT
  USING (enabled = true);

-- Function to increment click count (public)
CREATE OR REPLACE FUNCTION public.increment_click(link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bio_links SET click_count = click_count + 1 WHERE id = link_id;
END;
$$;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bio_links_updated_at
  BEFORE UPDATE ON public.bio_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
