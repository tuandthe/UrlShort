import { useProfile } from "./useProfile";

export function useSettingsPage() {
    const { data: profile, isLoading, isError } = useProfile();

    return {
        profile,
        isLoading,
        isError,
    };
}
