import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, Music2 } from "lucide-react";

interface AudioPlayerProps {
  url: string;
  label: string;
  index: number;
  buttonColor: string;
  textColor: string;
  shadowIntensity: number;
  coverImage?: string;
  onClick?: () => void;
}

function getSoundCloudEmbed(url: string): string | null {
  if (url.includes("soundcloud.com")) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  }
  return null;
}

export function AudioPlayer({ url, label, index, buttonColor, textColor, shadowIntensity, coverImage, onClick }: AudioPlayerProps) {
  const scEmbed = getSoundCloudEmbed(url);
  const isNative = !scEmbed;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleLoaded = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
    onClick?.();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const darkerColor = buttonColor.replace(/(\d+)%$/, (_, l) => `${Math.max(0, parseInt(l) - 15)}%`);

  return (
    <motion.div
      className="w-full rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5, type: "spring", damping: 20, stiffness: 200 }}
      style={{
        boxShadow: `0 4px 0 hsl(${darkerColor}), 0 6px 12px hsla(0, 0%, 0%, ${0.4 * shadowIntensity})`,
      }}
    >
      {scEmbed ? (
        <>
          <div
            className="px-4 py-3 flex items-center gap-2 font-semibold"
            style={{
              background: `linear-gradient(180deg, hsl(${buttonColor}) 0%, hsl(${buttonColor.replace(/(\d+)%$/, (_, l) => `${Math.max(0, parseInt(l) - 10)}%`)}) 100%)`,
              color: `hsl(${textColor})`,
            }}
          >
            <Music2 className="w-5 h-5" />
            <span>{label}</span>
          </div>
          <iframe
            src={scEmbed}
            className="w-full"
            height="166"
            allow="autoplay"
            loading="lazy"
            title={label}
            style={{ border: "none" }}
          />
        </>
      ) : (
        <div
          className="p-4"
          style={{
            background: `linear-gradient(180deg, hsl(${buttonColor}) 0%, hsl(${buttonColor.replace(/(\d+)%$/, (_, l) => `${Math.max(0, parseInt(l) - 10)}%`)}) 100%)`,
            color: `hsl(${textColor})`,
          }}
        >
          <audio ref={audioRef} src={url} preload="metadata" />

          <div className="flex items-center gap-4">
            {/* Cover Image */}
            {coverImage && (
              <img src={coverImage} alt={label} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            )}

            {/* Play button */}
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: `hsla(0, 0%, 100%, 0.2)`,
                backdropFilter: "blur(10px)",
              }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Music2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold truncate">{label}</span>
              </div>

              {/* Progress bar */}
              <div
                className="h-2 rounded-full cursor-pointer overflow-hidden"
                style={{ background: "hsla(0, 0%, 100%, 0.15)" }}
                onClick={handleSeek}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "hsla(0, 0%, 100%, 0.7)",
                  }}
                  layoutId={`progress-${url}`}
                />
              </div>

              {/* Time */}
              <div className="flex justify-between mt-1.5">
                <span className="text-xs opacity-70">{formatTime(currentTime)}</span>
                <span className="text-xs opacity-70">{duration ? formatTime(duration) : "--:--"}</span>
              </div>
            </div>

            {/* Waveform animation */}
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-8">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ background: "hsla(0, 0%, 100%, 0.6)" }}
                    animate={{
                      height: ["8px", `${12 + Math.random() * 20}px`, "8px"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + Math.random() * 0.4,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
