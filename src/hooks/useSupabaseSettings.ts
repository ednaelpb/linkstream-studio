import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, defaultSettings } from "@/types";

export function useSupabaseSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Public view: load first available settings
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

  const updateSettings = useCallback(
    async (updates: Partial<SiteSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      if (!userId) return;

      const dbData = mapSettingsToDb(newSettings, userId);
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
    },
    [settings, userId]
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
    shadowIntensity: data.shadow_intensity ?? defaultSettings.shadowIntensity,
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
    shadow_intensity: s.shadowIntensity,
  };
}
