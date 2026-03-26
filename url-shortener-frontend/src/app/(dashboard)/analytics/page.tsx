"use client";

import Link from "next/link";
import { format } from "date-fns";
import { BarChart3, Loader2, MousePointerClick } from "lucide-react";

import { ANALYTICS_PAGE_TEXT } from "@/features/analytics/constants/analyticsPage.constants";
import { useAnalyticsRootPage } from "@/features/analytics/hooks/useAnalyticsRootPage";
import { UrlDetail } from "@/features/urls/types/url.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageNumberBadge } from "@/shared/components/ui/page-number-badge";
import { DATE_FORMATS } from "@/shared/constants/formats";
import { ROUTES } from "@/shared/constants/routes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export default function AnalyticsRootPage() {
  const {
    page,
    urls,
    totalPages,
    totalClicks,
    isLoading,
    isError,
    canGoPrevious,
    canGoNext,
    getProgressWidth,
    goToPreviousPage,
    goToNextPage,
  } = useAnalyticsRootPage();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{ANALYTICS_PAGE_TEXT.title}</h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{ANALYTICS_PAGE_TEXT.subtitle}</p>
      </header>

      <Card className="stitch-card rounded-2xl p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{ANALYTICS_PAGE_TEXT.totalClicksLabel}</p>
              <div className="mt-1 text-3xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{urls.length} {ANALYTICS_PAGE_TEXT.urlsInPageSuffix}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/70 p-3 text-primary">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="stitch-card overflow-hidden rounded-2xl">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-xl">{ANALYTICS_PAGE_TEXT.sectionTitle}</CardTitle>
          <CardDescription>{ANALYTICS_PAGE_TEXT.sectionDescription}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {ANALYTICS_PAGE_TEXT.loading}
            </div>
          )}

          {isError && (
            <div className="p-8 text-center text-destructive">{ANALYTICS_PAGE_TEXT.error}</div>
          )}

          {!isLoading && !isError && urls.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">{ANALYTICS_PAGE_TEXT.empty}</div>
          )}

          {!isLoading && !isError && urls.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ANALYTICS_PAGE_TEXT.headers.shortLink}</TableHead>
                    <TableHead>{ANALYTICS_PAGE_TEXT.headers.createdAt}</TableHead>
                    <TableHead>{ANALYTICS_PAGE_TEXT.headers.clicks}</TableHead>
                    <TableHead className="text-right">{ANALYTICS_PAGE_TEXT.headers.action}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((url: UrlDetail) => {
                    const clickCount = Number(url.clickCount || 0);
                    const progressWidth = getProgressWidth(url);

                    return (
                      <TableRow key={url.id}>
                        <TableCell className="font-medium">
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-all duration-200 hover:text-primary hover:underline"
                          >
                            {`${url.shortCode}`}
                          </a>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(url.createdAt), DATE_FORMATS.TABLE_DATE)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                              {clickCount.toLocaleString()} {ANALYTICS_PAGE_TEXT.clicksSuffix}
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary transition-all duration-200"
                                style={{ width: `${progressWidth}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline" className="transition-all duration-200">
                            <Link href={ROUTES.ANALYTICS_DETAIL(url.id)}>{ANALYTICS_PAGE_TEXT.viewReport}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/35 px-6 py-5">
                <div className="text-sm text-muted-foreground">
                  {ANALYTICS_PAGE_TEXT.paginationLabel} {page + 1} {ANALYTICS_PAGE_TEXT.paginationOf} {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoPrevious}
                    onClick={goToPreviousPage}
                  >
                    {ANALYTICS_PAGE_TEXT.previous}
                  </Button>
                  <PageNumberBadge value={page + 1} active />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoNext}
                    onClick={goToNextPage}
                  >
                    {ANALYTICS_PAGE_TEXT.next}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
