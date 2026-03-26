"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { CreateUrlForm } from "@/features/urls/components/CreateUrlForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ArrowUpDown, Download, Plus, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { UrlsTable } from "@/features/urls/components/UrlsTable";
import { useUrlsPage } from "@/features/urls/hooks/useUrlsPage";
import { URLS_PAGE_TEXT, URLS_SORT_OPTIONS } from "@/features/urls/constants/urlsPage.constants";
import { UrlStatusFilter } from "@/features/urls/types/url.types";

export default function UrlsPage() {
  const {
    search,
    debouncedSearch,
    status,
    sortBy,
    sortDir,
    sortDialogOpen,
    pendingSort,
    setSearch,
    setStatus,
    setPendingStatus,
    setPendingSort,
    handleSortDialogChange,
    applySort,
  } = useUrlsPage();

  const statusTabs: Array<{ label: string; value: UrlStatusFilter }> = [
    { label: "Tất cả", value: "ALL" },
    { label: "Đang hoạt động", value: "ACTIVE" },
    { label: "Đã hết hạn", value: "EXPIRED" },
  ];

  const sortLabelByValue: Record<string, string> = {
    "createdAt:desc": "Mới nhất",
    "createdAt:asc": "Cũ nhất",
    "clickCount:desc": "Nhiều lượt nhấp",
    "clickCount:asc": "Ít lượt nhấp",
    "expiresAt:asc": "Sắp hết hạn",
    "expiresAt:desc": "Hết hạn muộn",
  };

  const currentSort = `${sortBy}:${sortDir}`;

  return (
    <div className="space-y-8">
      <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">DASHBOARD / LINKS</p>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{URLS_PAGE_TEXT.title}</h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{URLS_PAGE_TEXT.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 gap-2 px-5">
            <Download className="h-4 w-4" />
            Xuất dữ liệu
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="stitch-primary-btn group flex h-11 items-center gap-2 px-6 text-base font-semibold">
                <Plus className="h-4 w-4" />
                {URLS_PAGE_TEXT.createNew}
              </Button>
            </DialogTrigger>
            <DialogContent className="stitch-card max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-190">
              <DialogHeader>
                <DialogTitle>{URLS_PAGE_TEXT.shortenUrl}</DialogTitle>
                <DialogDescription>
                  {URLS_PAGE_TEXT.shortenDescription}
                </DialogDescription>
              </DialogHeader>
              <CreateUrlForm />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="mb-8 flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={URLS_PAGE_TEXT.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="stitch-input w-full rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-secondary/55 p-1.5">
            {statusTabs.map((tab) => {
              const isActive = status === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setPendingStatus(tab.value);
                    setStatus(tab.value);
                  }}
                  className={cn(
                    "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Dialog open={sortDialogOpen} onOpenChange={(open) => {
            if (open) {
              setPendingSort(`${sortBy}:${sortDir}` as `${typeof sortBy}:${typeof sortDir}`);
            }
            handleSortDialogChange(open);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 px-5">
                <ArrowUpDown className="h-4 w-4" />
                Sắp xếp: {sortLabelByValue[currentSort]}
              </Button>
            </DialogTrigger>
            <DialogContent className="stitch-card max-w-md rounded-3xl p-0">
              <DialogHeader className="border-b border-border/50 px-6 py-5">
                <DialogTitle>{URLS_PAGE_TEXT.sortTitle}</DialogTitle>
                <DialogDescription>{URLS_PAGE_TEXT.sortDescription}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 px-6 py-5">
                {URLS_SORT_OPTIONS.map((option) => {
                  const isSelected = pendingSort === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPendingSort(option.value)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border border-border/60 bg-secondary/45 px-4 py-3 text-left transition-all duration-150",
                        isSelected ? "border-primary/40 text-primary" : "text-foreground"
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border border-border",
                          isSelected && "border-primary bg-primary"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border/50 px-6 py-5">
                <Button type="button" className="w-full" onClick={applySort}>
                  {URLS_PAGE_TEXT.applySort}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Card className="stitch-card overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <UrlsTable
            variant="full"
            query={{
              search: debouncedSearch,
              status,
              sortBy,
              sortDir,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
