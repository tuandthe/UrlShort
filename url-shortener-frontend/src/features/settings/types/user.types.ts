export type AccountProvider = "LOCAL" | "GOOGLE";

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  provider: AccountProvider;
  avatarUrl?: string | null;
}

export interface UpdateProfileInput {
  fullName?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  message: string;
}
