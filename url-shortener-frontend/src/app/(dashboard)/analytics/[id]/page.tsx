import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, CalendarDays, Download } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import { ANALYTICS_DETAIL_TEXT } from "@/features/analytics/constants/analyticsDashboardUi.constants";

export default async function AnalyticsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idStr = resolvedParams.id;
  const idNum = parseInt(idStr, 10);

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href={ROUTES.URLS} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Trở về danh sách
          </Link>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{ANALYTICS_DETAIL_TEXT.reportTitle}</h1>
          <p className="mt-1 text-base text-muted-foreground">
            {ANALYTICS_DETAIL_TEXT.linkId} <span className="font-mono text-primary">{idStr}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="h-10 gap-2 px-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {ANALYTICS_DETAIL_TEXT.last30Days}
          </Button>
          <Button variant="outline" className="h-10 gap-2 px-4 text-xs font-bold uppercase tracking-[0.14em]">
            <Download className="h-4 w-4" />
            {ANALYTICS_DETAIL_TEXT.export}
          </Button>
        </div>
      </header>

      <AnalyticsDashboard id={idNum} />
    </div>
  );
}
