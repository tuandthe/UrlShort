import apiClient from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import { ADMIN_PAGINATION } from "@/shared/constants/app";
import {
    AdminClickTrendPoint,
    AdminStats,
    AdminTrendGroupBy,
    AdminUrl,
    AdminUser,
    AdminUserQueryOptions,
    ApiEnvelope,
} from "../types/admin.types";

export const adminApi = {
    getDashboard: async (): Promise<AdminStats> => {
        const { data } = await apiClient.get<ApiEnvelope<AdminStats>>(API_ENDPOINTS.ADMIN.DASHBOARD);
        return data.data;
    },

    getStats: async (): Promise<AdminStats> => {
        return adminApi.getDashboard();
    },

    getClicksTrend: async (groupBy: AdminTrendGroupBy = "week"): Promise<ApiEnvelope<AdminClickTrendPoint[]>> => {
        const { data } = await apiClient.get<ApiEnvelope<AdminClickTrendPoint[]>>(
            `${API_ENDPOINTS.ADMIN.CLICKS_TREND}?groupBy=${groupBy}`
        );
        return data;
    },

    getUsers: async (
        page: number = ADMIN_PAGINATION.DEFAULT_PAGE,
        size: number = ADMIN_PAGINATION.DEFAULT_SIZE,
        options: AdminUserQueryOptions = {}
    ): Promise<ApiEnvelope<AdminUser[]>> => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(size));

        const search = options.search?.trim();
        if (search) {
            params.set("search", search);
        }

        if (options.status && options.status !== "ALL") {
            params.set("status", options.status);
        }

        const { data } = await apiClient.get<ApiEnvelope<AdminUser[]>>(
            `${API_ENDPOINTS.ADMIN.USERS}?${params.toString()}`
        );
        return data;
    },

    getUrls: async (
        page: number = ADMIN_PAGINATION.DEFAULT_PAGE,
        size: number = ADMIN_PAGINATION.DEFAULT_SIZE
    ): Promise<ApiEnvelope<AdminUrl[]>> => {
        const { data } = await apiClient.get<ApiEnvelope<AdminUrl[]>>(
            `${API_ENDPOINTS.ADMIN.URLS}?page=${page}&size=${size}`
        );
        return data;
    },

    softDeleteUser: async (userId: number): Promise<ApiEnvelope<null>> => {
        const { data } = await apiClient.delete<ApiEnvelope<null>>(API_ENDPOINTS.ADMIN.USER_DELETE(userId));
        return data;
    },

    activateUser: async (userId: number): Promise<ApiEnvelope<null>> => {
        const { data } = await apiClient.patch<ApiEnvelope<null>>(API_ENDPOINTS.ADMIN.USER_ACTIVATE(userId));
        return data;
    },
};