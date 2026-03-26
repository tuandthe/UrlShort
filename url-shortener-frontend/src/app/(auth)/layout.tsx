import { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/shared/constants/app";
import { ROUTES } from "@/shared/constants/routes";
import { AUTH_LAYOUT_FEATURES, AUTH_LAYOUT_TEXT } from "@/features/auth/constants/authUi.constants";

export const metadata: Metadata = {
  title: AUTH_LAYOUT_TEXT.metadataTitle,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stitch-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-112 w-md rounded-full bg-chart-1/10 blur-[140px]" />
      </div>

      <main className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-10 md:px-8 lg:gap-14 lg:px-10">
        <section className="flex flex-col justify-center space-y-12 px-4 py-10 md:px-0 md:py-0">
          <header className="max-w-xl">
            <Link href={ROUTES.HOME} className="text-4xl font-black tracking-tight text-primary">
              {APP_NAME}
            </Link>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
              {AUTH_LAYOUT_TEXT.intro}
            </p>
          </header>

          <div className="space-y-8">
            {AUTH_LAYOUT_FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-secondary/70">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center px-2 py-4 md:px-0 md:py-0">
          <div className="w-full max-w-md">
            <Link href={ROUTES.HOME} className="mb-8 block text-center text-3xl font-bold text-primary md:hidden">
              {APP_NAME}
            </Link>
            {children}
          </div>
        </section>
      </main>

      <footer className="pointer-events-none fixed bottom-6 left-6 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:flex lg:gap-6">
        <a href="#" className="pointer-events-auto hover:text-primary">Chính sách bảo mật</a>
        <a href="#" className="pointer-events-auto hover:text-primary">Điều khoản dịch vụ</a>
        <a href="#" className="pointer-events-auto hover:text-primary">Bảo mật</a>
      </footer>

      <div className="pointer-events-none fixed bottom-6 right-6 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:block">
        © 2024 URLSHORT HẠ TẦNG SỐ
      </div>
    </div>
  );
}
