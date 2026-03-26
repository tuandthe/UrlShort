import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Activity, Link2, MousePointerClick } from "lucide-react";

import { useUrls } from "@/features/urls/hooks/useUrls";
import { DASHBOARD_GREETINGS, DASHBOARD_STAT_TEXT } from "@/features/dashboard/constants/dashboardPage.constants";
import { DASHBOARD_CONSTANTS } from "@/shared/constants/app";
import { useAvatarPreview } from "@/features/settings/hooks/useProfile";

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return DASHBOARD_GREETINGS.morning;
    }

    if (hour < 18) {
        return DASHBOARD_GREETINGS.afternoon;
    }

    return DASHBOARD_GREETINGS.evening;
}

export function useDashboardPage() {
    const { data: session } = useSession();
    const { data, isLoading } = useUrls(0, DASHBOARD_CONSTANTS.STATS_FETCH_SIZE);
    const { data: avatarPreviewUrl, isFetching: isAvatarPreviewLoading } = useAvatarPreview(session?.user.avatarUrl);
    const stats = useMemo(() => {
        const urls = data?.data ?? [];
        const totalUrls = data?.totalItems ?? urls.length;
        const totalClicks = urls.reduce((sum, url) => sum + Number(url.clickCount || 0), 0);
        const activeUrls = urls.filter((url) => {
            const expired = url.expiresAt ? new Date(url.expiresAt).getTime() < Date.now() : false;
            return url.isActive && !expired;
        }).length;

        return { totalUrls, totalClicks, activeUrls };
    }, [data]);

    const userName =
        session?.user?.fullName?.trim() || session?.user?.email?.split("@")[0] || DASHBOARD_GREETINGS.fallbackUser;

    const statCards = useMemo(
        () => [
            {
                title: DASHBOARD_STAT_TEXT.totalUrls.title,
                value: stats.totalUrls.toLocaleString(),
                description: DASHBOARD_STAT_TEXT.totalUrls.description,
                icon: Link2,
                className: "from-primary/10 via-primary/5 to-transparent",
            },
            {
                title: DASHBOARD_STAT_TEXT.totalClicks.title,
                value: stats.totalClicks.toLocaleString(),
                description: DASHBOARD_STAT_TEXT.totalClicks.description,
                icon: MousePointerClick,
                className: "from-chart-1/15 via-chart-1/5 to-transparent",
            },
            {
                title: DASHBOARD_STAT_TEXT.activeUrls.title,
                value: stats.activeUrls.toLocaleString(),
                description: DASHBOARD_STAT_TEXT.activeUrls.description,
                icon: Activity,
                className: "from-chart-2/15 via-chart-2/5 to-transparent",
            },
        ],
        [stats]
    );

    return {
        greeting: getGreeting(),
        userName,
        isLoading,
        statCards,
        avatarPreviewUrl,
        isAvatarPreviewLoading,
    };
}
