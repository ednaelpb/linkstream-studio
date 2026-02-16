import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BioLink, SiteSettings, defaultSettings, defaultLinks, ThemePreset } from "@/types";
import { ThemeSelector } from "@/components/ThemeSelector";
import { AdminLogin } from "@/components/AdminLogin";
import { LinkEditor } from "@/components/LinkEditor";
import { ColorPicker } from "@/components/ColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, ExternalLink, ImagePlus, Trash2 } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useLocalStorage<SiteSettings>("biolink_settings", defaultSettings);
  const [links, setLinks] = useLocalStorage<BioLink[]>("biolink_links", defaultLinks);
  const [clickCounts] = useLocalStorage<Record<string, number>>("biolink_clicks", {});

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const applyTheme = (theme: ThemePreset) => {
    updateSettings({
      buttonColor: theme.buttonColor,
      buttonTextColor: theme.buttonTextColor,
      backgroundColor: theme.backgroundColor,
      backgroundGradient: theme.backgroundGradient,
      shadowIntensity: theme.shadowIntensity,
    });
  };

  const updateLink = (id: string, updates: Partial<BioLink>) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const addNewLink = () => {
    const newLink: BioLink = {
      id: Date.now().toString(),
      label: "Novo Link",
      url: "https://",
      icon: "external-link",
      enabled: true,
      order: links.length,
    };
    setLinks(prev => [...prev, newLink]);
  };

  // Drag and drop
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setLinks(prev => {
      const items = [...prev];
      const dragIndex = items.findIndex(l => l.id === draggedId);
      const dropIndex = items.findIndex(l => l.id === targetId);
      const [moved] = items.splice(dragIndex, 1);
      items.splice(dropIndex, 0, moved);
      return items.map((item, i) => ({ ...item, order: i }));
    });
    setDraggedId(null);
  }, [draggedId, setLinks]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateSettings({ logo: "" });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Página
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Brand Settings */}
        <section className="glass-card">
          <h2 className="text-lg font-semibold mb-6">Configurações da Marca</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground block">
                Logo
              </label>
              <div className="flex items-center gap-4">
                {settings.logo ? (
                  <div className="relative">
                    <img 
                      src={settings.logo} 
                      alt="Logo"
                      className="w-20 h-20 rounded-xl object-cover border border-border"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground block">
                Nome da Marca
              </label>
              <Input
                value={settings.brandName}
                onChange={(e) => updateSettings({ brandName: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-muted-foreground block">
              Descrição
            </label>
            <Textarea
              value={settings.description}
              onChange={(e) => updateSettings({ description: e.target.value })}
              className="bg-input border-border resize-none"
              rows={2}
            />
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="glass-card">
          <h2 className="text-lg font-semibold mb-6">Aparência</h2>

          {/* Theme Presets */}
          <div className="mb-8">
            <ThemeSelector
              currentSettings={settings}
              onSelectTheme={applyTheme}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker
              label="Cor dos Botões"
              value={settings.buttonColor}
              onChange={(color) => updateSettings({ buttonColor: color })}
            />
            <ColorPicker
              label="Cor do Texto dos Botões"
              value={settings.buttonTextColor}
              onChange={(color) => updateSettings({ buttonTextColor: color })}
            />
          </div>

          {/* Shadow Intensity */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-muted-foreground block">
              Intensidade da Sombra 3D
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.shadowIntensity]}
                onValueChange={([value]) => updateSettings({ shadowIntensity: value })}
                min={0}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                {settings.shadowIntensity.toFixed(1)}
              </span>
            </div>
          </div>
        </section>

        {/* Links Management */}
        <section className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Gerenciar Links</h2>
            <Button 
              onClick={addNewLink}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Botão
            </Button>
          </div>
          
          <div className="space-y-4" onDragEnd={() => setDraggedId(null)}>
            {links
              .sort((a, b) => a.order - b.order)
              .map((link) => (
              <LinkEditor
                key={link.id}
                link={link}
                clicks={clickCounts[link.id] || 0}
                onUpdate={updateLink}
                onDelete={deleteLink}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={draggedId === link.id}
              />
            ))}

            {links.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum link adicionado ainda.</p>
                <p className="text-sm mt-1">Clique em "Novo Botão" para começar.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
