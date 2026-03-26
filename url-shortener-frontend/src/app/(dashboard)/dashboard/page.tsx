"use client";

import Link from "next/link";
import { Link as LinkIcon, Loader2 } from "lucide-react";

import { CreateUrlForm } from "@/features/urls/components/CreateUrlForm";
import { useDashboardPage } from "@/features/dashboard/hooks/useDashboardPage";
import { DASHBOARD_PAGE_TEXT } from "@/features/dashboard/constants/dashboardPage.constants";
import { UrlsTable } from "@/features/urls/components/UrlsTable";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";
import Image from "next/image";

export default function DashboardPage() {
  const { greeting, userName, avatarPreviewUrl, isLoading, statCards } = useDashboardPage();

  return (
    <div className="space-y-10">
      <header className="mb-12 flex items-start justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">WORKSPACE / OVERVIEW</p>
          <h1 className="mb-1 text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{greeting}, {userName}</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{DASHBOARD_PAGE_TEXT.subtitle}</p>
        </div>
        <div className="hidden items-center space-x-4 sm:flex">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary/70">
            {avatarPreviewUrl ? (
              <Image
                fill
                src={avatarPreviewUrl}
                alt="Ảnh đại diện"
                className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-primary">{userName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="stitch-card flex flex-col rounded-2xl p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-lg border border-border bg-secondary/70 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{DASHBOARD_PAGE_TEXT.trendLabel}</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{card.title}</span>
              <span className="mt-1 text-3xl font-black tracking-tight text-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : card.value}
              </span>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
                <div className="h-full w-2/3 bg-primary" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <Card className="stitch-card h-full rounded-2xl p-7">
            <CardContent className="p-0">
              <h2 className="mb-7 flex items-center gap-2 text-lg font-black uppercase tracking-[0.14em] text-foreground">
                <LinkIcon className="h-5 w-5 text-primary" />
                {DASHBOARD_PAGE_TEXT.quickCreateTitle}
              </h2>
              <CreateUrlForm />
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-3">
          <Card className="stitch-card h-full overflow-hidden rounded-2xl p-7">
            <CardContent className="p-0">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-[0.14em] text-foreground">{DASHBOARD_PAGE_TEXT.recentUrlsTitle}</h2>
                <Button asChild size="sm" variant="ghost" className="h-auto px-0 py-0 text-[11px] font-bold uppercase tracking-[0.14em] text-primary hover:bg-transparent hover:underline">
                  <Link href={ROUTES.URLS}>{DASHBOARD_PAGE_TEXT.viewAll}</Link>
                </Button>
              </div>

              <UrlsTable variant="compact" query={{ status: "ACTIVE" }} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
