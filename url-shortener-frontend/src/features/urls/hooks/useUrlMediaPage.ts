"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useUrl, URL_KEYS } from "@/features/urls/hooks/useUrls";
import { urlApi } from "@/features/urls/services/urlApi";
import { URL_MEDIA_TEXT } from "@/features/urls/constants/urlMedia.constants";
import { UrlDetail } from "@/features/urls/types/url.types";
import { fileApi } from "@/shared/services/fileApi";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function useUrlMediaPage(id: number) {
  const queryClient = useQueryClient();
  const { data: url, isLoading, isError, refetch } = useUrl(id);
  const [ogPreviewUrl, setOgPreviewUrl] = useState<string | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const shortUrl = useMemo(() => {
    if (!url) {
      return "";
    }

    const shortBase =
      process.env.NEXT_PUBLIC_SHORT_URL_BASE ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const normalizedBase = shortBase.replace(/\/$/, "");
    return `${normalizedBase}/${url.shortCode}`;
  }, [url]);

  useEffect(() => {
    let active = true;

    const resolveAssets = async () => {
      if (!url) {
        if (active) {
          setOgPreviewUrl(null);
          setQrPreviewUrl(null);
        }
        return;
      }

      const [ogResolved, qrResolved] = await Promise.all([
        fileApi.resolveFileUrl(url.ogImageUrl),
        fileApi.resolveFileUrl(url.qrCodeUrl),
      ]);

      if (active) {
        setOgPreviewUrl(ogResolved);
        setQrPreviewUrl(qrResolved);
      }
    };

    resolveAssets().catch(() => {
      if (active) {
        setOgPreviewUrl(null);
        setQrPreviewUrl(null);
      }
    });

    return () => {
      active = false;
    };
  }, [url]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => urlApi.uploadOgImage(id, file),
    onSuccess: async (updated: UrlDetail) => {
      queryClient.setQueryData(URL_KEYS.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: URL_KEYS.lists() });

      const resolvedOg = await fileApi.resolveFileUrl(updated.ogImageUrl);
      setOgPreviewUrl(resolvedOg);
      toast.success(URL_MEDIA_TEXT.success.uploadDone);
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || URL_MEDIA_TEXT.errors.uploadFailed);
    },
  });

  const uploadOgImage = useCallback(
    (file?: File) => {
      if (!file) {
        return;
      }

      if (!IMAGE_TYPES.has(file.type)) {
        toast.error(URL_MEDIA_TEXT.errors.invalidImageType);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(URL_MEDIA_TEXT.errors.fileTooLarge);
        return;
      }

      uploadMutation.mutate(file);
    },
    [uploadMutation]
  );

  const copyShortUrl = useCallback(async () => {
    if (!shortUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success(URL_MEDIA_TEXT.success.copyDone, { description: shortUrl });
    } catch {
      toast.error(URL_MEDIA_TEXT.errors.copyFailed);
    }
  }, [shortUrl]);

  const downloadQrPng = useCallback(async () => {
    if (!qrPreviewUrl || !url) {
      return;
    }

    setIsDownloadingQr(true);

    try {
      const response = await fetch(qrPreviewUrl);
      if (!response.ok) {
        throw new Error("qr-download-failed");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${url.shortCode}-qr.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error(URL_MEDIA_TEXT.errors.qrDownloadFailed);
    } finally {
      setIsDownloadingQr(false);
    }
  }, [qrPreviewUrl, url]);

  return {
    url,
    shortUrl,
    isLoading,
    isError,
    ogPreviewUrl,
    qrPreviewUrl,
    isUploadingOgImage: uploadMutation.isPending,
    isDownloadingQr,
    uploadOgImage,
    copyShortUrl,
    downloadQrPng,
  };
}
