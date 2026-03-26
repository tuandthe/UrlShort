import { useMemo } from "react";
import { format, parseISO } from "date-fns";

import { AnalyticsData } from "../services/analyticsApi";
import { ANALYTICS_CONSTANTS } from "@/shared/constants/analytics";
import { DATE_FORMATS } from "@/shared/constants/formats";

export const useFormattedAnalytics = (data?: AnalyticsData) => {
    const formattedDateData = useMemo(() => {
        if (!data?.clicksByDate) {
            return [];
        }

        return data.clicksByDate
            .map((item) => ({
                date: item.date,
                displayDate: format(parseISO(item.date), DATE_FORMATS.CHART_DAY),
                clicks: Number(item.clicks),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    const formattedReferrerData = useMemo(() => {
        if (!data?.topReferers) {
            return [];
        }

        return data.topReferers
            .map((item) => ({
                name:
                    item.referer === ANALYTICS_CONSTANTS.UNKNOWN_REFERRER_LABEL || !item.referer
                        ? ANALYTICS_CONSTANTS.DIRECT_REFERRER_LABEL
                        : item.referer,
                clicks: item.count,
            }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, ANALYTICS_CONSTANTS.TOP_REFERRERS_LIMIT);
    }, [data]);

    return {
        formattedDateData,
        formattedReferrerData,
    };
};