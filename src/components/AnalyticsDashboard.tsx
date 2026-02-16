import { useClickAnalytics } from "@/hooks/useClickAnalytics";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MousePointerClick, Smartphone, Monitor, Tablet, Globe, TrendingUp, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)",
  "hsl(25 90% 55%)",
  "hsl(280 100% 60%)",
  "hsl(340 60% 70%)",
  "hsl(200 85% 45%)",
];

const deviceIcons: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
  tablet: <Tablet className="w-4 h-4" />,
};

interface Props {
  userId: string;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 bg-muted rounded-full mt-1">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function DataList({ items, labelKey, colorOffset = 0, max }: { items: { [key: string]: any }[]; labelKey: string; colorOffset?: number; max: number }) {
  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item, i) => (
        <div key={item[labelKey]} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">{item[labelKey]}</span>
              <span className="text-muted-foreground font-mono">{item.clicks}</span>
            </div>
            <ProgressBar value={item.clicks} max={max} color={COLORS[(i + colorOffset) % COLORS.length]} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard({ userId }: Props) {
  const { clicksByDay, clicksByDevice, clicksByBrowser, clicksByOS, clicksByLink, clicksByCountry, clicksByCity, totalClicks, loading, rawData } = useClickAnalytics(userId);

  const exportCSV = () => {
    if (!rawData.length) return;
    const headers = ["Data", "Link", "Dispositivo", "Navegador", "SO", "País", "Cidade", "Referrer"];
    const rows = rawData.map((a: any) => [
      new Date(a.clicked_at).toLocaleString("pt-BR"),
      (a.bio_links as any)?.label || "Link",
      a.device_type || "",
      a.browser || "",
      a.os || "",
      a.country || "",
      a.city || "",
      a.referrer || "",
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando analytics...</div>;
  }

  if (totalClicks === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MousePointerClick className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhum clique registrado ainda</p>
        <p className="text-sm mt-1">Os dados aparecerão conforme seus links forem acessados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1.5" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<MousePointerClick className="w-4 h-4" />} label="Total Cliques" value={totalClicks} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Hoje" value={clicksByDay.length > 0 ? clicksByDay[clicksByDay.length - 1].clicks : 0} />
        <StatCard icon={<Smartphone className="w-4 h-4" />} label="Dispositivos" value={clicksByDevice.length} />
        <StatCard icon={<Globe className="w-4 h-4" />} label="Links Ativos" value={clicksByLink.length} />
      </div>

      {/* Clicks per Day Chart */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Cliques por Dia (30 dias)</h3>
        <div className="h-[200px]">
          <ChartContainer config={{ clicks: { label: "Cliques", color: "hsl(217 91% 60%)" } }}>
            <BarChart data={clicksByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="clicks" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Device + Browser + OS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Dispositivos</h3>
          <div className="space-y-3">
            {clicksByDevice.map((d, i) => (
              <div key={d.device} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                  {deviceIcons[d.device] || <Monitor className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-foreground">{d.device}</span>
                    <span className="text-muted-foreground font-mono">{d.clicks}</span>
                  </div>
                  <ProgressBar value={d.clicks} max={totalClicks} color={COLORS[i % COLORS.length]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Navegadores</h3>
          <DataList items={clicksByBrowser} labelKey="browser" max={totalClicks} />
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Sistemas Operacionais</h3>
          <DataList items={clicksByOS} labelKey="os" max={totalClicks} />
        </div>
      </div>

      {/* Geolocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Países
          </h3>
          <DataList items={clicksByCountry} labelKey="country" max={clicksByCountry[0]?.clicks || 1} />
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Cidades
          </h3>
          <DataList items={clicksByCity} labelKey="city" max={clicksByCity[0]?.clicks || 1} />
        </div>
      </div>

      {/* Top Links */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Links Mais Clicados</h3>
        <div className="space-y-3">
          {clicksByLink.slice(0, 10).map((l, i) => (
            <div key={l.linkId} className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground w-6 text-right">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium truncate">{l.label}</span>
                  <span className="text-muted-foreground font-mono ml-2">{l.clicks}</span>
                </div>
                <ProgressBar value={l.clicks} max={clicksByLink[0]?.clicks || 1} color={COLORS[i % COLORS.length]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
