export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    OAUTH2_GOOGLE: "/auth/oauth2/google",
  },
  URLS: {
    BASE: "/urls",
    DETAIL: (id: number | string) => `/urls/${id}`,
    OG_IMAGE: (id: number | string) => `/urls/${id}/og-image`,
    PASSWORD: (id: number | string) => `/urls/${id}/password`,
    EXPIRATION: (id: number | string) => `/urls/${id}/expiration`,
    ANALYTICS: (id: number | string) => `/urls/${id}/analytics`,
    ANALYTICS_CLICKS: (id: number | string) => `/urls/${id}/analytics/clicks`,
  },
  ANALYTICS: { URL_LEGACY: (id: number | string) => `/analytics/urls/${id}` },
  USERS: {
    ME: "/users/me",
    AVATAR: "/users/me/avatar",
  },
  FILES: {
    PRESIGNED_DOWNLOAD: "/files/presigned/download",
  },
  ADMIN: {
    STATS: "/admin/stats",
    DASHBOARD: "/admin/dashboard",
    CLICKS_TREND: "/admin/analytics/clicks",
    URLS: "/admin/urls",
    USERS: "/admin/users",
    USER_DELETE: (id: number | string) => `/admin/users/${id}`,
    USER_ACTIVATE: (id: number | string) => `/admin/users/${id}/activate`,
  },
} as const;
