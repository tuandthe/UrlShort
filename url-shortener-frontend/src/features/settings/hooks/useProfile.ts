import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../services/userApi";
import { UpdateProfileInput } from "../types/user.types";

const PROFILE_AVATAR_PREVIEW_ROOT = ["profile", "avatar-preview"] as const;

export const PROFILE_KEYS = {
  all: ["profile"] as const,
  avatarPreviewRoot: PROFILE_AVATAR_PREVIEW_ROOT,
  avatarPreview: (avatarRef: string) => [...PROFILE_AVATAR_PREVIEW_ROOT, avatarRef] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_KEYS.all,
    queryFn: userApi.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => userApi.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all });
    },
  });
};

export const
  useUploadAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (file: File) => userApi.uploadAvatar(file),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all });
        queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.avatarPreviewRoot });
      },
    });
  };

export const useAvatarPreview = (avatarRef?: string | null) => {
  const normalizedAvatarRef = avatarRef?.trim() ?? "";

  return useQuery({
    queryKey: PROFILE_KEYS.avatarPreview(normalizedAvatarRef),
    queryFn: () => userApi.resolveAvatarPreview(normalizedAvatarRef),
    enabled: Boolean(normalizedAvatarRef),
    staleTime: 5 * 60 * 1000,
  });
};
