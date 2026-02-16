import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, BioLink, defaultSettings } from "@/types";
import { Button3D } from "@/components/Button3D";
import { VideoPlayer } from "@/components/VideoPlayer";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareBar } from "@/components/ShareBar";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const UserPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [links, setLinks] = useState<BioLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadUserData = async () => {
      // Find profile by slug
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("slug", slug)
        .maybeSingle();

      if (!profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setUserId(profile.user_id);

      // Load settings and links in parallel
      const [settingsRes, linksRes] = await Promise.all([
        supabase
          .from("site_settings")
          .select("*")
          .eq("user_id", profile.user_id)
          .maybeSingle(),
        supabase
          .from("bio_links")
          .select("*")
          .eq("user_id", profile.user_id)
          .eq("enabled", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (settingsRes.data) {
        setSettings({
          brandName: settingsRes.data.brand_name ?? defaultSettings.brandName,
          description: settingsRes.data.description ?? defaultSettings.description,
          logo: settingsRes.data.logo ?? "",
          buttonColor: settingsRes.data.button_color ?? defaultSettings.buttonColor,
          buttonTextColor: settingsRes.data.button_text_color ?? defaultSettings.buttonTextColor,
          backgroundColor: settingsRes.data.background_color ?? defaultSettings.backgroundColor,
          backgroundGradient: settingsRes.data.background_gradient ?? defaultSettings.backgroundGradient,
          backgroundImage: settingsRes.data.background_image ?? "",
          shadowIntensity: settingsRes.data.shadow_intensity ?? defaultSettings.shadowIntensity,
        });
      }

      if (linksRes.data) {
        setLinks(
          linksRes.data.map((d: any) => ({
            id: d.id,
            label: d.label,
            url: d.url,
            icon: d.icon || "external-link",
            enabled: d.enabled ?? true,
            order: d.sort_order ?? 0,
            clickCount: d.click_count ?? 0,
            linkType: d.link_type || "link",
          }))
        );
      }

      setLoading(false);
    };

    loadUserData();
  }, [slug]);

  const incrementClick = async (id: string) => {
    await supabase.rpc("increment_click", { link_id: id });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  const backgroundStyle: React.CSSProperties = {
    background: settings.backgroundGradient,
    ...(settings.backgroundImage
      ? {
          backgroundImage: `${settings.backgroundGradient}, url(${settings.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay" as const,
        }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 relative" style={backgroundStyle}>
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 15 }}
        >
          {settings.logo ? (
            <img
              src={settings.logo}
              alt={settings.brandName}
              className="w-28 h-28 rounded-full object-cover border-4 border-card/50 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
              <span className="text-4xl font-bold text-primary-foreground">
                {settings.brandName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-foreground mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {settings.brandName}
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-center mb-10 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {settings.description}
        </motion.p>

        {/* Links / Videos / Audio */}
        <div className="w-full space-y-4">
          {links.map((link, index) => {
            if (link.linkType === "video") {
              return (
                <VideoPlayer
                  key={link.id}
                  url={link.url}
                  label={link.label}
                  index={index}
                  buttonColor={settings.buttonColor}
                  textColor={settings.buttonTextColor}
                  shadowIntensity={settings.shadowIntensity}
                  onClick={() => incrementClick(link.id)}
                />
              );
            }
            if (link.linkType === "audio") {
              return (
                <AudioPlayer
                  key={link.id}
                  url={link.url}
                  label={link.label}
                  index={index}
                  buttonColor={settings.buttonColor}
                  textColor={settings.buttonTextColor}
                  shadowIntensity={settings.shadowIntensity}
                  onClick={() => incrementClick(link.id)}
                />
              );
            }
            return (
              <Button3D
                key={link.id}
                link={link}
                buttonColor={settings.buttonColor}
                textColor={settings.buttonTextColor}
                shadowIntensity={settings.shadowIntensity}
                index={index}
                onClick={incrementClick}
              />
            );
          })}
        </div>

        <div className="mt-10">
          <ShareBar brandName={settings.brandName} />
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground/60">Feito com ❤️ usando Bio Link</p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserPage;
