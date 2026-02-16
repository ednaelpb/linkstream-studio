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
import { ArrowLeft, Plus, ExternalLink, ImagePlus, Trash2, Image, Users, Video, Music2, Link2, BarChart3, Search, Settings2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"links" | "analytics" | "settings">("links");

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
              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-muted-foreground block">Intensidade da Sombra 3D</label>
                <div className="flex items-center gap-4">
                  <Slider value={[settings.shadowIntensity]} onValueChange={([value]) => updateSettings({ shadowIntensity: value })} min={0} max={2} step={0.1} className="flex-1" />
                  <span className="text-sm font-mono text-muted-foreground w-12 text-right">{settings.shadowIntensity.toFixed(1)}</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
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
      </main>
    </div>
  );
};

export default Admin;
