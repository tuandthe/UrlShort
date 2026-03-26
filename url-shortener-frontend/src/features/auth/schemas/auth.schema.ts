import { z } from "zod";
import { AUTH_CONSTRAINTS } from "@/shared/constants/auth";

export const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Định dạng email không hợp lệ"),
  password: z.string().min(AUTH_CONSTRAINTS.PASSWORD_MIN_LENGTH, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const registerSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Định dạng email không hợp lệ"),
  password: z.string().min(AUTH_CONSTRAINTS.PASSWORD_MIN_LENGTH, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(1, "Họ và tên là bắt buộc").max(AUTH_CONSTRAINTS.FULL_NAME_MAX_LENGTH, `Họ và tên tối đa ${AUTH_CONSTRAINTS.FULL_NAME_MAX_LENGTH} ký tự`),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
