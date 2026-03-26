import axios from "axios";
import { getSession, signIn, signOut } from "next-auth/react";

import { API_ENDPOINTS } from "@/shared/constants/api";
import { AUTH_PROVIDER_IDS } from "@/shared/constants/auth";
import { getLoginCallbackUrl } from "@/shared/lib/auth-redirect";

interface RefreshTokenApiResponse {
  status: number;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

type RetriableRequest = {
  _retry?: boolean;
  url?: string;
  headers?: Record<string, string | undefined>;
};

const apiClient = axios.create({
  baseURL: "/backend/api",
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
    const headers = config.headers as
      | { set?: (name: string, value?: string) => void }
      | Record<string, unknown>;

    if (typeof headers.set === "function") {
      headers.set("Content-Type", undefined);
    } else {
      delete (headers as Record<string, unknown>)["Content-Type"];
      delete (headers as Record<string, unknown>)["content-type"];
    }
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;
let isSigningOut = false;

const isRefreshEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return url.includes(API_ENDPOINTS.AUTH.REFRESH);
};


const refreshAccessToken = async (): Promise<string> => {
  const session = await getSession();
  const refreshToken = session?.refreshToken;

  if (!refreshToken) {
    throw new Error("Missing refresh token in session.");
  }

  const refreshUrl = apiClient.defaults.baseURL + API_ENDPOINTS.AUTH.REFRESH;
  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Refresh token request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as RefreshTokenApiResponse;
  const nextAccessToken = payload?.data?.accessToken;
  const nextRefreshToken = payload?.data?.refreshToken;

  if (!nextAccessToken || !nextRefreshToken) {
    throw new Error("Refresh token response is missing token data.");
  }

  const updateResult = await signIn(AUTH_PROVIDER_IDS.TOKEN_LOGIN, {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
    redirect: false,
  });

  if (!updateResult || updateResult.error) {
    throw new Error(updateResult?.error || "Failed to update NextAuth session with refreshed tokens.");
  }

  return nextAccessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = (error.config || {}) as typeof error.config & RetriableRequest;
    const isUnauthorized = error.response?.status === 401;
    const hasAuthHeader = Boolean(
      originalRequest?.headers?.Authorization || originalRequest?.headers?.authorization
    );

    if (
      isUnauthorized &&
      hasAuthHeader &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const freshAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${freshAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        if (!isSigningOut) {
          isSigningOut = true;
          await signOut({ redirect: true, callbackUrl: getLoginCallbackUrl() });
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
