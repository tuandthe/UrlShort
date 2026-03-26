import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAvatarPreview, useUpdateProfile, useUploadAvatar } from "./useProfile";
import { PROFILE_TOAST_TEXT } from "../constants/settingsUi.constants";
import { UserProfile } from "../types/user.types";

const ALLOWED_AVATAR_CONTENT_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function useProfileForm(profile: UserProfile) {
    const [fullName, setFullName] = useState(profile.fullName || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const isGoogleAccount = profile.provider === "GOOGLE";

    const { data: avatarPreviewUrl, isFetching: isAvatarPreviewLoading } = useAvatarPreview(profile.avatarUrl);
    const updateProfileMutation = useUpdateProfile();
    const updatePasswordMutation = useUpdateProfile();
    const uploadAvatarMutation = useUploadAvatar();

    useEffect(() => {
        setFullName(profile.fullName || "");
    }, [profile.fullName]);

    const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedFullName = fullName.trim();

        if (!normalizedFullName) {
            toast.error(PROFILE_TOAST_TEXT.fullNameRequired);
            return;
        }

        updateProfileMutation.mutate(
            { fullName: normalizedFullName },
            {
                onSuccess: () => {
                    toast.success(PROFILE_TOAST_TEXT.profileUpdateSuccess);
                },
                onError: (error: unknown) => {
                    const err = error as { response?: { data?: { message?: string } } };
                    toast.error(err.response?.data?.message || PROFILE_TOAST_TEXT.profileUpdateFailed);
                },
            }
        );
    };

    const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isGoogleAccount) {
            toast.error(PROFILE_TOAST_TEXT.googlePasswordUnsupported);
            return;
        }

        if (!newPassword || !confirmPassword) {
            toast.error(PROFILE_TOAST_TEXT.fillBothPasswordFields);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(PROFILE_TOAST_TEXT.passwordMismatch);
            return;
        }

        updatePasswordMutation.mutate(
            { newPassword },
            {
                onSuccess: () => {
                    toast.success(PROFILE_TOAST_TEXT.passwordUpdateSuccess);
                    setNewPassword("");
                    setConfirmPassword("");
                },
                onError: (error: unknown) => {
                    const err = error as { response?: { data?: { message?: string } } };
                    toast.error(err.response?.data?.message || PROFILE_TOAST_TEXT.passwordUpdateFailed);
                },
            }
        );
    };

    const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        event.target.value = "";

        if (!selectedFile || uploadAvatarMutation.isPending) {
            return;
        }

        if (!ALLOWED_AVATAR_CONTENT_TYPES.has(selectedFile.type)) {
            toast.error(PROFILE_TOAST_TEXT.unsupportedFileType);
            return;
        }

        if (selectedFile.size > MAX_AVATAR_FILE_SIZE_BYTES) {
            toast.error(PROFILE_TOAST_TEXT.avatarMaxSize);
            return;
        }

        uploadAvatarMutation.mutate(selectedFile, {
            onSuccess: () => {
                toast.success(PROFILE_TOAST_TEXT.avatarUpdateSuccess);
            },
            onError: (error: unknown) => {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error(err.response?.data?.message || PROFILE_TOAST_TEXT.avatarUpdateFailed);
            },
        });
    };

    return {
        fullName,
        setFullName,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        handleProfileSubmit,
        handlePasswordSubmit,
        handleAvatarFileChange,
        avatarPreviewUrl: avatarPreviewUrl ?? null,
        isAvatarPreviewLoading,
        isAvatarPending: uploadAvatarMutation.isPending,
        isProfilePending: updateProfileMutation.isPending,
        isPasswordPending: updatePasswordMutation.isPending,
    };
}
