"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Bell,
  BarChart3,
  CircleHelp,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Moon,
  Settings,
  Shield,
  Sun,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { APP_NAME } from "@/shared/constants/app";
import { ROUTES } from "@/shared/constants/routes";
import { getLoginCallbackUrl } from "@/shared/lib/auth-redirect";
import { NAVBAR_ITEMS, NAVBAR_MOBILE_ITEMS, NAVBAR_TEXT } from "@/features/dashboard/constants/navbar.constants";

const navIconByHref = {
  [ROUTES.DASHBOARD]: LayoutDashboard,
  [ROUTES.URLS]: LinkIcon,
  [ROUTES.ANALYTICS]: BarChart3,
  [ROUTES.SETTINGS]: Settings,
} as const;

const mobileNavIconByHref = {
  [ROUTES.DASHBOARD]: LayoutDashboard,
  [ROUTES.URLS]: LinkIcon,
  [ROUTES.ANALYTICS]: BarChart3,
  [ROUTES.SETTINGS]: UserRound,
  [ROUTES.ADMIN]: Shield,
} as const;

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const profileLabel = session?.user?.fullName || session?.user?.email || "U";
  const profileInitial = profileLabel.slice(0, 1).toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    signOut({ callbackUrl: getLoginCallbackUrl() });
  };

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const mobileMenuItems =
    session?.user?.role === "ADMIN"
      ? [...NAVBAR_MOBILE_ITEMS, { name: NAVBAR_TEXT.adminPanel, href: ROUTES.ADMIN }]
      : NAVBAR_MOBILE_ITEMS;

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar/95 p-4 backdrop-blur-xl md:flex">
        <div className="mb-8 px-2">
          <div className="text-2xl font-black tracking-tight text-primary">{APP_NAME}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{NAVBAR_TEXT.premiumTagline}</div>
        </div>


        <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Menu chính</div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAVBAR_ITEMS.map((item) => {
            const Icon = navIconByHref[item.href];
            const active = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-secondary/80 text-primary"
                    : "text-sidebar-foreground hover:bg-secondary/55 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          {session?.user?.role === "ADMIN" && (
            <Link
              href={ROUTES.ADMIN}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActiveLink(ROUTES.ADMIN)
                  ? "bg-secondary/80 text-primary"
                  : "text-sidebar-foreground hover:bg-secondary/55 hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4" />
              {NAVBAR_TEXT.adminPanel}
            </Link>
          )}
        </nav>

        <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-secondary/55 hover:text-foreground"
            onClick={handleToggleTheme}
            aria-label={NAVBAR_TEXT.toggleTheme}
          >
            {!mounted ? <div className="h-4 w-4" /> : resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {NAVBAR_TEXT.themeToggle}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-secondary/55 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {NAVBAR_TEXT.signOut}
          </Button>
        </div>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 items-center justify-between border-b border-sidebar-border bg-background/75 px-8 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-8">
          <Link href={ROUTES.HOME} className="text-xl font-black tracking-tight text-primary">
            {APP_NAME}
          </Link>
        </div>

        <div className="ml-6 flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            onClick={handleToggleTheme}
            aria-label={NAVBAR_TEXT.toggleTheme}
          >
            {!mounted ? <div className="h-5 w-5" /> : resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            aria-label={NAVBAR_TEXT.notificationsAriaLabel}
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            aria-label="Trợ giúp"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/35 bg-secondary/80 text-xs font-bold text-primary">
            {profileInitial}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center rounded-t-3xl border-t border-border bg-sidebar/95 px-2 backdrop-blur-xl md:hidden">
        <button
          type="button"
          className="flex flex-1 min-w-0 flex-col items-center justify-center rounded-lg px-1 py-1 text-[9px] font-medium leading-tight text-sidebar-foreground transition-all duration-200"
          onClick={handleToggleTheme}
          aria-label={NAVBAR_TEXT.toggleTheme}
        >
          {!mounted ? <div className="mb-1 h-4 w-4" /> : resolvedTheme === "dark" ? <Sun className="mb-1 h-4 w-4" /> : <Moon className="mb-1 h-4 w-4" />}
          <span className="whitespace-nowrap">{NAVBAR_TEXT.themeToggle}</span>
        </button>

        {mobileMenuItems.map((item) => {
          const Icon = mobileNavIconByHref[item.href];
          const active = isActiveLink(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 min-w-0 flex-col items-center justify-center rounded-lg px-1 py-1 text-[9px] font-medium leading-tight transition-all duration-200",
                active ? "bg-secondary/80 text-primary" : "text-sidebar-foreground"
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className="flex flex-1 min-w-0 flex-col items-center justify-center rounded-lg px-1 py-1 text-[9px] font-medium leading-tight text-sidebar-foreground transition-all duration-200"
          onClick={handleSignOut}
          aria-label={NAVBAR_TEXT.signOut}
        >
          <LogOut className="mb-1 h-4 w-4" />
          <span className="whitespace-nowrap">{NAVBAR_TEXT.signOut}</span>
        </button>
      </nav>
    </>
  );
}
