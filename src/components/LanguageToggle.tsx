import { Language } from "@/lib/i18n";

interface LanguageToggleProps {
  lang: Language;
  onToggle: (lang: Language) => void;
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={() => onToggle(lang === "pt" ? "en" : "pt")}
      className="fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all duration-200 text-sm font-medium"
      title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
    >
      <span className="text-base">{lang === "pt" ? "🇧🇷" : "🇺🇸"}</span>
      <span className="uppercase font-semibold text-xs">{lang}</span>
    </button>
  );
}
