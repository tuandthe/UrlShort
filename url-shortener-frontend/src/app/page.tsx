import Link from "next/link";

import { APP_NAME } from "@/shared/constants/app";
import { ROUTES } from "@/shared/constants/routes";
import Image from "next/image";
import { useLandingPage } from "@/features/landing/hooks/useLandingPage";

export default function HomePage() {
    const { currentYear, text, features, mobileNav } = useLandingPage();

    return (
        <div className="stitch-shell min-h-screen text-foreground">
            <header className="fixed left-0 top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-semibold text-primary">{APP_NAME}</span>
                        <nav className="hidden items-center gap-6 md:flex">
                            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{text.topLinks.docs}</a>
                            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{text.topLinks.api}</a>
                            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{text.topLinks.pricing}</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={ROUTES.LOGIN} className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            {text.topActions.signIn}
                        </Link>
                        <Link href={ROUTES.REGISTER} className="stitch-primary-btn rounded-lg px-5 py-2 text-sm font-semibold">
                            {text.topActions.getStarted}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 pb-12 pt-32">
                <section className="flex flex-col items-center py-16 text-center md:py-24">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-4 py-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{text.enterpriseTag}</span>
                    </div>

                    <div className="max-w-4xl">
                        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-7xl">
                            {text.heroTitlePrefix} <span className="text-primary">{text.heroTitleHighlight}</span>
                        </h1>
                        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl">
                            {text.heroDescription}
                        </p>

                        <div className="flex w-full flex-col gap-6 sm:w-auto sm:flex-row sm:justify-center">
                            <Link
                                href={ROUTES.REGISTER}
                                className="stitch-primary-btn rounded-2xl px-8 py-4 text-lg font-bold transition-all active:scale-95"
                            >
                                {text.createAccount}
                            </Link>
                            <Link
                                href={ROUTES.LOGIN}
                                className="rounded-2xl border border-border bg-secondary/70 px-8 py-4 text-lg font-medium text-muted-foreground transition-all active:scale-95"
                            >
                                {text.alreadyHasAccount}
                            </Link>
                        </div>
                    </div>

                    <div className="stitch-card mt-20 w-full max-w-6xl rounded-[2.5rem] p-4">
                        <div className="group relative aspect-video overflow-hidden rounded-[2rem] border border-border/70">
                            <Image
                                fill
                                className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-100"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2mu2OLEfUQ4Bg9hc2IPN4DIwzpN0oYeGdjt9U8Rox0JNMlMyyWaAfclU1wyYv2MY21fjap5vGDY9XMFqrWLv_5HjmSoyPhk0hVXpxKCq0RTmxtyrn7ARavdU0uIjng4zUYstZVYjbMNZz4DFpxjmfNymFbnIOmsPEQQVoR2w7oO7SqxrjhaXxAel3jCA1husgS6xJ3IwsByPr-N_QJJLX6zj6EfTkNrB2KRpXWYF2LH-NUVhSdgBOmSS1ez3IfhgnN1I4P9tHdA"
                                alt={text.imageAlt}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-background/75 to-transparent" />
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="stitch-card rounded-[2rem] p-8"
                                >
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary/70">
                                        <Icon className={`h-7 w-7 ${feature.iconClass}`} />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-semibold">{feature.title}</h3>
                                    <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="max-w-5xl py-16 mx-auto">
                    <div className="rounded-[2rem] border border-border bg-secondary/55 p-12 text-center">
                        <h2 className="text-4xl font-black tracking-tight text-foreground">{text.ctaTitle}</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{text.ctaDescription}</p>
                        <Link href={ROUTES.REGISTER} className="mt-8 inline-flex rounded-xl bg-white px-10 py-4 text-lg font-bold text-black transition-all active:scale-95">
                            {text.ctaButton}
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-background/75 pb-12 pt-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
                        <div className="space-y-4 md:col-span-2">
                            <span className="text-2xl font-semibold text-primary">{APP_NAME}</span>
                            <p className="pr-8 text-muted-foreground">
                                {text.footerDescription}
                            </p>
                        </div>

                        <div>
                            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest">{text.sections.platform}</h4>
                            <ul className="space-y-4 font-medium text-muted-foreground">
                                <li><Link className="transition-colors hover:text-primary" href={ROUTES.LOGIN}>{text.platformLinks.signIn}</Link></li>
                                <li><Link className="transition-colors hover:text-primary" href={ROUTES.REGISTER}>{text.platformLinks.register}</Link></li>
                                <li><Link className="transition-colors hover:text-primary" href={ROUTES.DASHBOARD}>{text.platformLinks.dashboard}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest">{text.sections.connect}</h4>
                            <ul className="space-y-4 font-medium text-muted-foreground">
                                <li><a className="transition-colors hover:text-primary" href="#">{text.legalLinks.terms}</a></li>
                                <li><a className="transition-colors hover:text-primary" href="#">{text.legalLinks.privacy}</a></li>
                                <li><a className="transition-colors hover:text-primary" href="#">Tuân thủ</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
                        <p>© {currentYear} {APP_NAME}. {text.copyrightSuffix}</p>
                        <div className="flex items-center gap-4">
                            <span className="h-4 w-4 rounded-sm border border-border/70 bg-secondary/55" />
                            <span className="h-4 w-4 rounded-sm border border-border/70 bg-secondary/55" />
                            <span className="h-4 w-4 rounded-sm border border-border/70 bg-secondary/55" />
                        </div>
                    </div>
                </div>
            </footer>

            <div className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center rounded-t-3xl border-t border-border bg-background/90 px-2 backdrop-blur-xl md:hidden">
                {mobileNav.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            className={item.isActive
                                ? "flex flex-1 min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-secondary/80 px-1 py-2 text-primary"
                                : "flex flex-1 min-w-0 flex-col items-center justify-center px-1 py-2 text-muted-foreground"
                            }
                            href={item.href}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="mt-1 whitespace-nowrap text-[10px] font-medium leading-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
