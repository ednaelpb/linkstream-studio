
DO $$
BEGIN
  -- check_max_links trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'check_max_links_before_insert') THEN
    CREATE TRIGGER check_max_links_before_insert
      BEFORE INSERT ON public.bio_links
      FOR EACH ROW
      EXECUTE FUNCTION public.check_max_links();
  END IF;

  -- updated_at on profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- updated_at on site_settings
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_settings_updated_at') THEN
    CREATE TRIGGER update_site_settings_updated_at
      BEFORE UPDATE ON public.site_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
