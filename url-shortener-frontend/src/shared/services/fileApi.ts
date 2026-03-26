import apiClient from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";

interface ApiEnvelope<T> {
    status: number;
    message: string;
    data: T;
}

const HTTP_URL_REGEX = /^https?:\/\//i;

export const fileApi = {
    getPresignedDownloadUrl: async (fileKey: string, expiryMinutes: number = 60): Promise<string> => {
        const { data } = await apiClient.get<ApiEnvelope<string>>(API_ENDPOINTS.FILES.PRESIGNED_DOWNLOAD, {
            params: {
                fileKey,
                expiry: expiryMinutes,
            },
        });

        return data.data;
    },

    resolveFileUrl: async (
        fileKeyOrUrl?: string | null
    ): Promise<string | null> => {
        const normalized = fileKeyOrUrl?.trim();
        if (!normalized) {
            return null;
        }

        if (HTTP_URL_REGEX.test(normalized)) {
            return normalized;
        }

        return await fileApi.getPresignedDownloadUrl(normalized);
    },
};
