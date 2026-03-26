import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../services/analyticsApi";
import { POLLING_INTERVAL } from "@/shared/constants/app";

export const ANALYTICS_KEYS = {
  all: ["analytics"] as const,
  url: (id: number) => [...ANALYTICS_KEYS.all, id] as const,
};

export const useUrlAnalytics = (id: number) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.url(id),
    queryFn: () => analyticsApi.getUrlAnalytics(id),
    enabled: !!id,
    refetchInterval: POLLING_INTERVAL,
  });
};
