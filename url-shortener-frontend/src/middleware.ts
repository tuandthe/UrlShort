import { auth } from "@/shared/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { NextResponse } from "next/server";

const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.URLS, ROUTES.ANALYTICS, ROUTES.SETTINGS];
const adminRoutes = [ROUTES.ADMIN];
const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER];
const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN || "http://localhost:8080").replace(/\/$/, "");

const RESERVED_SEGMENTS = new Set([
  "api",
  "backend",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "login",
  "register",
  "dashboard",
  "urls",
  "analytics",
  "settings",
  "admin",
  "oauth2",
]);

const SHORT_CODE_REGEX = /^[A-Za-z0-9_-]{6,}$/;

function rewriteShortCodeIfNeeded(pathname: string, requestUrl: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    const shortCode = segments[0];
    if (!RESERVED_SEGMENTS.has(shortCode) && SHORT_CODE_REGEX.test(shortCode)) {
      return NextResponse.rewrite(new URL(`${BACKEND_ORIGIN}/${shortCode}`, requestUrl));
    }
  }

  if (segments.length === 2 && segments[1] === "verify") {
    const shortCode = segments[0];
    if (!RESERVED_SEGMENTS.has(shortCode) && SHORT_CODE_REGEX.test(shortCode)) {
      return NextResponse.rewrite(new URL(`${BACKEND_ORIGIN}/${shortCode}/verify`, requestUrl));
    }
  }

  return null;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const shortCodeRewrite = rewriteShortCodeIfNeeded(nextUrl.pathname, req.url);
  if (shortCodeRewrite) {
    return shortCodeRewrite;
  }

  if (nextUrl.pathname === ROUTES.HOME) {
    if (isLoggedIn) return NextResponse.redirect(new URL(ROUTES.DASHBOARD, nextUrl));
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (authRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (isLoggedIn) return NextResponse.redirect(new URL(ROUTES.DASHBOARD, nextUrl));
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (protectedRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL(ROUTES.LOGIN, nextUrl));
    return NextResponse.next();
  }

  // Admin-only routes
  if (adminRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL(ROUTES.LOGIN, nextUrl));
    if (userRole !== "ADMIN") return NextResponse.redirect(new URL(ROUTES.DASHBOARD, nextUrl));
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
