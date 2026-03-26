import { auth } from "@/shared/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { NextResponse } from "next/server";

const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.URLS, ROUTES.ANALYTICS, ROUTES.SETTINGS];
const adminRoutes = [ROUTES.ADMIN];
const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

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
