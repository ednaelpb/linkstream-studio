
-- Remove the permissive INSERT policy - clicks will only go through the track_click SECURITY DEFINER function
DROP POLICY IF EXISTS "Anyone can insert click analytics" ON public.click_analytics;
