import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTH_PROVIDER_IDS } from "@/shared/constants/auth";
import { ROUTES } from "@/shared/constants/routes";

interface AccessTokenClaims {
  sub?: string;
  role?: string;
  userId?: string | number;
  email?: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string | null;
}

interface AuthIdentity {
  id: string;
  email: string;
  role?: string;
  fullName?: string;
  avatarUrl?: string | null;
  accessToken: string;
  refreshToken: string;
}

const decodeAccessTokenClaims = (jwtToken?: string): AccessTokenClaims | null => {
  if (!jwtToken) {
    return null;
  }

  const payload = jwtToken.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decodedJson = Buffer.from(paddedBase64, "base64").toString("utf-8");
    return JSON.parse(decodedJson) as AccessTokenClaims;
  } catch (error) {
    console.error("Failed to decode JWT access token claims:", error);
    return null;
  }
};

const normalizeRole = (role?: string) => {
  if (!role) {
    return undefined;
  }

  return role.startsWith("ROLE_") ? role.replace("ROLE_", "") : role;
};

const buildAuthIdentity = (accessToken: string, refreshToken: string): AuthIdentity | null => {
  const claims = decodeAccessTokenClaims(accessToken);
  if (!claims) {
    return null;
  }

  const email =
    (typeof claims.email === "string" && claims.email) ||
    (typeof claims.sub === "string" && claims.sub) ||
    undefined;

  if (!email) {
    return null;
  }

  const id =
    typeof claims.userId === "number" || typeof claims.userId === "string"
      ? String(claims.userId)
      : email;

  return {
    id,
    email,
    role: normalizeRole(typeof claims.role === "string" ? claims.role : undefined),
    fullName:
      (typeof claims.fullName === "string" && claims.fullName) ||
      (typeof claims.name === "string" && claims.name) ||
      undefined,
    avatarUrl: typeof claims.avatarUrl === "string" && claims.avatarUrl ? claims.avatarUrl : null,
    accessToken,
    refreshToken,
  };
};

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV !== "production",
  providers: [
    CredentialsProvider({
      id: AUTH_PROVIDER_IDS.TOKEN_LOGIN,
      name: "Token Login",
      credentials: {
        accessToken: { type: "text" },
        refreshToken: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken || !credentials?.refreshToken) {
          return null;
        }

        return buildAuthIdentity(String(credentials.accessToken), String(credentials.refreshToken));
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.role = normalizeRole(user.role);
        token.email = user.email;
        token.fullName = user.fullName;
        token.avatarUrl = user.avatarUrl || null;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }

      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }

      if (token.id) {
        session.user.id = token.id as string;
      }

      if (token.email) {
        session.user.email = token.email as string;
      }

      if (token.role) {
        session.user.role = token.role as string;
      }

      session.user.fullName = (token.fullName as string) || session.user.fullName;

      if (token.avatarUrl) {
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (Refresh token expiry match)
  },
  pages: {
    signIn: ROUTES.LOGIN,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
