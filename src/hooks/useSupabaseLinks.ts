import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BioLink, defaultLinks } from "@/types";

export function useSupabaseLinks(userId: string | undefined) {
  const [links, setLinks] = useState<BioLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!userId) {
      // Public: load all enabled links
      const { data } = await supabase
        .from("bio_links")
        .select("*")
        .eq("enabled", true)
        .order("sort_order", { ascending: true });
      setLinks((data || []).map(mapDbToLink));
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("bio_links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      setLinks(data.map(mapDbToLink));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const updateLink = useCallback(
    async (id: string, updates: Partial<BioLink>) => {
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
      const dbUpdates: any = {};
      if (updates.label !== undefined) dbUpdates.label = updates.label;
      if (updates.url !== undefined) dbUpdates.url = updates.url;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;
      if (updates.order !== undefined) dbUpdates.sort_order = updates.order;

      await supabase.from("bio_links").update(dbUpdates).eq("id", id);
    },
    []
  );

  const deleteLink = useCallback(async (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("bio_links").delete().eq("id", id);
  }, []);

  const addLink = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("bio_links")
      .insert({
        user_id: userId,
        label: "Novo Link",
        url: "https://",
        icon: "external-link",
        enabled: true,
        sort_order: links.length,
      })
      .select()
      .single();

    if (data) {
      setLinks((prev) => [...prev, mapDbToLink(data)]);
    }
  }, [userId, links.length]);

  const reorderLinks = useCallback(
    async (reordered: BioLink[]) => {
      const updated = reordered.map((l, i) => ({ ...l, order: i }));
      setLinks(updated);
      // Batch update sort_order
      for (const link of updated) {
        await supabase
          .from("bio_links")
          .update({ sort_order: link.order })
          .eq("id", link.id);
      }
    },
    []
  );

  const incrementClick = useCallback(async (id: string) => {
    await supabase.rpc("increment_click", { link_id: id });
  }, []);

  return {
    links,
    setLinks,
    loading,
    updateLink,
    deleteLink,
    addLink,
    reorderLinks,
    incrementClick,
  };
}

function mapDbToLink(data: any): BioLink {
  return {
    id: data.id,
    label: data.label,
    url: data.url,
    icon: data.icon || "external-link",
    enabled: data.enabled ?? true,
    order: data.sort_order ?? 0,
    clickCount: data.click_count ?? 0,
  };
}
