import apiClient from "@/shared/lib/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const registerUser = async (data: RegisterInput) => {
  const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return res.data;
};

export const loginUser = async (data: LoginInput) => {
  const res = await apiClient.post<ApiResponse<AuthTokenResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
  return res.data;
};
