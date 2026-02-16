import { useClickAnalytics } from "@/hooks/useClickAnalytics";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { MousePointerClick, Smartphone, Monitor, Tablet, Globe, TrendingUp } from "lucide-react";

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

export function AnalyticsDashboard({ userId }: Props) {
  const { clicksByDay, clicksByDevice, clicksByBrowser, clicksByOS, clicksByLink, totalClicks, loading } = useClickAnalytics(userId);

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
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MousePointerClick className="w-4 h-4" />
            <span className="text-xs font-medium">Total Cliques</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Hoje</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {clicksByDay.length > 0 ? clicksByDay[clicksByDay.length - 1].clicks : 0}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs font-medium">Dispositivos</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{clicksByDevice.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">Links Ativos</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{clicksByLink.length}</p>
        </div>
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
        {/* Devices */}
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
                  <div className="h-1.5 bg-muted rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(d.clicks / totalClicks) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Navegadores</h3>
          <div className="space-y-3">
            {clicksByBrowser.slice(0, 5).map((b, i) => (
              <div key={b.browser} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{b.browser}</span>
                    <span className="text-muted-foreground font-mono">{b.clicks}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(b.clicks / totalClicks) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OS */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Sistemas Operacionais</h3>
          <div className="space-y-3">
            {clicksByOS.slice(0, 5).map((o, i) => (
              <div key={o.os} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{o.os}</span>
                    <span className="text-muted-foreground font-mono">{o.clicks}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(o.clicks / totalClicks) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <div className="h-1.5 bg-muted rounded-full mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(l.clicks / (clicksByLink[0]?.clicks || 1)) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
