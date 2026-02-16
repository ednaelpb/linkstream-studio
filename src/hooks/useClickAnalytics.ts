import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  clicksByDay: { date: string; clicks: number }[];
  clicksByDevice: { device: string; clicks: number }[];
  clicksByBrowser: { browser: string; clicks: number }[];
  clicksByOS: { os: string; clicks: number }[];
  clicksByLink: { linkId: string; label: string; clicks: number }[];
  totalClicks: number;
  loading: boolean;
}

export function useClickAnalytics(userId: string | undefined): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    clicksByDay: [],
    clicksByDevice: [],
    clicksByBrowser: [],
    clicksByOS: [],
    clicksByLink: [],
    totalClicks: 0,
    loading: true,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchAnalytics = async () => {
      // Fetch all analytics for user
      const { data: analytics } = await supabase
        .from("click_analytics")
        .select("*, bio_links!inner(label)")
        .eq("user_id", userId)
        .order("clicked_at", { ascending: false })
        .limit(1000);

      if (!analytics || analytics.length === 0) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Clicks by day (last 30 days)
      const dayMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().split("T")[0]] = 0;
      }
      analytics.forEach((a: any) => {
        const day = new Date(a.clicked_at).toISOString().split("T")[0];
        if (dayMap[day] !== undefined) dayMap[day]++;
      });
      const clicksByDay = Object.entries(dayMap).map(([date, clicks]) => ({ date, clicks }));

      // Clicks by device
      const deviceMap: Record<string, number> = {};
      analytics.forEach((a: any) => {
        const d = a.device_type || "Desconhecido";
        deviceMap[d] = (deviceMap[d] || 0) + 1;
      });
      const clicksByDevice = Object.entries(deviceMap).map(([device, clicks]) => ({ device, clicks }));

      // Clicks by browser
      const browserMap: Record<string, number> = {};
      analytics.forEach((a: any) => {
        const b = a.browser || "Desconhecido";
        browserMap[b] = (browserMap[b] || 0) + 1;
      });
      const clicksByBrowser = Object.entries(browserMap).map(([browser, clicks]) => ({ browser, clicks }));

      // Clicks by OS
      const osMap: Record<string, number> = {};
      analytics.forEach((a: any) => {
        const o = a.os || "Desconhecido";
        osMap[o] = (osMap[o] || 0) + 1;
      });
      const clicksByOS = Object.entries(osMap).map(([os, clicks]) => ({ os, clicks }));

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
        clicksByDay,
        clicksByDevice,
        clicksByBrowser,
        clicksByOS,
        clicksByLink,
        totalClicks: analytics.length,
        loading: false,
      });
    };

    fetchAnalytics();
  }, [userId]);

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
