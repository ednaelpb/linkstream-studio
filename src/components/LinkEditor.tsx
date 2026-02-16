import { BioLink, LinkType } from "@/types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Trash2, ExternalLink, MessageCircle, Instagram, Youtube, Link, Music, Mail, Phone, Globe, ShoppingBag, Heart, Star, MousePointerClick, RotateCcw, Video, Music2, ImagePlus } from "lucide-react";
import { MediaPreview } from "@/components/MediaPreview";
import { FileUpload } from "@/components/FileUpload";

interface LinkEditorProps {
  link: BioLink;
  clicks: number;
  userId: string;
  onUpdate: (id: string, updates: Partial<BioLink>) => void;
  onDelete: (id: string) => void;
  onResetClicks: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
}

const iconOptions = [
  { value: "external-link", label: "Link Externo", icon: ExternalLink },
  { value: "message-circle", label: "WhatsApp", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "link", label: "Link", icon: Link },
  { value: "music", label: "Música", icon: Music },
  { value: "mail", label: "E-mail", icon: Mail },
  { value: "phone", label: "Telefone", icon: Phone },
  { value: "globe", label: "Website", icon: Globe },
  { value: "shopping-bag", label: "Loja", icon: ShoppingBag },
  { value: "heart", label: "Favorito", icon: Heart },
  { value: "star", label: "Destaque", icon: Star },
];

export function LinkEditor({ link, clicks, userId, onUpdate, onDelete, onResetClicks, onDragStart, onDragOver, onDrop, isDragging }: LinkEditorProps) {
  const selectedIcon = iconOptions.find(opt => opt.value === link.icon) || iconOptions[0];
  const IconComponent = selectedIcon.icon;

  const typeLabel = link.linkType === "video" ? "Vídeo" : link.linkType === "audio" ? "Áudio" : "Link";
  const TypeIcon = link.linkType === "video" ? Video : link.linkType === "audio" ? Music2 : null;
  const urlPlaceholder = link.linkType === "video" 
    ? "URL do YouTube, Vimeo ou MP4"
    : link.linkType === "audio"
    ? "URL do SoundCloud ou MP3"
    : "https://...";

  const fileAccept = link.linkType === "video" ? "video/mp4,video/webm" : link.linkType === "audio" ? "audio/mp3,audio/mpeg,audio/wav,audio/ogg" : "image/*";
  const uploadLabel = link.linkType === "video" ? "Subir Vídeo" : link.linkType === "audio" ? "Subir Áudio" : "Subir Imagem";

  return (
    <div
      className={`admin-card group transition-all duration-200 ${isDragging ? 'opacity-40 scale-[0.98]' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, link.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, link.id)}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle + Type Badge */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          {TypeIcon && (
            <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
              <TypeIcon className="w-3 h-3" />
              {typeLabel}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Label and URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Texto do Botão
              </label>
              <Input
                value={link.label}
                onChange={(e) => onUpdate(link.id, { label: e.target.value })}
                placeholder="Ex: Meu Instagram"
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                URL {link.linkType === "video" ? "do Vídeo" : link.linkType === "audio" ? "do Áudio" : "do Link"}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={link.url}
                  onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                  placeholder={urlPlaceholder}
                  className="bg-input border-border flex-1"
                />
                <FileUpload
                  accept={fileAccept}
                  label={uploadLabel}
                  userId={userId}
                  onUploadComplete={(url) => onUpdate(link.id, { url })}
                />
              </div>
            </div>
          </div>

          {/* Media Preview */}
          {(link.linkType === "video" || link.linkType === "audio") && (
            <MediaPreview url={link.url} linkType={link.linkType} />
          )}

          {/* Cover Image for Audio */}
          {link.linkType === "audio" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">
                Imagem de Capa
              </label>
              <div className="flex items-center gap-3">
                {link.coverImage ? (
                  <div className="relative">
                    <img src={link.coverImage} alt="Capa" className="w-16 h-16 rounded-lg object-cover border border-border" />
                    <button
                      onClick={() => onUpdate(link.id, { coverImage: undefined })}
                      className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <FileUpload
                  accept="image/*"
                  label="Subir Capa"
                  userId={userId}
                  onUploadComplete={(url) => onUpdate(link.id, { coverImage: url })}
                />
              </div>
            </div>
          )}

          {/* Icon and Toggle */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Ícone
              </label>
              <Select
                value={link.icon || "external-link"}
                onValueChange={(value) => onUpdate(link.id, { icon: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{selectedIcon.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Click count badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground" title="Cliques">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span className="text-sm font-mono font-medium">{clicks}</span>
              {clicks > 0 && (
                <button
                  onClick={() => onResetClicks(link.id)}
                  className="ml-1 p-0.5 rounded hover:bg-muted transition-colors"
                  title="Zerar cliques"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Ativo
              </label>
              <Switch
                checked={link.enabled}
                onCheckedChange={(checked) => onUpdate(link.id, { enabled: checked })}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(link.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
