import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlApi } from "../services/urlApi";
import { CreateUrlInput, UpdateUrlInput } from "../schemas/url.schema";
import { UrlQueryOptions } from "../types/url.types";
import { toast } from "sonner";
import { PAGINATION } from "@/shared/constants/app";

export const URL_KEYS = {
  all: ["urls"] as const,
  lists: () => [...URL_KEYS.all, "list"] as const,
  list: (page: number, size: number, options: UrlQueryOptions) =>
    [...URL_KEYS.lists(), { page, size, ...options }] as const,
  details: () => [...URL_KEYS.all, "detail"] as const,
  detail: (id: number) => [...URL_KEYS.details(), id] as const,
};

export const useUrls = (
  page: number = PAGINATION.DEFAULT_PAGE,
  size: number = PAGINATION.DEFAULT_SIZE,
  options: UrlQueryOptions = {}
) => {
  const queryOptions: UrlQueryOptions = {
    search: options.search?.trim() || "",
    status: options.status || "ALL",
    sortBy: options.sortBy || "createdAt",
    sortDir: options.sortDir || "desc",
  };

  return useQuery({
    queryKey: URL_KEYS.list(page, size, queryOptions),
    queryFn: () => urlApi.getUrls(page, size, queryOptions),
  });
};

export const useUrl = (id: number) => {
  return useQuery({
    queryKey: URL_KEYS.detail(id),
    queryFn: () => urlApi.getUrl(id),
    enabled: !!id,
  });
};

export const useCreateUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUrlInput) => urlApi.createUrl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: URL_KEYS.lists() });
      toast.success("Tạo URL rút gọn thành công");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Tạo URL rút gọn thất bại");
    },
  });
};

export const useDeleteUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => urlApi.deleteUrl(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: URL_KEYS.lists() });
      toast.success("Xóa URL thành công");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Xóa URL thất bại");
    },
  });
};

export const useUpdateUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUrlInput }) => urlApi.updateUrl(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: URL_KEYS.lists() });
      toast.success("Cập nhật URL thành công");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Cập nhật URL thất bại");
    },
  });
};

export const useUpdateUrlPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: number; password?: string | null }) =>
      urlApi.updateUrlPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: URL_KEYS.lists() });
      toast.success("Cập nhật mật khẩu URL thành công");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Cập nhật mật khẩu URL thất bại");
    },
  });
};

export const useUpdateUrlExpiration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, expiresAt }: { id: number; expiresAt?: Date | null }) =>
      urlApi.updateUrlExpiration(id, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: URL_KEYS.lists() });
      toast.success("Cập nhật thời hạn URL thành công");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Cập nhật thời hạn URL thất bại");
    },
  });
};
