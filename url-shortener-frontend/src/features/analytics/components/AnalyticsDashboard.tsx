"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAnalyticsDashboard } from "../hooks/useAnalyticsDashboard";
import {
  ANALYTICS_DASHBOARD_TEXT,
  ANALYTICS_REFERRER_BAR_CLASS,
  ANALYTICS_REFERRER_DOT_CLASS,
} from "../constants/analyticsDashboardUi.constants";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CalendarRange, Globe2, Loader2, Monitor, MousePointerClick, Smartphone, Tablet } from "lucide-react";
import { ANALYTICS_CONSTANTS } from "@/shared/constants/analytics";

export function AnalyticsDashboard({ id }: { id: number }) {
  const {
    data,
    isLoading,
    isError,
    formattedDateData,
    formattedReferrerData,
    averageClicksPerDay,
    topReferer,
  } = useAnalyticsDashboard(id);

  const maxSourceClicks = Math.max(...formattedReferrerData.map((item) => item.clicks), 1);

  if (isLoading) {
    return (
      <div className="stitch-card flex h-64 items-center justify-center rounded-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="stitch-card flex h-64 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        {ANALYTICS_DASHBOARD_TEXT.loadError} {id}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="stitch-card rounded-2xl border-border/40 p-6">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/70">
                <MousePointerClick className="h-5 w-5 text-primary" />
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">{ANALYTICS_DASHBOARD_TEXT.growth.up}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.cards.totalClicks}</p>
              <p className="text-4xl font-black tracking-tight text-foreground">{data.totalClicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stitch-card rounded-2xl border-border/40 p-6">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/70">
                <CalendarRange className="h-5 w-5 text-chart-1" />
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.growth.down}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.cards.avgClicksPerDay}</p>
              <p className="text-4xl font-black tracking-tight text-foreground">{averageClicksPerDay}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stitch-card rounded-2xl border-border/40 p-6">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/70">
                <Globe2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">{ANALYTICS_DASHBOARD_TEXT.cards.top}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.cards.topReferrer}</p>
              <p className="truncate text-4xl font-black tracking-tight text-foreground">{topReferer}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="stitch-card rounded-2xl border-border/40 p-8 lg:col-span-2">
          <CardContent className="space-y-6 p-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.sections.clicksOverTime}</h3>
              <div className="flex gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/80 text-primary">
                  <span className="text-xs">↗</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground">
                  <span className="text-xs">▮</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full rounded-xl border border-border bg-secondary/45 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedDateData} margin={ANALYTICS_CONSTANTS.LINE_CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    connectNulls
                    dot={{ r: 4, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
              {formattedDateData.slice(0, 5).map((item) => (
                <span key={item.date}>{item.displayDate}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="stitch-card rounded-2xl border-border/40 p-8">
          <CardContent className="space-y-6 p-0">
            <h3 className="text-lg font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.sections.trafficSources}</h3>

            <div className="space-y-6">
              {formattedReferrerData.map((source, index) => {
                const percent = Math.round((source.clicks / maxSourceClicks) * 100);
                const barClass = ANALYTICS_REFERRER_BAR_CLASS[index] ?? "bg-muted-foreground";

                return (
                  <div key={source.name} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">{source.name}</span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-secondary/55">
                      <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full rounded-xl border border-border/30 bg-secondary/60 py-3 text-sm font-semibold text-primary transition-all active:scale-[0.98] hover:bg-secondary/80">
              {ANALYTICS_DASHBOARD_TEXT.viewFullDetails}
            </button>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="stitch-card rounded-2xl border-border/40 p-8">
          <CardContent className="space-y-6 p-0">
            <h3 className="text-lg font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.sections.topCountries}</h3>
            <ul className="space-y-3">
              {formattedReferrerData.slice(0, 3).map((item, index) => (
                <li key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${ANALYTICS_REFERRER_DOT_CLASS[index] ?? "bg-muted-foreground"}`}
                    />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.clicks.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="stitch-card rounded-2xl border-border/40 p-8">
          <CardContent className="space-y-6 p-0">
            <h3 className="text-lg font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.sections.deviceBreakdown}</h3>
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary/70 text-primary">
                  <Smartphone className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.deviceValues.mobile}</span>
                <span className="text-xs text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.deviceLabels.mobile}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary/70 text-muted-foreground">
                  <Monitor className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.deviceValues.desktop}</span>
                <span className="text-xs text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.deviceLabels.desktop}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary/70 text-muted-foreground">
                  <Tablet className="h-7 w-7" />
                </div>
                <span className="text-sm font-semibold text-foreground">{ANALYTICS_DASHBOARD_TEXT.deviceValues.tablet}</span>
                <span className="text-xs text-muted-foreground">{ANALYTICS_DASHBOARD_TEXT.deviceLabels.tablet}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
