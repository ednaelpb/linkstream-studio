import { Play, Music2 } from "lucide-react";

interface MediaPreviewProps {
  url: string;
  linkType: "video" | "audio";
}

function getVideoEmbed(url: string): { type: "embed" | "native"; src: string } | null {
  if (!url || url === "https://") return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "embed", src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "embed", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: "native", src: url };
  return null;
}

function getAudioSource(url: string): { type: "soundcloud" | "native"; src: string } | null {
  if (!url || url === "https://") return null;
  if (url.includes("soundcloud.com")) {
    return { type: "soundcloud", src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true` };
  }
  if (url.match(/\.(mp3|wav|ogg|m4a)(\?|$)/i)) return { type: "native", src: url };
  return null;
}

export function MediaPreview({ url, linkType }: MediaPreviewProps) {
  if (linkType === "video") {
    const embed = getVideoEmbed(url);
    if (!embed) return (
      <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Play className="w-4 h-4" />
        <span>Cole uma URL de vídeo para ver o preview</span>
      </div>
    );

    return (
      <div className="rounded-lg overflow-hidden border border-border mt-2">
        {embed.type === "embed" ? (
          <iframe src={embed.src} className="w-full aspect-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
        ) : (
          <video src={embed.src} controls className="w-full aspect-video object-contain bg-black" preload="metadata" playsInline />
        )}
      </div>
    );
  }

  if (linkType === "audio") {
    const source = getAudioSource(url);
    if (!source) return (
      <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Music2 className="w-4 h-4" />
        <span>Cole uma URL de áudio para ver o preview</span>
      </div>
    );

    return (
      <div className="rounded-lg overflow-hidden border border-border mt-2">
        {source.type === "soundcloud" ? (
          <iframe src={source.src} className="w-full" height="120" allow="autoplay" loading="lazy" style={{ border: "none" }} />
        ) : (
          <audio src={source.src} controls className="w-full" preload="metadata" />
        )}
      </div>
    );
  }

  return null;
}
