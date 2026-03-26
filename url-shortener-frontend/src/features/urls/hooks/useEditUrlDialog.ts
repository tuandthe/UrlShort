import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useUpdateUrl, useUpdateUrlExpiration } from "./useUrls";
import { UrlDetail } from "../types/url.types";
import { EDIT_URL_FORM_TEXT } from "../constants/urlForms.constants";
import { DATETIME_CONSTANTS } from "@/shared/constants/app";
import { URL_CONSTRAINTS } from "@/shared/constants/url";

const editUrlSchema = z.object({
    originalUrl: z.string().url(EDIT_URL_FORM_TEXT.validUrlMessage),
    customAlias: z
        .string()
        .max(URL_CONSTRAINTS.CUSTOM_ALIAS_MAX_LENGTH, EDIT_URL_FORM_TEXT.aliasMaxLengthMessage)
        .optional()
        .or(z.literal("")),
    password: z.string().optional().or(z.literal("")),
    expiresAt: z.string().optional().or(z.literal("")),
});

type EditUrlFormInput = z.infer<typeof editUrlSchema>;

function toDatetimeLocalValue(value?: string | null) {
    if (!value) {
        return "";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    const timezoneOffset = parsedDate.getTimezoneOffset() * DATETIME_CONSTANTS.MILLISECONDS_PER_MINUTE;
    return new Date(parsedDate.getTime() - timezoneOffset)
        .toISOString()
        .slice(0, DATETIME_CONSTANTS.LOCAL_INPUT_SLICE_END);
}

export function useEditUrlDialog(url: UrlDetail | null, onOpenChange: (open: boolean) => void) {
    const updateUrlMutation = useUpdateUrl();
    const updateExpirationMutation = useUpdateUrlExpiration();

    const form = useForm<EditUrlFormInput>({
        resolver: zodResolver(editUrlSchema),
        defaultValues: {
            originalUrl: "",
            customAlias: "",
            password: "",
            expiresAt: "",
        },
    });

    useEffect(() => {
        if (!url) {
            return;
        }

        form.reset({
            originalUrl: url.originalUrl,
            customAlias: url.shortCode,
            password: "",
            expiresAt: toDatetimeLocalValue(url.expiresAt),
        });
    }, [form, url]);

    const isPending = updateUrlMutation.isPending || updateExpirationMutation.isPending;

    const onSubmit = async (values: EditUrlFormInput) => {
        if (!url) {
            return;
        }

        const normalizedExpiresAt = values.expiresAt?.trim() || "";
        let expiresAt: Date | null = null;

        if (normalizedExpiresAt) {
            const parsedDate = new Date(normalizedExpiresAt);
            if (Number.isNaN(parsedDate.getTime())) {
                toast.error(EDIT_URL_FORM_TEXT.invalidExpiration);
                return;
            }

            expiresAt = parsedDate;
        }

        try {
            await updateUrlMutation.mutateAsync({
                id: url.id,
                data: {
                    originalUrl: values.originalUrl,
                    customAlias: values.customAlias?.trim() || "",
                    password: values.password?.trim() || "",
                    expiresAt,
                },
            });

            if (!normalizedExpiresAt && url.expiresAt) {
                await updateExpirationMutation.mutateAsync({ id: url.id, expiresAt: null });
            }

            onOpenChange(false);
        } catch {
            // Mutation handlers already show toasts
        }
    };

    return {
        form,
        onSubmit,
        isPending,
    };
}
