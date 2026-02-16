
-- Trigger to enforce max_links limit on bio_links INSERT
CREATE OR REPLACE FUNCTION public.check_max_links()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT count(*) INTO current_count FROM public.bio_links WHERE user_id = NEW.user_id;
  SELECT max_links INTO max_allowed FROM public.profiles WHERE user_id = NEW.user_id;

  IF max_allowed IS NOT NULL AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de links atingido. Máximo permitido: %', max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_max_links
BEFORE INSERT ON public.bio_links
FOR EACH ROW
EXECUTE FUNCTION public.check_max_links();
