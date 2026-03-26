export const AUTH_PROVIDER_IDS = {
    CREDENTIALS: "credentials",
    TOKEN_LOGIN: "token-login",
} as const;

export const AUTH_ROLES = {
    USER: "USER",
    ADMIN: "ADMIN",
} as const;

export const AUTH_PROVIDER_TYPES = {
    GOOGLE: "GOOGLE",
    LOCAL: "LOCAL",
} as const;

export const AUTH_CONSTRAINTS = {
    PASSWORD_MIN_LENGTH: 6,
    FULL_NAME_MAX_LENGTH: 100,
} as const;
