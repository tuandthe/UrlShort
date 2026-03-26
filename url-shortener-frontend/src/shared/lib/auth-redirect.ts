import { ROUTES } from "@/shared/constants/routes";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getAuthBaseUrl = () => {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    "";

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

export const getLoginCallbackUrl = () => {
  const baseUrl = getAuthBaseUrl();
  return baseUrl ? `${baseUrl}${ROUTES.LOGIN}` : ROUTES.LOGIN;
};
