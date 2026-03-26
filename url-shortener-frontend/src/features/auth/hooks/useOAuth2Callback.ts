import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";

import { AUTH_TOAST_TEXT } from "../constants/authUi.constants";
import { AUTH_PROVIDER_IDS } from "@/shared/constants/auth";
import { ROUTES } from "@/shared/constants/routes";

export function useOAuth2Callback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState(false);
    const hasHandledRef = useRef(false);

    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");

    useEffect(() => {
        if (hasHandledRef.current) {
            return;
        }

        hasHandledRef.current = true;

        let isActive = true;

        const completeOauthSignIn = async () => {
            if (!token || !refresh) {
                if (!isActive) {
                    return;
                }

                setError(true);
                toast.error(AUTH_TOAST_TEXT.oauthMissingTokens);
                router.replace(ROUTES.LOGIN);
                return;
            }

            try {
                const result = await signIn(AUTH_PROVIDER_IDS.TOKEN_LOGIN, {
                    accessToken: token,
                    refreshToken: refresh,
                    redirect: false,
                });

                if (!result || result.error) {
                    throw new Error(result?.error || "NextAuth token-login failed.");
                }

                const session = await getSession();
                if (!session?.accessToken) {
                    throw new Error("Session was not created after OAuth callback.");
                }

                if (!isActive) {
                    return;
                }

                toast.success(AUTH_TOAST_TEXT.oauthSuccess);
                router.replace(ROUTES.DASHBOARD);
                router.refresh();
            } catch (callbackError) {
                console.error("OAuth callback failed:", callbackError);

                if (!isActive) {
                    return;
                }

                setError(true);
                toast.error(AUTH_TOAST_TEXT.oauthFailed);
                router.replace(ROUTES.LOGIN);
            }
        };

        completeOauthSignIn();

        return () => {
            isActive = false;
        };
    }, [token, refresh, router]);

    return {
        error,
    };
}
