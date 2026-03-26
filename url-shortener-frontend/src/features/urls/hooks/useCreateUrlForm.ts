import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateUrl } from "./useUrls";
import { CreateUrlInput, createUrlSchema } from "../schemas/url.schema";

export function useCreateUrlForm(onSuccess?: () => void) {
    const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
    const createUrlMutation = useCreateUrl();

    const form = useForm<CreateUrlInput>({
        resolver: zodResolver(createUrlSchema),
        defaultValues: {
            originalUrl: "",
            customAlias: "",
            password: "",
        },
    });

    const onSubmit = (data: CreateUrlInput) => {
        createUrlMutation.mutate(data, {
            onSuccess: () => {
                form.reset();

                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    };

    const toggleAdvancedOptions = () => {
        setIsAdvancedOptionsOpen((currentOpenState) => !currentOpenState);
    };

    return {
        form,
        onSubmit,
        isAdvancedOptionsOpen,
        toggleAdvancedOptions,
        isPending: createUrlMutation.isPending,
    };
}
