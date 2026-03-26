"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart2,
  // CalendarClock,
  Copy,
  ExternalLink,
  ImagePlus,
  // KeyRound,
  // MoreVertical,
  MousePointerClick,
  Pencil,
  Trash2,
  Link2,
} from "lucide-react";
import Link from "next/link";

import { EditUrlDialog } from "./EditUrlDialog";
import { useUrlsTableLogic } from "../hooks/useUrlsTableLogic";
import { UrlDetail, UrlQueryOptions } from "../types/url.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { PageNumberBadge } from "@/shared/components/ui/page-number-badge";
import { ROUTES } from "@/shared/constants/routes";
import { DATE_FORMATS } from "@/shared/constants/formats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { URLS_TABLE_STATUS_DOT_STYLE, URLS_TABLE_STATUS_STYLE, URLS_TABLE_TEXT } from "../constants/urlsTable.constants";
import { getUrlStatus, isUrlActionable } from "../lib/urlStatus";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/shared/components/ui/dropdown-menu";

type UrlsTableVariant = "full" | "compact";

interface UrlsTableProps {
  variant?: UrlsTableVariant;
  query?: UrlQueryOptions;
}

export function UrlsTable({ variant = "full", query }: UrlsTableProps) {
  const [editingUrl, setEditingUrl] = useState<UrlDetail | null>(null);

  const {
    page,
    data,
    isLoading,
    isError,
    totalPages,
    canGoPrevious,
    canGoNext,
    // isUpdatingPassword,
    // isUpdatingExpiration,
    buildShortUrl,
    handleCopy,
    handleDelete,
    // handlePasswordUpdate,
    // handleExpirationUpdate,
    goToPreviousPage,
    goToNextPage,
  } = useUrlsTableLogic(query);

  const urls = useMemo(() => data?.data ?? [], [data?.data]);
  const compactUrls = useMemo(
    () => urls.filter((url) => isUrlActionable(url)).slice(0, 3),
    [urls]
  );

  if (isLoading) {
    return (
      <div className={cn("p-8 text-center text-muted-foreground", variant === "compact" && "p-0 text-left")}>{URLS_TABLE_TEXT.loading}</div>
    );
  }

  if (isError) {
    return (
      <div className={cn("p-8 text-center text-destructive", variant === "compact" && "p-0 text-left")}>{URLS_TABLE_TEXT.error}</div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="stitch-card flex flex-col items-center justify-center gap-3 rounded-2xl p-10 text-center text-muted-foreground">
        <div className="rounded-full border border-border bg-secondary/70 p-4">
          <Link2 className="h-8 w-8" />
        </div>
        <div>
          <p className="font-medium text-foreground">{URLS_TABLE_TEXT.emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{URLS_TABLE_TEXT.emptyDescription}</p>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{URLS_TABLE_TEXT.compactHeaders.shortLink}</TableHead>
              <TableHead>{URLS_TABLE_TEXT.compactHeaders.destination}</TableHead>
              <TableHead className="text-right">{URLS_TABLE_TEXT.compactHeaders.clicks}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compactUrls.map((url: UrlDetail) => {
              const shortUrl = url.shortUrl || buildShortUrl(url.shortCode);
              const canUseLink = isUrlActionable(url);

              return (
                <TableRow key={url.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {canUseLink ? (
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          <span className="max-w-45 truncate">{url.shortCode}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground opacity-70">
                          <span className="max-w-45 truncate">{url.shortCode}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(url.shortCode)}
                        disabled={!canUseLink}
                        className={cn(
                          "rounded-lg p-1 text-muted-foreground transition-colors",
                          canUseLink
                            ? "hover:bg-muted/40 hover:text-primary"
                            : "cursor-not-allowed opacity-50"
                        )}
                        aria-label={URLS_TABLE_TEXT.aria.copyShortLink}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-55 truncate text-muted-foreground">{url.originalUrl}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex rounded-full border border-border bg-secondary/75 px-3 py-1 text-xs font-semibold text-primary">
                      {Number(url.clickCount || 0).toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="stitch-card overflow-hidden rounded-2xl bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-8">{URLS_TABLE_TEXT.fullHeaders.shortLink}</TableHead>
            <TableHead className="px-8">{URLS_TABLE_TEXT.fullHeaders.originalUrl}</TableHead>
            <TableHead className="px-8">{URLS_TABLE_TEXT.fullHeaders.status}</TableHead>
            <TableHead className="px-8 text-center">{URLS_TABLE_TEXT.fullHeaders.clicks}</TableHead>
            <TableHead className="px-8">{URLS_TABLE_TEXT.fullHeaders.createdAt}</TableHead>
            <TableHead className="px-8 text-right">{URLS_TABLE_TEXT.fullHeaders.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url: UrlDetail) => (
            <TableRow key={url.id} className="hover:bg-secondary/35">
              <TableCell className="px-8 py-6 font-medium">
                <div className="flex items-center gap-2">
                  {(() => {
                    const shortUrl = url.shortUrl || buildShortUrl(url.shortCode);
                    const canUseLink = isUrlActionable(url);

                    if (!canUseLink) {
                      return (
                        <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground opacity-70">
                          <span className="max-w-45 truncate">{url.shortCode}</span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      );
                    }

                    return (
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary transition-all duration-200 hover:underline"
                      >
                        <span className="max-w-45 truncate">{url.shortCode}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => handleCopy(url.shortCode)}
                    disabled={!isUrlActionable(url)}
                    className={cn(
                      "rounded-lg p-1 text-muted-foreground transition-colors",
                      isUrlActionable(url)
                        ? "hover:bg-muted/45 hover:text-primary"
                        : "cursor-not-allowed opacity-50"
                    )}
                    aria-label={URLS_TABLE_TEXT.aria.copyShortLink}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </TableCell>
              <TableCell className="max-w-65 px-8 py-6 truncate text-muted-foreground">
                {url.originalUrl}
              </TableCell>
              <TableCell className="px-8 py-6">
                {(() => {
                  const status = getUrlStatus(url);

                  return (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                        URLS_TABLE_STATUS_STYLE[status]
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", URLS_TABLE_STATUS_DOT_STYLE[status])}
                      />
                      {URLS_TABLE_TEXT.statusLabel[status]}
                    </span>
                  );
                })()}
              </TableCell>
              <TableCell className="px-8 py-6 text-center">
                <div className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
                  {Number(url.clickCount || 0).toLocaleString()}
                </div>
              </TableCell>
              <TableCell className="px-8 py-6 text-sm text-muted-foreground">
                {format(new Date(url.createdAt), DATE_FORMATS.TABLE_DATE)}
              </TableCell>
              <TableCell className="px-8 py-6 text-right">
                <div className="flex justify-end gap-1">
                  <Link
                    href={ROUTES.URL_MEDIA(url.id)}
                    className="rounded-lg border border-border/40 bg-secondary/35 p-2 text-muted-foreground transition-all hover:border-primary/35 hover:bg-secondary/60 hover:text-primary"
                    aria-label={URLS_TABLE_TEXT.aria.manageMedia}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Link>
                  <Link
                    href={ROUTES.ANALYTICS_DETAIL(url.id)}
                    className="rounded-lg border border-border/40 bg-secondary/35 p-2 text-muted-foreground transition-all hover:border-primary/35 hover:bg-secondary/60 hover:text-primary"
                    aria-label={URLS_TABLE_TEXT.aria.viewAnalytics}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditingUrl(url)}
                    className="rounded-lg border border-border/40 bg-secondary/35 p-2 text-muted-foreground transition-all hover:border-primary/35 hover:bg-secondary/60 hover:text-primary"
                    aria-label={URLS_TABLE_TEXT.aria.editUrl}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(url.id)}
                    className="rounded-lg border border-border/40 bg-secondary/35 p-2 text-muted-foreground transition-all hover:border-destructive/35 hover:bg-secondary/60 hover:text-destructive"
                    aria-label={URLS_TABLE_TEXT.aria.deleteUrl}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 w-9 p-0 text-muted-foreground hover:text-primary">
                        <span className="sr-only">Open advanced menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={isUpdatingPassword}
                        onClick={() => handlePasswordUpdate(url.id)}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        {url.hasPassword ? "Change/Remove Password" : "Set Password"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isUpdatingExpiration}
                        onClick={() => handleExpirationUpdate(url.id, url.expiresAt)}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        {url.expiresAt ? "Update/Clear Expiration" : "Set Expiration"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCopy(url.shortCode)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col items-center justify-between gap-6 border-t border-border/40 px-8 py-5 sm:flex-row">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {URLS_TABLE_TEXT.pagination.showingPage} {page + 1} {URLS_TABLE_TEXT.pagination.of} {totalPages} {URLS_TABLE_TEXT.pagination.urlsSuffix}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!canGoPrevious}
            className="gap-1"
          >
            {URLS_TABLE_TEXT.pagination.previous}
          </Button>

          <div className="flex gap-2">
            <PageNumberBadge value={page + 1} active />
            {page + 2 <= totalPages && (
              <PageNumberBadge value={page + 2} />
            )}
            {page + 3 <= totalPages && (
              <PageNumberBadge value={page + 3} />
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!canGoNext}
            className="gap-1"
          >
            {URLS_TABLE_TEXT.pagination.next}
          </Button>
        </div>
      </div>

      <EditUrlDialog
        url={editingUrl}
        open={!!editingUrl}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUrl(null);
          }
        }}
      />
    </div>
  );
}
