import { useEffect, useMemo, useState } from "react";

import { useAdminDashboardPage } from "./useAdminDashboardPage";
import { fileApi } from "@/shared/services/fileApi";
import { ADMIN_DASHBOARD_TEXT, ADMIN_STATUS_BADGE } from "../constants/adminDashboard.constants";

export function useAdminDashboardViewModel() {
    const dashboardState = useAdminDashboardPage();
    const { users } = dashboardState;

    const [avatarByUserId, setAvatarByUserId] = useState<Record<number, string | null>>({});

    useEffect(() => {
        let isMounted = true;

        const resolveAvatarUrls = async () => {
            if (users.length === 0) {
                if (isMounted) {
                    setAvatarByUserId((prevState) => {
                        if (Object.keys(prevState).length === 0) {
                            return prevState;
                        }

                        return {};
                    });
                }
                return;
            }

            const entries = await Promise.all(
                users.map(async (user) => [user.id, await fileApi.resolveFileUrl(user.avatarUrl)] as const)
            );

            if (!isMounted) {
                return;
            }

            const nextState = Object.fromEntries(entries);

            setAvatarByUserId((prevState) => {
                const prevKeys = Object.keys(prevState);
                const nextKeys = Object.keys(nextState);

                if (prevKeys.length !== nextKeys.length) {
                    return nextState;
                }

                const hasChanged = nextKeys.some((key) => prevState[Number(key)] !== nextState[Number(key)]);
                return hasChanged ? nextState : prevState;
            });
        };

        void resolveAvatarUrls();

        return () => {
            isMounted = false;
        };
    }, [users]);

    const usersView = useMemo(
        () =>
            users.map((user) => ({
                ...user,
                displayName: user.fullName || ADMIN_DASHBOARD_TEXT.fallbackValue,
                avatarUrlResolved: avatarByUserId[user.id],
                statusLabel: user.active ? ADMIN_STATUS_BADGE.active.label : ADMIN_STATUS_BADGE.inactive.label,
                statusClassName: user.active ? ADMIN_STATUS_BADGE.active.className : ADMIN_STATUS_BADGE.inactive.className,
            })),
        [avatarByUserId, users]
    );

    return {
        ...dashboardState,
        usersView,
    };
}
