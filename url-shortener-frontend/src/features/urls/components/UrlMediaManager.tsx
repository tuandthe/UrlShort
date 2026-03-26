"use client";

import { ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Copy, Download, ImagePlus, Info, Loader2, QrCode } from "lucide-react";

import { useUrlMediaPage } from "@/features/urls/hooks/useUrlMediaPage";
import { URL_MEDIA_TEXT } from "@/features/urls/constants/urlMedia.constants";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ROUTES } from "@/shared/constants/routes";

export function UrlMediaManager({ id }: { id: number }) {
  const {
    url,
    shortUrl,
    isLoading,
    isError,
    ogPreviewUrl,
    qrPreviewUrl,
    isUploadingOgImage,
    isDownloadingQr,
    uploadOgImage,
    copyShortUrl,
    downloadQrPng,
  } = useUrlMediaPage(id);

  if (!Number.isFinite(id) || id <= 0) {
    return <div className="rounded-2xl border border-destructive/30 p-6 text-destructive">ID liên kết không hợp lệ.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải dữ liệu media...
      </div>
    );
  }

  if (isError || !url) {
    return <div className="rounded-2xl border border-destructive/30 p-6 text-destructive">Không thể tải dữ liệu media cho liên kết này.</div>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href={ROUTES.URLS} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {URL_MEDIA_TEXT.backToUrls}
        </Link>

        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{URL_MEDIA_TEXT.pageTitle}</h1>
        <p className="text-muted-foreground">
          {URL_MEDIA_TEXT.pageDescriptionPrefix} <span className="font-mono text-primary">{shortUrl}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/50">
              <div>
                <CardTitle>{URL_MEDIA_TEXT.og.title}</CardTitle>
                <CardDescription>{URL_MEDIA_TEXT.og.hint}</CardDescription>
              </div>

              <label>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    uploadOgImage(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary/90">
                  {isUploadingOgImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {isUploadingOgImage ? URL_MEDIA_TEXT.og.uploading : URL_MEDIA_TEXT.og.upload}
                </span>
              </label>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div
                className="relative overflow-hidden rounded-xl border border-border/40 bg-secondary/35"
                style={{ aspectRatio: "1200 / 630" }}
              >
                {ogPreviewUrl ? (
                  <Image
                    src={ogPreviewUrl}
                    alt="Open Graph preview"
                    fill
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    {URL_MEDIA_TEXT.og.empty}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/85 to-transparent p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Open Graph</p>
                  <p className="truncate text-sm font-semibold text-foreground">{url.shortCode}</p>
                  <p className="truncate text-xs text-muted-foreground">{url.originalUrl}</p>
                </div>
              </div>

              {isUploadingOgImage && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{URL_MEDIA_TEXT.og.uploading}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{URL_MEDIA_TEXT.ledger.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {URL_MEDIA_TEXT.ledger.items.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-xl border border-border/40 bg-secondary/30 p-4">
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{item.meta}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                {URL_MEDIA_TEXT.qr.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-secondary/35 p-5">
                {qrPreviewUrl ? (
                  <Image
                    src={qrPreviewUrl}
                    alt="QR preview"
                    width={280}
                    height={280}
                    unoptimized
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <p className="text-center text-sm text-muted-foreground">{URL_MEDIA_TEXT.qr.empty}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Button onClick={downloadQrPng} disabled={!qrPreviewUrl || isDownloadingQr}>
                  {isDownloadingQr ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {URL_MEDIA_TEXT.qr.download}
                </Button>
                <Button variant="outline" onClick={copyShortUrl} disabled={!shortUrl}>
                  <Copy className="h-4 w-4" />
                  {URL_MEDIA_TEXT.qr.copyUrl}
                </Button>
              </div>

              <div className="space-y-3 rounded-xl border border-border/40 bg-secondary/30 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.14em] text-muted-foreground">ECC level</span>
                  <span className="font-semibold text-foreground">H (30%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.14em] text-muted-foreground">Logo inset</span>
                  <span className="font-semibold text-foreground">12%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.14em] text-muted-foreground">Độ phân giải</span>
                  <span className="font-semibold text-foreground">2048 x 2048</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-primary/20 bg-secondary/20">
            <CardContent className="flex gap-3 p-5">
              <Info className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{URL_MEDIA_TEXT.quickTipTitle}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{URL_MEDIA_TEXT.quickTipDescription}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
