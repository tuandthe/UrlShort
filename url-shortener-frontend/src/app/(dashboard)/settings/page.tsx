"use client";

import { useSettingsPage } from "@/features/settings/hooks/useSettingsPage";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { SETTINGS_PAGE_TEXT } from "@/features/settings/constants/settingsUi.constants";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { profile, isLoading, isError } = useSettingsPage();

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          {SETTINGS_PAGE_TEXT.loadError}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="stitch-shell space-y-8">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">CONFIGURATION</p>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{SETTINGS_PAGE_TEXT.title}</h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{SETTINGS_PAGE_TEXT.subtitle}</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
