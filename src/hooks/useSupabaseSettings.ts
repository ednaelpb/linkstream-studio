import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, defaultSettings } from "@/types";

export function useSupabaseSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setSettings(mapDbToSettings(data));
          setLoading(false);
        });
      return;
    }

    supabase
      .from("site_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(mapDbToSettings(data));
        setLoading(false);
      });
  }, [userId]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSettingsRef = useRef<SiteSettings>(settings);

  const updateSettings = useCallback(
    (updates: Partial<SiteSettings>) => {
      const newSettings = { ...latestSettingsRef.current, ...updates };
      setSettings(newSettings);
      latestSettingsRef.current = newSettings;

      if (!userId) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const dbData = mapSettingsToDb(latestSettingsRef.current, userId);
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existing) {
          await supabase.from("site_settings").update(dbData).eq("user_id", userId);
        } else {
          await supabase.from("site_settings").insert(dbData);
        }
      }, 800);
    },
    [userId]
  );

  return { settings, updateSettings, loading };
}

function mapDbToSettings(data: any): SiteSettings {
  return {
    brandName: data.brand_name ?? defaultSettings.brandName,
    description: data.description ?? defaultSettings.description,
    logo: data.logo ?? "",
    buttonColor: data.button_color ?? defaultSettings.buttonColor,
    buttonTextColor: data.button_text_color ?? defaultSettings.buttonTextColor,
    backgroundColor: data.background_color ?? defaultSettings.backgroundColor,
    backgroundGradient: data.background_gradient ?? defaultSettings.backgroundGradient,
    backgroundImage: data.background_image ?? "",
    backgroundOpacity: data.background_opacity ?? defaultSettings.backgroundOpacity,
    shadowIntensity: data.shadow_intensity ?? defaultSettings.shadowIntensity,
    seoTitle: data.seo_title ?? "",
    seoDescription: data.seo_description ?? "",
    pageTitle: data.page_title ?? "Painel Administrativo",
  };
}

function mapSettingsToDb(s: SiteSettings, userId: string) {
  return {
    user_id: userId,
    brand_name: s.brandName,
    description: s.description,
    logo: s.logo,
    button_color: s.buttonColor,
    button_text_color: s.buttonTextColor,
    background_color: s.backgroundColor,
    background_gradient: s.backgroundGradient,
    background_image: s.backgroundImage,
    background_opacity: s.backgroundOpacity,
    shadow_intensity: s.shadowIntensity,
    seo_title: s.seoTitle,
    seo_description: s.seoDescription,
    page_title: s.pageTitle,
  };
}
