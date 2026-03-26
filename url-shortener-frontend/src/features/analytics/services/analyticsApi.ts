export interface ClickDateData {
  date: string;
  clicks: number;
}

export interface RefererData {
  referer: string;
  count: number;
}

export interface AnalyticsData {
  totalClicks: number;
  clicksByDate: ClickDateData[];
  topReferers: RefererData[];
}

import apiClient from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";

export const analyticsApi = {
  getUrlAnalytics: async (id: number) => {
    const res = await apiClient.get<{ data: AnalyticsData }>(API_ENDPOINTS.URLS.ANALYTICS(id));
    return res.data.data;
  },

  getUrlAnalyticsClicks: async (id: number) => {
    const res = await apiClient.get<{ data: ClickDateData[] }>(API_ENDPOINTS.URLS.ANALYTICS_CLICKS(id));
    return res.data.data;
  },
};
