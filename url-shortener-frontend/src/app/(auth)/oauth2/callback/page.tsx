"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useOAuth2Callback } from "@/features/auth/hooks/useOAuth2Callback";
import { APP_NAME } from "@/shared/constants/app";
import { OAUTH_CALLBACK_TEXT } from "@/features/auth/constants/authUi.constants";

function CallbackContent() {
  const { error } = useOAuth2Callback();

  if (error) {
    return (
      <div className="stitch-card w-full max-w-md rounded-2xl p-10 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-destructive">{OAUTH_CALLBACK_TEXT.authError}</p>
        <p className="text-sm text-muted-foreground">{OAUTH_CALLBACK_TEXT.redirectingLogin}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="stitch-card flex flex-col items-center rounded-2xl border-border/40 p-10 text-center shadow-2xl">
        <div className="mb-12">
          <h1 className="text-3xl font-black tracking-tight text-primary">{APP_NAME}</h1>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{OAUTH_CALLBACK_TEXT.brandSubtitle}</p>
        </div>

        <div className="relative mb-10 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-border bg-secondary/40" />
          <Loader2 className="absolute inset-0 m-auto h-28 w-28 animate-spin text-primary" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary/70">
            <Loader2 className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-black uppercase tracking-[0.16em] text-foreground">{OAUTH_CALLBACK_TEXT.title}</h2>
          <p className="mx-auto max-w-70 leading-relaxed text-muted-foreground">
            {OAUTH_CALLBACK_TEXT.description}
          </p>
        </div>

        <div className="mt-12 flex w-full items-center space-x-3 rounded-lg border border-border bg-secondary/55 px-4 py-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {OAUTH_CALLBACK_TEXT.secureConnection}
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-6">
        <a className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary" href="#">{OAUTH_CALLBACK_TEXT.links.privacy}</a>
        <a className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary" href="#">{OAUTH_CALLBACK_TEXT.links.terms}</a>
        <a className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary" href="#">{OAUTH_CALLBACK_TEXT.links.help}</a>
      </div>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <div className="stitch-shell relative flex min-h-screen items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        <div className="absolute left-[-5%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[40%] w-[40%] rounded-full bg-primary/25 blur-[100px]" />
      </div>
      <Suspense fallback={<div>{OAUTH_CALLBACK_TEXT.loadingFallback}</div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
