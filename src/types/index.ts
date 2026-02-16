export type LinkType = 'link' | 'video' | 'audio';

export interface BioLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  enabled: boolean;
  order: number;
  clickCount?: number;
  linkType: LinkType;
  coverImage?: string;
}

export interface SiteSettings {
  brandName: string;
  description: string;
  logo: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage: string;
  shadowIntensity: number;
  seoTitle?: string;
  seoDescription?: string;
  pageTitle?: string;
}

export interface ClickAnalytics {
  id: string;
  linkId: string;
  userId: string;
  clickedAt: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  referrer?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage: string;
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
    backgroundImage: "",
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
    backgroundImage: "",
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
    backgroundImage: "",
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
    backgroundImage: "",
    shadowIntensity: 0.6,
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    emoji: "🌅",
    buttonColor: "25 90% 55%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "15 60% 12%",
    backgroundGradient: "linear-gradient(135deg, hsl(15 60% 12%) 0%, hsl(25 70% 18%) 40%, hsl(35 50% 15%) 100%)",
    backgroundImage: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=60",
    shadowIntensity: 1.2,
  },
  {
    id: "ocean",
    name: "Oceano",
    emoji: "🌊",
    buttonColor: "200 85% 45%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "210 60% 10%",
    backgroundGradient: "linear-gradient(135deg, hsl(210 60% 10%) 0%, hsl(200 70% 18%) 50%, hsl(195 55% 15%) 100%)",
    backgroundImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60",
    shadowIntensity: 1,
  },
  {
    id: "forest",
    name: "Floresta",
    emoji: "🌿",
    buttonColor: "145 60% 40%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "150 40% 8%",
    backgroundGradient: "linear-gradient(135deg, hsl(150 40% 8%) 0%, hsl(140 50% 14%) 50%, hsl(160 35% 10%) 100%)",
    backgroundImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=60",
    shadowIntensity: 0.9,
  },
  {
    id: "galaxy",
    name: "Galáxia",
    emoji: "🌌",
    buttonColor: "270 80% 60%",
    buttonTextColor: "0 0% 100%",
    backgroundColor: "260 50% 6%",
    backgroundGradient: "linear-gradient(135deg, hsl(260 50% 6%) 0%, hsl(280 60% 12%) 50%, hsl(300 40% 8%) 100%)",
    backgroundImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=60",
    shadowIntensity: 1.4,
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
  backgroundImage: "",
  shadowIntensity: 1,
  seoTitle: "",
  seoDescription: "",
  pageTitle: "Painel Administrativo",
};

export const defaultLinks: BioLink[] = [
  { id: "1", label: "Meu Site", url: "https://exemplo.com", enabled: true, order: 0, linkType: "link" },
  { id: "2", label: "WhatsApp", url: "https://wa.me/5511999999999", icon: "message-circle", enabled: true, order: 1, linkType: "link" },
  { id: "3", label: "Instagram", url: "https://instagram.com", icon: "instagram", enabled: true, order: 2, linkType: "link" },
  { id: "4", label: "YouTube", url: "https://youtube.com", icon: "youtube", enabled: true, order: 3, linkType: "link" },
];
