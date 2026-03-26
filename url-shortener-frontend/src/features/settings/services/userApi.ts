import apiClient from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import { fileApi } from "@/shared/services/fileApi";
import { UserProfile, UpdateProfileInput } from "../types/user.types";

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<ApiEnvelope<UserProfile>>(API_ENDPOINTS.USERS.ME);
    return data.data;
  },

  updateProfile: async (input: UpdateProfileInput): Promise<UserProfile> => {
    const { data } = await apiClient.put<ApiEnvelope<UserProfile>>(API_ENDPOINTS.USERS.ME, input);
    return data.data;
  },

  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.put<ApiEnvelope<UserProfile>>(API_ENDPOINTS.USERS.AVATAR, formData);
    return data.data;
  },

  resolveAvatarPreview: async (avatarUrl?: string | null): Promise<string | null> => {
    return fileApi.resolveFileUrl(avatarUrl);
  },
};
