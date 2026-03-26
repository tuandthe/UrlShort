export const APP_NAME = "UrlShort";
export const PAGINATION = { DEFAULT_PAGE: 0, DEFAULT_SIZE: 10 } as const;
export const ADMIN_PAGINATION = { DEFAULT_PAGE: 0, DEFAULT_SIZE: 10 } as const;
export const POLLING_INTERVAL = 30000;
export const DASHBOARD_CONSTANTS = {
    STATS_FETCH_SIZE: 100,
} as const;
export const COUNT_UP_ANIMATION = {
    STEPS: 24,
    INTERVAL_MS: 25,
} as const;
export const DATETIME_CONSTANTS = {
    LOCAL_INPUT_SLICE_END: 16,
    MILLISECONDS_PER_MINUTE: 60_000,
} as const;
