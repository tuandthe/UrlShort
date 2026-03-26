export interface AdminStats {
    totalUsers: number;
    totalUrls: number;
    totalClicks: number;
    [key: string]: number | string | boolean | null | undefined;
}

export type AdminUserStatus = "ACTIVE" | "INACTIVE";

export type AdminUserStatusFilter = "ALL" | AdminUserStatus;

export interface AdminUserQueryOptions {
    search?: string;
    status?: AdminUserStatusFilter;
}

export interface ApiEnvelope<T> {
    status: number;
    message: string;
    data: T;
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
}

export type AdminTrendGroupBy = "week" | "month";

export interface AdminClickTrendPoint {
    periodStart: string;
    period: string;
    clicks: number;
}

export interface AdminUser {
    id: number;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
    provider: string;
    avatarUrl?: string | null;
    createdAt: string;
}

export interface AdminUrl {
    id: number;
    shortCode: string;
    originalUrl: string;
    active: boolean;
    clickCount: number;
    createdAt: string;
    ownerEmail: string;
}