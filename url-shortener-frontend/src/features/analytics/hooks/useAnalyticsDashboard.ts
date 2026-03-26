import { useMemo } from "react";

import { useUrlAnalytics } from "./useAnalytics";
import { useFormattedAnalytics } from "./useFormattedAnalytics";
import { ANALYTICS_CONSTANTS } from "@/shared/constants/analytics";

export function useAnalyticsDashboard(id: number) {
    const { data, isLoading, isError } = useUrlAnalytics(id);
    const { formattedDateData, formattedReferrerData } = useFormattedAnalytics(data);

    const averageClicksPerDay = useMemo(() => {
        if (formattedDateData.length === 0) {
            return `0.${"0".repeat(ANALYTICS_CONSTANTS.AVERAGE_PRECISION)}`;
        }

        return (Number(data?.totalClicks || 0) / formattedDateData.length).toFixed(
            ANALYTICS_CONSTANTS.AVERAGE_PRECISION
        );
    }, [data?.totalClicks, formattedDateData.length]);

    const topReferer = formattedReferrerData[0]?.name || ANALYTICS_CONSTANTS.DIRECT_REFERRER_LABEL;

    return {
        data,
        isLoading,
        isError,
        formattedDateData,
        formattedReferrerData,
        averageClicksPerDay,
        topReferer,
    };
}
