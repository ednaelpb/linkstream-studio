import { useState, useCallback } from "react";
import { ExternalLink, MessageCircle, Instagram, Youtube, Link, Music, Mail, Phone, Globe, ShoppingBag, Heart, Star } from "lucide-react";
import { BioLink } from "@/types";

interface Button3DProps {
  link: BioLink;
  buttonColor: string;
  textColor: string;
  shadowIntensity: number;
  index: number;
  onClick?: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  "external-link": ExternalLink,
  "message-circle": MessageCircle,
  "instagram": Instagram,
  "youtube": Youtube,
  "link": Link,
  "music": Music,
  "mail": Mail,
  "phone": Phone,
  "globe": Globe,
  "shopping-bag": ShoppingBag,
  "heart": Heart,
  "star": Star,
};

export function Button3D({ link, buttonColor, textColor, shadowIntensity, index, onClick }: Button3DProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.(link.id);
  }, [onClick, link.id]);
  
  const Icon = link.icon ? iconMap[link.icon] || ExternalLink : ExternalLink;
  
  const darkerColor = buttonColor.replace(/(\d+)%\)$/, (_, l) => `${Math.max(0, parseInt(l) - 15)}%)`);
  
  const baseStyles = {
    background: `linear-gradient(180deg, hsl(${buttonColor}) 0%, hsl(${buttonColor.replace(/(\d+)%$/, (_, l) => `${Math.max(0, parseInt(l) - 10)}%`)}) 100%)`,
    color: `hsl(${textColor})`,
    boxShadow: isPressed 
      ? `0 2px 0 hsl(${darkerColor}), 0 3px 6px hsla(0, 0%, 0%, ${0.4 * shadowIntensity})`
      : `0 4px 0 hsl(${darkerColor}), 0 6px 12px hsla(0, 0%, 0%, ${0.4 * shadowIntensity}), 0 12px 24px hsla(0, 0%, 0%, ${0.2 * shadowIntensity})`,
    transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
  };

  const animationClass = `animate-float-in-delay-${Math.min(index, 4)}`;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-150 ease-out hover:-translate-y-0.5 ${animationClass}`}
      style={baseStyles}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Light reflection overlay */}
      <span 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsla(0, 0%, 100%, 0.25) 0%, transparent 50%)',
        }}
      />
      
      <Icon className="w-5 h-5 relative z-10" />
      <span className="relative z-10">{link.label}</span>
    </a>
  );
}
