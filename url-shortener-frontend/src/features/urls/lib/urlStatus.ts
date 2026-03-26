import { UrlDetail, UrlStatus } from "../types/url.types";

export const getFallbackStatus = (url: UrlDetail): UrlStatus => {
    if (!url.isActive) {
        return "INACTIVE";
    }

    const isExpired = url.expiresAt ? new Date(url.expiresAt).getTime() < Date.now() : false;
    return isExpired ? "EXPIRED" : "ACTIVE";
};

export const getUrlStatus = (url: UrlDetail): UrlStatus => {
    return url.status || getFallbackStatus(url);
};

export const isUrlActionable = (url: UrlDetail): boolean => {
    return getUrlStatus(url) === "ACTIVE";
};
