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
