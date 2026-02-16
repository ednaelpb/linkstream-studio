import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl font-semibold text-lg transition-shadow duration-150 ease-out"
      style={baseStyles}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: 0.15 + index * 0.1, 
        duration: 0.5, 
        type: "spring", 
        damping: 20,
        stiffness: 200 
      }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ y: 2, scale: 0.98 }}
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
    </motion.a>
  );
}
