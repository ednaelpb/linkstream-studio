export interface BioLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  enabled: boolean;
  order: number;
}

export interface SiteSettings {
  brandName: string;
  description: string;
  logo: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  shadowIntensity: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  shadowIntensity: number;
}

export const themePresets: ThemePreset[] = [
  {
    id: "escuro",
    name: "Escuro",
    emoji: "🌙",
    buttonColor: "190 80% 50%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "200 50% 10%",
    backgroundGradient: "linear-gradient(135deg, hsl(200 50% 10%) 0%, hsl(220 50% 15%) 50%, hsl(190 60% 20%) 100%)",
    shadowIntensity: 1,
  },
  {
    id: "claro",
    name: "Claro",
    emoji: "☀️",
    buttonColor: "220 70% 55%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "220 20% 95%",
    backgroundGradient: "linear-gradient(135deg, hsl(220 20% 95%) 0%, hsl(230 25% 90%) 50%, hsl(210 30% 92%) 100%)",
    shadowIntensity: 0.8,
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    buttonColor: "280 100% 60%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "260 30% 8%",
    backgroundGradient: "linear-gradient(135deg, hsl(260 30% 8%) 0%, hsl(280 40% 12%) 50%, hsl(300 35% 10%) 100%)",
    shadowIntensity: 1.5,
  },
  {
    id: "pastel",
    name: "Pastel",
    emoji: "🌸",
    buttonColor: "340 60% 70%",
    buttonTextColor: "340 30% 20%",
    backgroundColor: "330 30% 95%",
    backgroundGradient: "linear-gradient(135deg, hsl(330 30% 95%) 0%, hsl(280 25% 93%) 50%, hsl(340 35% 94%) 100%)",
    shadowIntensity: 0.6,
  },
];

export const defaultSettings: SiteSettings = {
  brandName: "Minha Marca",
  description: "Conecte-se comigo em todas as plataformas",
  logo: "",
  buttonColor: "190 80% 50%",
  buttonTextColor: "0 0% 100%",
  backgroundColor: "200 50% 10%",
  backgroundGradient: "linear-gradient(135deg, hsl(200 50% 10%) 0%, hsl(220 50% 15%) 50%, hsl(190 60% 20%) 100%)",
  shadowIntensity: 1,
};

export const defaultLinks: BioLink[] = [
  { id: "1", label: "Meu Site", url: "https://exemplo.com", enabled: true, order: 0 },
  { id: "2", label: "WhatsApp", url: "https://wa.me/5511999999999", icon: "message-circle", enabled: true, order: 1 },
  { id: "3", label: "Instagram", url: "https://instagram.com", icon: "instagram", enabled: true, order: 2 },
  { id: "4", label: "YouTube", url: "https://youtube.com", icon: "youtube", enabled: true, order: 3 },
];
