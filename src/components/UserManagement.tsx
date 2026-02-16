import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Users, Shield, Clock, Link2, Ban, CheckCircle, Search,
  ChevronDown, ChevronUp, Trash2, Edit2, Save, X, Crown
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  max_links: number;
  expires_at: string | null;
  is_blocked: boolean;
  created_at: string;
  role: string;
  link_count: number;
}

interface UserLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
  click_count: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userLinks, setUserLinks] = useState<Record<string, UserLink[]>>({});
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles" as any)
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch link counts per user
      const { data: links, error: linksError } = await supabase
        .from("bio_links")
        .select("user_id");

      if (linksError) throw linksError;

      const linkCounts: Record<string, number> = {};
      (links || []).forEach((l: any) => {
        linkCounts[l.user_id] = (linkCounts[l.user_id] || 0) + 1;
      });

      const rolesMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => {
        rolesMap[r.user_id] = r.role;
      });

      const mapped = (profiles || []).map((p: any) => ({
        ...p,
        role: rolesMap[p.user_id] || "user",
        link_count: linkCounts[p.user_id] || 0,
      }));

      setUsers(mapped);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bio_links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order");

    if (!error && data) {
      setUserLinks(prev => ({ ...prev, [userId]: data as any }));
    }
  };

  const toggleExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      if (!userLinks[userId]) {
        fetchUserLinks(userId);
      }
    }
  };

  const toggleBlock = async (user: UserProfile) => {
    const { error } = await supabase
      .from("profiles" as any)
      .update({ is_blocked: !user.is_blocked } as any)
      .eq("user_id", user.user_id);

    if (error) {
      toast.error("Erro ao atualizar usuário");
    } else {
      toast.success(user.is_blocked ? "Usuário desbloqueado" : "Usuário bloqueado");
      fetchUsers();
    }
  };

  const toggleAdmin = async (user: UserProfile) => {
    if (user.role === "admin") {
      // Downgrade to user
      const { error } = await supabase
        .from("user_roles" as any)
        .update({ role: "user" } as any)
        .eq("user_id", user.user_id);
      if (!error) {
        toast.success("Permissão de admin removida");
        fetchUsers();
      }
    } else {
      // Upgrade to admin
      const { error } = await supabase
        .from("user_roles" as any)
        .update({ role: "admin" } as any)
        .eq("user_id", user.user_id);
      if (!error) {
        toast.success("Promovido a admin");
        fetchUsers();
      }
    }
  };

  const startEdit = (user: UserProfile) => {
    setEditingUser(user.user_id);
    setEditForm({
      max_links: user.max_links,
      expires_at: user.expires_at ? user.expires_at.split("T")[0] : "",
      display_name: user.display_name,
    });
  };

  const saveEdit = async (userId: string) => {
    const updates: any = {
      max_links: editForm.max_links,
      display_name: editForm.display_name,
      expires_at: editForm.expires_at ? new Date(editForm.expires_at as string).toISOString() : null,
    };

    const { error } = await supabase
      .from("profiles" as any)
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Usuário atualizado");
      setEditingUser(null);
      fetchUsers();
    }
  };

  const deleteUserLink = async (linkId: string, userId: string) => {
    const { error } = await supabase
      .from("bio_links")
      .delete()
      .eq("id", linkId);

    if (!error) {
      toast.success("Link removido");
      fetchUserLinks(userId);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u =>
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-8 h-8 mx-auto mb-2 animate-pulse" />
        Carregando usuários...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por e-mail ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{users.filter(u => !u.is_blocked && !isExpired(u.expires_at)).length}</p>
          <p className="text-xs text-muted-foreground">Ativos</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{users.filter(u => u.is_blocked || isExpired(u.expires_at)).length}</p>
          <p className="text-xs text-muted-foreground">Bloqueados</p>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const expired = isExpired(user.expires_at);
          const isEditing = editingUser === user.user_id;
          const expanded = expandedUser === user.user_id;

          return (
            <div key={user.user_id} className="admin-card">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.role === "admin"
                      ? "bg-primary/20 text-primary"
                      : user.is_blocked || expired
                        ? "bg-destructive/20 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {user.role === "admin" ? <Crown className="w-4 h-4" /> : (user.display_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{user.display_name || "Sem nome"}</p>
                      {user.role === "admin" && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary">ADMIN</span>
                      )}
                      {user.is_blocked && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">BLOQUEADO</span>
                      )}
                      {expired && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">EXPIRADO</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    <Link2 className="w-3 h-3 inline mr-1" />
                    {user.link_count}/{user.max_links}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleExpand(user.user_id)}
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded Panel */}
              {expanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* Edit Form or Actions */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Nome</label>
                          <Input
                            value={editForm.display_name || ""}
                            onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                            className="bg-input border-border h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Limite de Links</label>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={editForm.max_links || 5}
                            onChange={(e) => setEditForm(prev => ({ ...prev, max_links: parseInt(e.target.value) || 5 }))}
                            className="bg-input border-border h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Expira em</label>
                          <Input
                            type="date"
                            value={(editForm.expires_at as string) || ""}
                            onChange={(e) => setEditForm(prev => ({ ...prev, expires_at: e.target.value }))}
                            className="bg-input border-border h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(user.user_id)} className="gap-1">
                          <Save className="w-3 h-3" /> Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)} className="gap-1">
                          <X className="w-3 h-3" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(user)} className="gap-1 text-xs">
                        <Edit2 className="w-3 h-3" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_blocked ? "default" : "outline"}
                        onClick={() => toggleBlock(user)}
                        className={`gap-1 text-xs ${user.is_blocked ? "bg-green-600 hover:bg-green-700" : "text-destructive hover:bg-destructive/10"}`}
                      >
                        {user.is_blocked ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {user.is_blocked ? "Desbloquear" : "Bloquear"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAdmin(user)}
                        className="gap-1 text-xs"
                      >
                        <Shield className="w-3 h-3" />
                        {user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                      </Button>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-muted-foreground">Links</p>
                      <p className="font-semibold text-foreground">{user.link_count} / {user.max_links}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-muted-foreground">Criado em</p>
                      <p className="font-semibold text-foreground">{new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-muted-foreground">Validade</p>
                      <p className={`font-semibold ${expired ? "text-destructive" : "text-foreground"}`}>
                        {user.expires_at ? new Date(user.expires_at).toLocaleDateString("pt-BR") : "Ilimitado"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-muted-foreground">Status</p>
                      <p className={`font-semibold ${user.is_blocked || expired ? "text-destructive" : "text-green-500"}`}>
                        {user.is_blocked ? "Bloqueado" : expired ? "Expirado" : "Ativo"}
                      </p>
                    </div>
                  </div>

                  {/* User Links */}
                  {userLinks[user.user_id] && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Links do Usuário</h4>
                      {userLinks[user.user_id].length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhum link criado.</p>
                      ) : (
                        <div className="space-y-2">
                          {userLinks[user.user_id].map((link) => (
                            <div key={link.id} className="flex items-center justify-between rounded-lg bg-muted/20 p-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{link.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <span className={`text-xs ${link.enabled ? "text-green-500" : "text-muted-foreground"}`}>
                                  {link.enabled ? "Ativo" : "Inativo"}
                                </span>
                                <span className="text-xs text-muted-foreground">{link.click_count} cliques</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteUserLink(link.id, user.user_id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
