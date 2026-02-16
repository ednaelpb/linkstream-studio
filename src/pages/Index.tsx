import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BioLink, SiteSettings, defaultSettings, defaultLinks } from "@/types";
import { Button3D } from "@/components/Button3D";

const Index = () => {
  const [settings] = useLocalStorage<SiteSettings>("biolink_settings", defaultSettings);
  const [links] = useLocalStorage<BioLink[]>("biolink_links", defaultLinks);
  const [clickCounts, setClickCounts] = useLocalStorage<Record<string, number>>("biolink_clicks", {});

  const enabledLinks = links.filter(link => link.enabled).sort((a, b) => a.order - b.order);

  const handleLinkClick = useCallback((id: string) => {
    setClickCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, [setClickCounts]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-4 py-12 relative"
      style={{ background: settings.backgroundGradient }}
    >

      {/* Content Container */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="animate-float-in mb-6">
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
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-bold text-foreground mb-2 animate-float-in-delay-1 text-center">
          {settings.brandName}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-center mb-10 animate-float-in-delay-2 max-w-sm">
          {settings.description}
        </p>

        {/* Links */}
        <div className="w-full space-y-4">
          {enabledLinks.map((link, index) => (
              <Button3D
                key={link.id}
                link={link}
                buttonColor={settings.buttonColor}
                textColor={settings.buttonTextColor}
                shadowIntensity={settings.shadowIntensity}
                index={index}
                onClick={handleLinkClick}
              />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center animate-float-in-delay-4">
          <p className="text-sm text-muted-foreground/60">
            Feito com ❤️ usando Bio Link
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
