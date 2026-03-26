import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LoginInput, loginSchema } from "../schemas/auth.schema";
import { loginUser } from "../services/authApi";
import { useGoogleLogin } from "./useGoogleLogin";
import { AUTH_TOAST_TEXT } from "../constants/authUi.constants";
import { AUTH_PROVIDER_IDS } from "@/shared/constants/auth";
import { ROUTES } from "@/shared/constants/routes";

export function useLoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const loginWithGoogle = useGoogleLogin();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);

        try {
            const loginResponse = await loginUser(data);
            const accessToken = loginResponse?.data?.accessToken;
            const refreshToken = loginResponse?.data?.refreshToken;

            if (!accessToken || !refreshToken) {
                toast.error(AUTH_TOAST_TEXT.missingTokenResponse);
                return;
            }

            const result = await signIn(AUTH_PROVIDER_IDS.TOKEN_LOGIN, {
                redirect: false,
                accessToken,
                refreshToken,
            });

            if (!result || result.error) {
                toast.error(AUTH_TOAST_TEXT.invalidCredentials);
                return;
            }

            toast.success(AUTH_TOAST_TEXT.loginSuccess);
            router.push(ROUTES.DASHBOARD);
            router.refresh();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || AUTH_TOAST_TEXT.unexpectedError);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        loginWithGoogle,
        onSubmit,
    };
}
