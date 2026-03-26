import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, MousePointerClick, Users } from "lucide-react";
import { toast } from "sonner";

import { adminApi } from "../services/adminApi";
import { ADMIN_STAT_CARD_TEXT } from "../constants/adminDashboard.constants";
import { AdminTrendGroupBy, AdminUserStatusFilter } from "../types/admin.types";
import { ADMIN_PAGINATION } from "@/shared/constants/app";

const ADMIN_KEYS = {
    dashboard: ["admin", "dashboard"] as const,
    clicksTrend: (groupBy: AdminTrendGroupBy) => ["admin", "clicks-trend", groupBy] as const,
    users: (page: number, size: number, search: string, status: AdminUserStatusFilter) =>
        ["admin", "users", page, size, search, status] as const,
    usersBase: ["admin", "users"] as const,
    urls: ["admin", "urls"] as const,
};

export function useAdminDashboardPage() {
    const queryClient = useQueryClient();
    const [usersPage, setUsersPage] = useState<number>(ADMIN_PAGINATION.DEFAULT_PAGE);
    const usersSize = ADMIN_PAGINATION.DEFAULT_SIZE;
    const [userSearch, setUserSearch] = useState("");
    const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
    const [userStatus, setUserStatus] = useState<AdminUserStatusFilter>("ALL");
    const [trendGroupBy, setTrendGroupBy] = useState<AdminTrendGroupBy>("week");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedUserSearch(userSearch);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [userSearch]);

    const { data: dashboard, isLoading, isError } = useQuery({
        queryKey: ADMIN_KEYS.dashboard,
        queryFn: adminApi.getDashboard,
    });

    const {
        data: trendResponse,
        isLoading: isTrendLoading,
        isError: isTrendError,
    } = useQuery({
        queryKey: ADMIN_KEYS.clicksTrend(trendGroupBy),
        queryFn: () => adminApi.getClicksTrend(trendGroupBy),
    });

    const {
        data: usersResponse,
        isLoading: isUsersLoading,
        isError: isUsersError,
        refetch: refetchUsers,
    } = useQuery({
        queryKey: ADMIN_KEYS.users(usersPage, usersSize, debouncedUserSearch, userStatus),
        queryFn: () =>
            adminApi.getUsers(usersPage, usersSize, {
                search: debouncedUserSearch,
                status: userStatus,
            }),
    });

    const {
        data: urlsResponse,
        isLoading: isUrlsLoading,
        isError: isUrlsError,
    } = useQuery({
        queryKey: ADMIN_KEYS.urls,
        queryFn: () => adminApi.getUrls(ADMIN_PAGINATION.DEFAULT_PAGE, ADMIN_PAGINATION.DEFAULT_SIZE),
    });

    const { mutate: softDeleteUser, isPending: isSoftDeletingUser } = useMutation({
        mutationFn: adminApi.softDeleteUser,
        onSuccess: (response) => {
            toast.success(response.message);
            void queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.usersBase });
            void queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Không thể xóa người dùng");
        },
    });

    const { mutate: activateUser, isPending: isActivatingUser } = useMutation({
        mutationFn: adminApi.activateUser,
        onSuccess: (response) => {
            toast.success(response.message);
            void queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.usersBase });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Không thể kích hoạt người dùng");
        },
    });

    const statCards = useMemo(
        () => [
            {
                title: ADMIN_STAT_CARD_TEXT.totalUsers.title,
                value: Number(dashboard?.totalUsers || 0),
                description: ADMIN_STAT_CARD_TEXT.totalUsers.description,
                icon: Users,
                gradient: "from-primary/10 via-primary/5 to-transparent",
            },
            {
                title: ADMIN_STAT_CARD_TEXT.totalUrls.title,
                value: Number(dashboard?.totalUrls || 0),
                description: ADMIN_STAT_CARD_TEXT.totalUrls.description,
                icon: Link2,
                gradient: "from-chart-1/15 via-chart-1/5 to-transparent",
            },
            {
                title: ADMIN_STAT_CARD_TEXT.totalClicks.title,
                value: Number(dashboard?.totalClicks || 0),
                description: ADMIN_STAT_CARD_TEXT.totalClicks.description,
                icon: MousePointerClick,
                gradient: "from-chart-2/15 via-chart-2/5 to-transparent",
            },
        ],
        [dashboard]
    );

    const users = useMemo(() => usersResponse?.data ?? [], [usersResponse?.data]);
    const urls = useMemo(() => urlsResponse?.data ?? [], [urlsResponse?.data]);
    const trendData = useMemo(() => trendResponse?.data ?? [], [trendResponse?.data]);

    useEffect(() => {
        setUsersPage(ADMIN_PAGINATION.DEFAULT_PAGE);
    }, [debouncedUserSearch, userStatus]);

    const totalUserPages = usersResponse?.totalPages ?? 0;
    const canPrevUsersPage = usersPage > 0;
    const canNextUsersPage = usersPage + 1 < totalUserPages;

    const goToPrevUsersPage = useCallback(() => {
        setUsersPage((currentPage) => (currentPage > 0 ? currentPage - 1 : currentPage));
    }, []);

    const goToNextUsersPage = useCallback(() => {
        setUsersPage((currentPage) => {
            if (currentPage + 1 >= totalUserPages) {
                return currentPage;
            }

            return currentPage + 1;
        });
    }, [totalUserPages]);

    return {
        dashboard,
        trendData,
        isLoading,
        isError,
        isTrendLoading,
        isTrendError,
        usersResponse,
        urlsResponse,
        users,
        urls,
        isUsersLoading,
        isUsersError,
        isUrlsLoading,
        isUrlsError,
        statCards,
        usersPage,
        usersSize,
        userSearch,
        userStatus,
        trendGroupBy,
        totalUserPages,
        canPrevUsersPage,
        canNextUsersPage,
        goToPrevUsersPage,
        goToNextUsersPage,
        setUserSearch,
        setUserStatus,
        setTrendGroupBy,
        softDeleteUser,
        activateUser,
        isSoftDeletingUser,
        isActivatingUser,
        refetchUsers,
    };
}
