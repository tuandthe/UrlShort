import { z } from "zod";
import { URL_CONSTRAINTS } from "@/shared/constants/url";

export const createUrlSchema = z.object({
  originalUrl: z.string().url("URL không hợp lệ"),
  customAlias: z
    .string()
    .max(URL_CONSTRAINTS.CUSTOM_ALIAS_MAX_LENGTH, `Bí danh tối đa ${URL_CONSTRAINTS.CUSTOM_ALIAS_MAX_LENGTH} ký tự`)
    .optional()
    .or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  expiresAt: z.date().optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;

export type UpdateUrlInput = {
  originalUrl: string;
  customAlias?: string;
  password?: string;
  expiresAt?: Date | null;
};
