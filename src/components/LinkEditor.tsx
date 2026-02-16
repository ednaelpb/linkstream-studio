import { BioLink } from "@/types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Trash2, ExternalLink, MessageCircle, Instagram, Youtube, Link, Music, Mail, Phone, Globe, ShoppingBag, Heart, Star } from "lucide-react";

interface LinkEditorProps {
  link: BioLink;
  onUpdate: (id: string, updates: Partial<BioLink>) => void;
  onDelete: (id: string) => void;
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

export function LinkEditor({ link, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isDragging }: LinkEditorProps) {
  const selectedIcon = iconOptions.find(opt => opt.value === link.icon) || iconOptions[0];
  const IconComponent = selectedIcon.icon;

  return (
    <div
      className={`admin-card group transition-all duration-200 ${isDragging ? 'opacity-40 scale-[0.98]' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, link.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, link.id)}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
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
                URL do Link
              </label>
              <Input
                value={link.url}
                onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                placeholder="https://..."
                className="bg-input border-border"
              />
            </div>
          </div>

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
