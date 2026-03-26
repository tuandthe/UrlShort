import { useMemo, useState } from "react";

import { useUrls } from "@/features/urls/hooks/useUrls";
import { UrlDetail } from "@/features/urls/types/url.types";
import { ANALYTICS_CONSTANTS } from "@/shared/constants/analytics";
import { PAGINATION } from "@/shared/constants/app";

export function useAnalyticsRootPage() {
    const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
    const { data, isLoading, isError } = useUrls(page, PAGINATION.DEFAULT_SIZE, { status: "ACTIVE" });

    const urls = useMemo(
        () =>
            (data?.data ?? []).filter((url) => {
                const fallbackStatus = !url.isActive
                    ? "INACTIVE"
                    : url.expiresAt && new Date(url.expiresAt).getTime() < Date.now()
                        ? "EXPIRED"
                        : "ACTIVE";

                const status = url.status ?? fallbackStatus;
                return status === "ACTIVE";
            }),
        [data?.data]
    );
    const totalPages = data?.totalPages || 1;

    const totalClicks = useMemo(
        () => urls.reduce((sum, url) => sum + Number(url.clickCount || 0), 0),
        [urls]
    );

    const maxClicks = useMemo(
        () =>
            Math.max(
                ...urls.map((url) => Number(url.clickCount || 0)),
                ANALYTICS_CONSTANTS.MIN_CLICK_DIVISOR
            ),
        [urls]
    );

    const canGoPrevious = page > PAGINATION.DEFAULT_PAGE;
    const canGoNext = page < totalPages - 1;

    const getProgressWidth = (url: UrlDetail) => {
        const clickCount = Number(url.clickCount || 0);

        return Math.max(
            (clickCount / maxClicks) * 100,
            clickCount > 0 ? ANALYTICS_CONSTANTS.MIN_VISIBLE_PROGRESS_PERCENT : 0
        );
    };

    const goToPreviousPage = () => {
        setPage((currentPage) => Math.max(PAGINATION.DEFAULT_PAGE, currentPage - 1));
    };

    const goToNextPage = () => {
        setPage((currentPage) => currentPage + 1);
    };

    return {
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
    };
}
