
-- Click analytics table for detailed tracking
CREATE TABLE public.click_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.bio_links(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  ip_hash TEXT -- hashed for privacy
);

-- Enable RLS
ALTER TABLE public.click_analytics ENABLE ROW LEVEL SECURITY;

-- Owner can view their analytics
CREATE POLICY "Users can view own analytics"
ON public.click_analytics
FOR SELECT
USING (
  user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

-- Public can insert (anonymous click tracking)
CREATE POLICY "Anyone can insert click analytics"
ON public.click_analytics
FOR INSERT
WITH CHECK (true);

-- Add SEO fields to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS page_title TEXT DEFAULT 'Painel Administrativo';

-- Index for fast queries
CREATE INDEX idx_click_analytics_link_id ON public.click_analytics(link_id);
CREATE INDEX idx_click_analytics_user_id ON public.click_analytics(user_id);
CREATE INDEX idx_click_analytics_clicked_at ON public.click_analytics(clicked_at);

-- Update increment_click to also log analytics
CREATE OR REPLACE FUNCTION public.track_click(
  p_link_id UUID,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Increment click count
  UPDATE public.bio_links SET click_count = click_count + 1 WHERE id = p_link_id;
  
  -- Get the owner of the link
  SELECT user_id INTO v_user_id FROM public.bio_links WHERE id = p_link_id;
  
  -- Insert analytics record
  INSERT INTO public.click_analytics (link_id, user_id, device_type, browser, os, country, city, referrer)
  VALUES (p_link_id, v_user_id, p_device_type, p_browser, p_os, p_country, p_city, p_referrer);
END;
$$;
