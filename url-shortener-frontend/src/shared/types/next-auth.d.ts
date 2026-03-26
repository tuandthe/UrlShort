import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
      fullName?: string;
      role?: string;
      avatarUrl?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
    avatarUrl?: string | null;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    id?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string | null;
  }
}
