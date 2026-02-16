import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  clicksByDay: { date: string; clicks: number }[];
  clicksByDevice: { device: string; clicks: number }[];
  clicksByBrowser: { browser: string; clicks: number }[];
  clicksByOS: { os: string; clicks: number }[];
  clicksByLink: { linkId: string; label: string; clicks: number }[];
  clicksByCountry: { country: string; clicks: number }[];
  clicksByCity: { city: string; clicks: number }[];
  totalClicks: number;
  loading: boolean;
  rawData: any[];
}

export type PeriodDays = 7 | 30 | 90;

export function useClickAnalytics(userId: string | undefined, periodDays: PeriodDays = 30): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    clicksByDay: [],
    clicksByDevice: [],
    clicksByBrowser: [],
    clicksByOS: [],
    clicksByLink: [],
    clicksByCountry: [],
    clicksByCity: [],
    totalClicks: 0,
    loading: true,
    rawData: [],
  });

  useEffect(() => {
    if (!userId) return;

    const fetchAnalytics = async () => {
      setData(prev => ({ ...prev, loading: true }));

      const since = new Date();
      since.setDate(since.getDate() - periodDays);

      const { data: analytics } = await supabase
        .from("click_analytics")
        .select("*, bio_links!inner(label)")
        .eq("user_id", userId)
        .gte("clicked_at", since.toISOString())
        .order("clicked_at", { ascending: false })
        .limit(1000);

      if (!analytics || analytics.length === 0) {
        setData(prev => ({ ...prev, loading: false, totalClicks: 0, clicksByDay: [], clicksByDevice: [], clicksByBrowser: [], clicksByOS: [], clicksByLink: [], clicksByCountry: [], clicksByCity: [], rawData: [] }));
        return;
      }

      // Clicks by day
      const dayMap: Record<string, number> = {};
      const now = new Date();
      for (let i = periodDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().split("T")[0]] = 0;
      }
      analytics.forEach((a: any) => {
        const day = new Date(a.clicked_at).toISOString().split("T")[0];
        if (dayMap[day] !== undefined) dayMap[day]++;
      });
      const clicksByDay = Object.entries(dayMap).map(([date, clicks]) => ({ date, clicks }));

      const aggregate = (key: string, fallback: string) => {
        const map: Record<string, number> = {};
        analytics.forEach((a: any) => {
          const v = a[key] || fallback;
          map[v] = (map[v] || 0) + 1;
        });
        return Object.entries(map).map(([name, clicks]) => ({ name, clicks })).sort((a, b) => b.clicks - a.clicks);
      };

      const clicksByDevice = aggregate("device_type", "Desconhecido").map(({ name, clicks }) => ({ device: name, clicks }));
      const clicksByBrowser = aggregate("browser", "Desconhecido").map(({ name, clicks }) => ({ browser: name, clicks }));
      const clicksByOS = aggregate("os", "Desconhecido").map(({ name, clicks }) => ({ os: name, clicks }));
      const clicksByCountry = aggregate("country", "Desconhecido").map(({ name, clicks }) => ({ country: name, clicks }));
      const clicksByCity = aggregate("city", "Desconhecido").map(({ name, clicks }) => ({ city: name, clicks }));

      // Clicks by link
      const linkMap: Record<string, { label: string; clicks: number }> = {};
      analytics.forEach((a: any) => {
        const id = a.link_id;
        const label = (a.bio_links as any)?.label || "Link";
        if (!linkMap[id]) linkMap[id] = { label, clicks: 0 };
        linkMap[id].clicks++;
      });
      const clicksByLink = Object.entries(linkMap).map(([linkId, { label, clicks }]) => ({ linkId, label, clicks }));
      clicksByLink.sort((a, b) => b.clicks - a.clicks);

      setData({
        clicksByDay, clicksByDevice, clicksByBrowser, clicksByOS, clicksByLink, clicksByCountry, clicksByCity,
        totalClicks: analytics.length, loading: false, rawData: analytics,
      });
    };

    fetchAnalytics();
  }, [userId, periodDays]);

  return data;
}

// Detect device info for tracking
export function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  let deviceType = "desktop";
  if (/Mobi|Android/i.test(ua)) deviceType = "mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceType = "tablet";

  let browser = "Outro";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = "Outro";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { deviceType, browser, os, referrer: document.referrer || null };
}
