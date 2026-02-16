import { ThemePreset, themePresets } from "@/types";
import { Check, Image } from "lucide-react";

interface ThemeSelectorProps {
  currentSettings: {
    buttonColor: string;
    backgroundGradient: string;
  };
  onSelectTheme: (theme: ThemePreset) => void;
}

export function ThemeSelector({ currentSettings, onSelectTheme }: ThemeSelectorProps) {
  const isActive = (theme: ThemePreset) =>
    currentSettings.buttonColor === theme.buttonColor &&
    currentSettings.backgroundGradient === theme.backgroundGradient;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground block">
        Temas Pré-definidos
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {themePresets.map((theme) => {
          const active = isActive(theme);
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme)}
              className={`relative group rounded-xl p-3 border-2 transition-all duration-300 hover:scale-[1.03] overflow-hidden ${
                active
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border/50 hover:border-border"
              }`}
              style={{
                background: theme.backgroundGradient,
                ...(theme.backgroundImage ? {
                  backgroundImage: `${theme.backgroundGradient}, url(${theme.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundBlendMode: "overlay" as const,
                } : {}),
              }}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* Image indicator */}
              {theme.backgroundImage && (
                <div className="absolute top-2 left-2 z-10">
                  <Image className="w-3.5 h-3.5 text-white/70" />
                </div>
              )}

              {/* Preview button */}
              <div
                className="w-full h-6 rounded-lg mb-3 shadow-md"
                style={{ background: `hsl(${theme.buttonColor})` }}
              />
              <div
                className="w-3/4 mx-auto h-4 rounded-md mb-2 opacity-70"
                style={{ background: `hsl(${theme.buttonColor})` }}
              />

              {/* Label */}
              <p
                className="text-xs font-semibold mt-3 text-center"
                style={{
                  color:
                    theme.id === "claro" || theme.id === "pastel"
                      ? "hsl(220 20% 30%)"
                      : "hsl(0 0% 90%)",
                }}
              >
                {theme.emoji} {theme.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
