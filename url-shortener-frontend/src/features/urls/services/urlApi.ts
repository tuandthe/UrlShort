import apiClient from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import { PAGINATION } from "@/shared/constants/app";
import { CreateUrlInput, UpdateUrlInput } from "../schemas/url.schema";
import { PaginatedUrls, UrlDetail, UrlQueryOptions } from "../types/url.types";

export const urlApi = {
  getUrls: async (
    page: number = PAGINATION.DEFAULT_PAGE,
    size: number = PAGINATION.DEFAULT_SIZE,
    options: UrlQueryOptions = {}
  ) => {
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

    params.set("sortBy", options.sortBy || "createdAt");
    params.set("sortDir", options.sortDir || "desc");

    const res = await apiClient.get<PaginatedUrls>(`${API_ENDPOINTS.URLS.BASE}?${params.toString()}`);
    return res.data;
  },

  getUrl: async (id: number) => {
    const res = await apiClient.get<{ data: UrlDetail }>(API_ENDPOINTS.URLS.DETAIL(id));
    return res.data.data;
  },

  createUrl: async (data: CreateUrlInput) => {
    // Send standard ISO string if date exists
    const payload = {
      ...data,
      expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
    };
    const res = await apiClient.post<{ data: UrlDetail }>(API_ENDPOINTS.URLS.BASE, payload);
    return res.data.data;
  },

  updateUrl: async (id: number, data: UpdateUrlInput) => {
    const payload = {
      originalUrl: data.originalUrl,
      customAlias: data.customAlias ?? "",
      password: data.password ?? "",
      expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
    };

    const res = await apiClient.put<{ data: UrlDetail }>(API_ENDPOINTS.URLS.DETAIL(id), payload);
    return res.data.data;
  },

  updateUrlPassword: async (id: number, password?: string | null) => {
    const res = await apiClient.put<{ data: UrlDetail }>(API_ENDPOINTS.URLS.PASSWORD(id), {
      password: password ?? "",
    });
    return res.data.data;
  },

  updateUrlExpiration: async (id: number, expiresAt?: Date | null) => {
    const res = await apiClient.put<{ data: UrlDetail }>(API_ENDPOINTS.URLS.EXPIRATION(id), {
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    });
    return res.data.data;
  },

  deleteUrl: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.URLS.DETAIL(id));
    return id;
  },

  uploadOgImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<{ data: UrlDetail }>(API_ENDPOINTS.URLS.OG_IMAGE(id), formData);
    return res.data.data;
  },
};
