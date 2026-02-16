import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemePreset } from "@/types";
import { ThemeSelector } from "@/components/ThemeSelector";
import { AdminLogin } from "@/components/AdminLogin";
import { LinkEditor } from "@/components/LinkEditor";
import { ColorPicker } from "@/components/ColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, ExternalLink, ImagePlus, Trash2, Image, Users, Video, Music2, Link2, BarChart3, Search, Settings2, Save, Eye, RefreshCw, Smartphone, Tablet, Monitor } from "lucide-react";
import { toast } from "sonner";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { UserManagement } from "@/components/UserManagement";
import { useSupabaseSettings } from "@/hooks/useSupabaseSettings";
import { useSupabaseLinks } from "@/hooks/useSupabaseLinks";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { FileUpload } from "@/components/FileUpload";

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugSaved, setSlugSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "analytics" | "settings" | "preview">("links");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const userId = session?.user?.id;
  const { settings, updateSettings, loading: settingsLoading } = useSupabaseSettings(userId);
  const { links, updateLink, deleteLink, addLink, reorderLinks, loading: linksLoading } = useSupabaseLinks(userId);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
      if (session?.user?.id) checkAdmin(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
      if (session?.user?.id) checkAdmin(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load slug
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("slug")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.slug) setSlug(data.slug);
      });
  }, [userId]);

  const saveSlug = async () => {
    if (!userId || !slug.trim()) return;
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const { error } = await supabase
      .from("profiles")
      .update({ slug: cleanSlug } as any)
      .eq("user_id", userId);
    if (error) {
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        toast.error("Este slug já está em uso. Escolha outro.");
      } else {
        toast.error("Erro ao salvar slug.");
      }
    } else {
      setSlug(cleanSlug);
      setSlugSaved(true);
      toast.success(`Sua página pública: /u/${cleanSlug}`);
      setTimeout(() => setSlugSaved(false), 3000);
    }
  };

  const checkAdmin = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();
    setIsAdmin((data as any)?.role === "admin");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const applyTheme = (theme: ThemePreset) => {
    updateSettings({
      buttonColor: theme.buttonColor,
      buttonTextColor: theme.buttonTextColor,
      backgroundColor: theme.backgroundColor,
      backgroundGradient: theme.backgroundGradient,
      backgroundImage: theme.backgroundImage,
      shadowIntensity: theme.shadowIntensity,
    });
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateSettings({ backgroundImage: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateSettings({ logo: reader.result as string });
      reader.readAsDataURL(file);
    }
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

    const items = [...links];
    const dragIndex = items.findIndex(l => l.id === draggedId);
    const dropIndex = items.findIndex(l => l.id === targetId);
    const [moved] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, moved);
    reorderLinks(items);
    setDraggedId(null);
  }, [draggedId, links, reorderLinks]);

  if (isLoading || settingsLoading || linksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">{settings.pageTitle || "Painel Administrativo"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Página
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto px-4 pb-0 flex gap-1">
          <button
            onClick={() => setActiveTab("links")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === "links" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Link2 className="w-4 h-4 inline mr-1.5" />
            Links
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === "analytics" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1.5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === "settings" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Settings2 className="w-4 h-4 inline mr-1.5" />
            Configurações
          </button>
          <button
            onClick={() => { setActiveTab("preview"); setPreviewKey(k => k + 1); }}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === "preview" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Eye className="w-4 h-4 inline mr-1.5" />
            Preview
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* ===== LINKS TAB ===== */}
        {activeTab === "links" && (
          <>
            {/* Links */}
            <section className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Gerenciar Links</h2>
                <div className="flex items-center gap-2">
                  <Button onClick={async () => {
                    try { await addLink('link'); } catch (e: any) { toast.error(e.message || "Erro ao adicionar"); }
                  }} className="bg-primary hover:bg-primary/90" size="sm">
                    <Link2 className="w-4 h-4 mr-1" />
                    Link
                  </Button>
                  <Button onClick={async () => {
                    try { await addLink('video'); } catch (e: any) { toast.error(e.message || "Erro ao adicionar"); }
                  }} variant="secondary" size="sm">
                    <Video className="w-4 h-4 mr-1" />
                    Vídeo
                  </Button>
                  <Button onClick={async () => {
                    try { await addLink('audio'); } catch (e: any) { toast.error(e.message || "Erro ao adicionar"); }
                  }} variant="secondary" size="sm">
                    <Music2 className="w-4 h-4 mr-1" />
                    Áudio
                  </Button>
                </div>
              </div>
              <div className="space-y-4" onDragEnd={() => setDraggedId(null)}>
                {links
                  .sort((a, b) => a.order - b.order)
                  .map((link) => (
                    <LinkEditor
                      key={link.id}
                      link={link}
                      clicks={link.clickCount || 0}
                      userId={userId}
                      onUpdate={updateLink}
                      onDelete={deleteLink}
                      onResetClicks={() => {}}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedId === link.id}
                    />
                  ))}
                {links.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhum link adicionado ainda.</p>
                    <p className="text-sm mt-1">Clique nos botões acima para começar.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {activeTab === "analytics" && (
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Dashboard de Analytics</h2>
            </div>
            <AnalyticsDashboard userId={userId} />
          </section>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === "settings" && (
          <>
            {/* SEO Settings */}
            <section className="glass-card">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                SEO e Título da Página
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Nome do Painel</label>
                  <Input
                    value={settings.pageTitle || ""}
                    onChange={(e) => updateSettings({ pageTitle: e.target.value })}
                    placeholder="Painel Administrativo"
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Aparece no cabeçalho do painel admin</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Título SEO (meta title)</label>
                  <Input
                    value={settings.seoTitle || ""}
                    onChange={(e) => updateSettings({ seoTitle: e.target.value })}
                    placeholder="Minha Bio Link - Todos os links em um só lugar"
                    className="bg-input border-border"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{(settings.seoTitle || "").length}/60 caracteres</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Descrição SEO (meta description)</label>
                  <Textarea
                    value={settings.seoDescription || ""}
                    onChange={(e) => updateSettings({ seoDescription: e.target.value })}
                    placeholder="Encontre todos os meus links, redes sociais e conteúdos em um só lugar."
                    className="bg-input border-border resize-none"
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{(settings.seoDescription || "").length}/160 caracteres</p>
                </div>
              </div>
            </section>

            {/* Brand Settings */}
            <section className="glass-card">
              <h2 className="text-lg font-semibold mb-6">Configurações da Marca</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground block">Logo</label>
                  <div className="flex items-center gap-4">
                    {settings.logo ? (
                      <div className="relative">
                        <img src={settings.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-border" />
                        <button onClick={() => updateSettings({ logo: "" })} className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground block">Nome da Marca</label>
                  <Input value={settings.brandName} onChange={(e) => updateSettings({ brandName: e.target.value })} className="bg-input border-border" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-muted-foreground block">Descrição</label>
                <Textarea value={settings.description} onChange={(e) => updateSettings({ description: e.target.value })} className="bg-input border-border resize-none" rows={2} />
              </div>
            </section>

            {/* Public URL (Slug) */}
            <section className="glass-card">
              <h2 className="text-lg font-semibold mb-4">Página Pública</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Configure o endereço da sua página pública. Ex: /u/meunome
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-mono">/u/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  placeholder="meunome"
                  className="bg-input border-border flex-1 font-mono"
                />
                <Button onClick={saveSlug} variant={slugSaved ? "secondary" : "default"} size="sm">
                  {slugSaved ? "✓ Salvo" : "Salvar"}
                </Button>
              </div>
              {slug && (
                <p className="text-xs text-muted-foreground mt-2">
                  Sua página: <a href={`/u/${slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">/u/{slug}</a>
                </p>
              )}
            </section>

            {/* Appearance */}
            <section className="glass-card">
              <h2 className="text-lg font-semibold mb-6">Aparência</h2>
              <div className="mb-8">
                <ThemeSelector currentSettings={settings} onSelectTheme={applyTheme} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker label="Cor dos Botões" value={settings.buttonColor} onChange={(color) => updateSettings({ buttonColor: color })} />
                <ColorPicker label="Cor do Texto dos Botões" value={settings.buttonTextColor} onChange={(color) => updateSettings({ buttonTextColor: color })} />
              </div>

              {/* Background Options */}
              <div className="mt-8 space-y-6">
                <h3 className="text-sm font-semibold text-foreground">Fundo da Página</h3>

                {/* Solid Background Color */}
                <div>
                  <ColorPicker label="Cor de Fundo Sólida" value={settings.backgroundColor} onChange={(color) => updateSettings({ backgroundColor: color })} />
                </div>

                {/* Gradient Presets */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground block">Degradê Pré-definido</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "Noite", value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
                      { name: "Oceano", value: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
                      { name: "Pôr do Sol", value: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)" },
                      { name: "Floresta", value: "linear-gradient(135deg, #0b8793 0%, #360033 100%)" },
                      { name: "Roxo", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
                      { name: "Fogo", value: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)" },
                      { name: "Menta", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
                      { name: "Rosé", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateSettings({ backgroundGradient: preset.value })}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div
                          className="w-full h-10 rounded-lg border-2 border-border group-hover:border-primary transition-colors"
                          style={{ background: preset.value }}
                        />
                        <span className="text-[10px] text-muted-foreground">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Gradient */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground block">Degradê Customizado (CSS)</label>
                  <Input
                    value={settings.backgroundGradient}
                    onChange={(e) => updateSettings({ backgroundGradient: e.target.value })}
                    placeholder="linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)"
                    className="bg-input border-border font-mono text-xs"
                  />
                  {settings.backgroundGradient && (
                    <div className="flex items-center gap-3 mt-2">
                      <div
                        className="w-full h-10 rounded-lg border border-border"
                        style={{ background: settings.backgroundGradient }}
                      />
                      <button
                        onClick={() => updateSettings({ backgroundGradient: "" })}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Background Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground block">
                    <Image className="w-4 h-4 inline mr-1.5" />
                    Imagem de Fundo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.backgroundImage ? (
                      <div className="relative">
                        <img src={settings.backgroundImage} alt="Fundo" className="w-32 h-20 rounded-xl object-cover border border-border" />
                        <button onClick={() => updateSettings({ backgroundImage: "" })} className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Opacity */}
                {settings.backgroundImage && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block">Opacidade da Imagem de Fundo</label>
                    <div className="flex items-center gap-4">
                      <Slider value={[settings.backgroundOpacity]} onValueChange={([v]) => updateSettings({ backgroundOpacity: v })} min={0} max={1} step={0.05} className="flex-1" />
                      <span className="text-sm font-mono text-muted-foreground w-12 text-right">{Math.round(settings.backgroundOpacity * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shadow */}
              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-muted-foreground block">Intensidade da Sombra 3D</label>
                <div className="flex items-center gap-4">
                  <Slider value={[settings.shadowIntensity]} onValueChange={([value]) => updateSettings({ shadowIntensity: value })} min={0} max={2} step={0.1} className="flex-1" />
                  <span className="text-sm font-mono text-muted-foreground w-12 text-right">{settings.shadowIntensity.toFixed(1)}</span>
                </div>
              </div>
            </section>

            {/* User Management - Admin Only */}
            {isAdmin && (
              <section className="glass-card">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Gerenciar Usuários</h2>
                </div>
                <UserManagement />
              </section>
            )}
          </>
        )}

        {/* ===== PREVIEW TAB ===== */}
        {activeTab === "preview" && (
          <section className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Preview da Página Pública</h2>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {([
                  { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
                  { id: "tablet" as const, icon: Tablet, label: "Tablet" },
                  { id: "desktop" as const, icon: Monitor, label: "Desktop" },
                ]).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setPreviewDevice(id)}
                    className={`p-1.5 rounded-md transition-colors ${previewDevice === id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewKey(k => k + 1)}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Atualizar
                </Button>
                {slug && (
                  <a href={`/u/${slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir
                  </a>
                )}
              </div>
            </div>
            {slug ? (
              <div className="flex justify-center">
                <div
                  className="rounded-xl border border-border overflow-hidden bg-background transition-all duration-300"
                  style={{
                    width: previewDevice === "mobile" ? 375 : previewDevice === "tablet" ? 768 : "100%",
                    height: "70vh",
                  }}
                >
                  <iframe
                    key={previewKey}
                    src={`/u/${slug}`}
                    className="w-full h-full"
                    title="Preview da página pública"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Eye className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Nenhum slug configurado</p>
                <p className="text-sm mt-1">Vá em Configurações → Página Pública e defina seu slug para ver o preview.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center">
          <a
            href="https://wa.me/5583986241260"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white font-medium transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Suporte via WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
