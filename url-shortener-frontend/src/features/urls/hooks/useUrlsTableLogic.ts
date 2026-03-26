"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DATETIME_CONSTANTS, PAGINATION } from "@/shared/constants/app";
import { URLS_LOGIC_TEXT } from "../constants/urlsLogic.constants";
import { UrlQueryOptions } from "../types/url.types";
import { useDeleteUrl, useUpdateUrlExpiration, useUpdateUrlPassword, useUrls } from "./useUrls";

export const useUrlsTableLogic = (options: UrlQueryOptions = {}) => {
    const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
    const size = PAGINATION.DEFAULT_SIZE;

    const search = options.search ?? "";
    const status = options.status ?? "ALL";
    const sortBy = options.sortBy ?? "createdAt";
    const sortDir = options.sortDir ?? "desc";

    useEffect(() => {
        setPage(PAGINATION.DEFAULT_PAGE);
    }, [search, status, sortBy, sortDir]);

    const { data, isLoading, isError } = useUrls(page, size, {
        search,
        status,
        sortBy,
        sortDir,
    });
    const deleteMutation = useDeleteUrl();
    const updatePasswordMutation = useUpdateUrlPassword();
    const updateExpirationMutation = useUpdateUrlExpiration();

    const buildShortUrl = (shortCode: string) => {
        const shortBase =
            process.env.NEXT_PUBLIC_SHORT_URL_BASE ||
            (typeof window !== "undefined" ? window.location.origin : "");
        const normalizedBase = shortBase.replace(/\/$/, "");

        return `${normalizedBase}/${shortCode}`;
    };

    const handleCopy = (shortCode: string) => {
        const shortUrl = buildShortUrl(shortCode);
        navigator.clipboard.writeText(shortUrl);
        toast.success(URLS_LOGIC_TEXT.copiedSuccess, { description: shortUrl });
    };

    const handleDelete = (id: number) => {
        if (confirm(URLS_LOGIC_TEXT.confirmDelete)) {
            deleteMutation.mutate(id);
        }
    };

    const handlePasswordUpdate = (id: number) => {
        const input = prompt(URLS_LOGIC_TEXT.passwordPrompt, "");
        if (input === null) {
            return;
        }

        updatePasswordMutation.mutate({ id, password: input.trim() ? input : null });
    };

    const handleExpirationUpdate = (id: number, currentExpiresAt?: string | null) => {
        const defaultValue = currentExpiresAt
            ? currentExpiresAt.slice(0, DATETIME_CONSTANTS.LOCAL_INPUT_SLICE_END)
            : "";
        const input = prompt(URLS_LOGIC_TEXT.expirationPrompt, defaultValue);

        if (input === null) {
            return;
        }

        const normalized = input.trim();
        if (!normalized) {
            updateExpirationMutation.mutate({ id, expiresAt: null });
            return;
        }

        const parsedDate = new Date(normalized);
        if (Number.isNaN(parsedDate.getTime())) {
            toast.error(URLS_LOGIC_TEXT.invalidDatetime);
            return;
        }

        updateExpirationMutation.mutate({ id, expiresAt: parsedDate });
    };

    const goToPreviousPage = () => {
        setPage((currentPage) => Math.max(PAGINATION.DEFAULT_PAGE, currentPage - 1));
    };

    const goToNextPage = () => {
        setPage((currentPage) => currentPage + 1);
    };

    const totalPages = data?.totalPages || 1;

    return {
        page,
        data,
        isLoading,
        isError,
        totalPages,
        canGoPrevious: page > PAGINATION.DEFAULT_PAGE,
        canGoNext: page < totalPages - 1,
        isUpdatingPassword: updatePasswordMutation.isPending,
        isUpdatingExpiration: updateExpirationMutation.isPending,
        buildShortUrl,
        handleCopy,
        handleDelete,
        handlePasswordUpdate,
        handleExpirationUpdate,
        goToPreviousPage,
        goToNextPage,
    };
};