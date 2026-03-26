export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  URLS: "/urls",
  URL_MEDIA: (id: number | string) => `/urls/${id}/media`,
  ANALYTICS: "/analytics",
  ANALYTICS_DETAIL: (id: number | string) => `/analytics/${id}`,
  SETTINGS: "/settings",
  ADMIN: "/admin",
  OAUTH_CALLBACK: "/oauth2/callback",
} as const;
