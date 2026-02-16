import { motion } from "framer-motion";
import { useSupabaseSettings } from "@/hooks/useSupabaseSettings";
import { useSupabaseLinks } from "@/hooks/useSupabaseLinks";
import { Button3D } from "@/components/Button3D";
import { VideoPlayer } from "@/components/VideoPlayer";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareBar } from "@/components/ShareBar";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { getDeviceInfo } from "@/hooks/useClickAnalytics";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { settings, loading: settingsLoading } = useSupabaseSettings(undefined);
  const { links, loading: linksLoading } = useSupabaseLinks(undefined);

  const trackClick = async (id: string) => {
    const info = getDeviceInfo();
    await supabase.rpc("track_click", {
      p_link_id: id,
      p_device_type: info.deviceType,
      p_browser: info.browser,
      p_os: info.os,
      p_referrer: info.referrer,
    });
  };

  const enabledLinks = links.filter(link => link.enabled).sort((a, b) => a.order - b.order);

  const backgroundStyle: React.CSSProperties = {
    background: settings.backgroundGradient,
    ...(settings.backgroundImage ? {
      backgroundImage: `${settings.backgroundGradient}, url(${settings.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundBlendMode: "overlay" as const,
    } : {}),
  };

  if (settingsLoading || linksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-4 py-12 relative"
      style={backgroundStyle}
    >
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

        {/* Brand Name */}
        <motion.h1
          className="text-3xl font-bold text-foreground mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {settings.brandName}
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-muted-foreground text-center mb-10 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {settings.description}
        </motion.p>

        {/* Links */}
        <div className="w-full space-y-4">
          {enabledLinks.map((link, index) => {
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
                  onClick={() => trackClick(link.id)}
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
                  onClick={() => trackClick(link.id)}
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
                onClick={trackClick}
              />
            );
          })}
        </div>

        {/* Share */}
        <div className="mt-10">
          <ShareBar brandName={settings.brandName} />
        </div>

        {/* Footer */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground/60">
            Feito com ❤️ usando Bio Link
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
