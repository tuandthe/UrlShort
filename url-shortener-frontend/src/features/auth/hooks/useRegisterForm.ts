import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RegisterInput, registerSchema } from "../schemas/auth.schema";
import { registerUser } from "../services/authApi";
import { AUTH_TOAST_TEXT } from "../constants/authUi.constants";
import { useGoogleLogin } from "./useGoogleLogin";
import { ROUTES } from "@/shared/constants/routes";

export function useRegisterForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const registerWithGoogle = useGoogleLogin();

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "", fullName: "" },
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);

        try {
            await registerUser(data);
            toast.success(AUTH_TOAST_TEXT.registerSuccess);
            router.push(ROUTES.LOGIN);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || AUTH_TOAST_TEXT.registerFailed);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        registerWithGoogle,
        onSubmit,
    };
}
