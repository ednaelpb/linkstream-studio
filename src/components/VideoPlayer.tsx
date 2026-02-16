import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  label: string;
  index: number;
  buttonColor: string;
  textColor: string;
  shadowIntensity: number;
  onClick?: () => void;
}

function getEmbedUrl(url: string): { type: "embed" | "native"; src: string } {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "embed", src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "embed", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  // Direct MP4
  return { type: "native", src: url };
}

export function VideoPlayer({ url, label, index, buttonColor, textColor, shadowIntensity, onClick }: VideoPlayerProps) {
  const { type, src } = getEmbedUrl(url);

  return (
    <motion.div
      className="w-full rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5, type: "spring", damping: 20, stiffness: 200 }}
      onClick={onClick}
      style={{
        boxShadow: `0 4px 0 hsl(${buttonColor.replace(/(\d+)%$/, (_, l) => `${Math.max(0, parseInt(l) - 15)}%`)}), 0 6px 12px hsla(0, 0%, 0%, ${0.4 * shadowIntensity})`,
      }}
    >
      {/* Label */}
      <div
        className="px-4 py-3 flex items-center gap-2 font-semibold"
        style={{
          background: `linear-gradient(180deg, hsl(${buttonColor}) 0%, hsl(${buttonColor.replace(/(\d+)%$/, (_, l) => `${Math.max(0, parseInt(l) - 10)}%`)}) 100%)`,
          color: `hsl(${textColor})`,
        }}
      >
        <Play className="w-5 h-5" />
        <span>{label}</span>
      </div>

      {/* Player */}
      <div className="relative w-full aspect-video bg-black/90">
        {type === "embed" ? (
          <iframe
            src={src}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={label}
          />
        ) : (
          <video
            src={src}
            controls
            className="absolute inset-0 w-full h-full object-contain"
            preload="metadata"
            playsInline
          >
            Seu navegador não suporta vídeo.
          </video>
        )}
      </div>
    </motion.div>
  );
}
