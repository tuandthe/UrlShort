"use client";

import { useRef } from "react";
import { Camera, Fingerprint, Lock, User, UserCircle2 } from "lucide-react";

import { useProfileForm } from "../hooks/useProfileForm";
import { UserProfile } from "../types/user.types";
import { PROFILE_FORM_TEXT } from "../constants/settingsUi.constants";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface ProfileFormProps {
    profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const isGoogleAccount = profile.provider === "GOOGLE";

    const {
        fullName,
        setFullName,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        handleProfileSubmit,
        handlePasswordSubmit,
        handleAvatarFileChange,
        avatarPreviewUrl,
        isAvatarPreviewLoading,
        isAvatarPending,
        isProfilePending,
        isPasswordPending,
    } = useProfileForm(profile);

    const openAvatarPicker = () => {
        if (isAvatarPending) {
            return;
        }

        avatarInputRef.current?.click();
    };

    return (
        <div className="max-w-6xl space-y-10">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="stitch-card relative overflow-hidden rounded-xl border-border/40 p-7">
                    <Fingerprint className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-muted-foreground/15" />
                    <CardContent className="space-y-6 p-0">
                        <div className="flex items-center gap-4 border-b border-border pb-5">
                            <User className="h-7 w-7 text-primary" />
                            <h2 className="text-lg font-black uppercase tracking-[0.14em] text-foreground">{PROFILE_FORM_TEXT.profileInfoTitle}</h2>
                        </div>

                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary/70">
                                    {avatarPreviewUrl ? (
                                        <div
                                            role="img"
                                            aria-label={PROFILE_FORM_TEXT.avatarAriaLabel}
                                            className="h-full w-full bg-cover bg-center bg-no-repeat"
                                            style={{ backgroundImage: `url(${avatarPreviewUrl})` }}
                                        />
                                    ) : (
                                        <UserCircle2 className="h-12 w-12 text-primary" />
                                    )}
                                </div>

                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleAvatarFileChange}
                                    disabled={isAvatarPending}
                                />

                                <button
                                    type="button"
                                    onClick={openAvatarPicker}
                                    disabled={isAvatarPending}
                                    className="absolute bottom-0 right-0 rounded-full border border-border bg-secondary/80 p-2 text-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                    aria-label={PROFILE_FORM_TEXT.updateAvatarAriaLabel}
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {(isAvatarPending || isAvatarPreviewLoading) && (
                                <p className="text-xs text-muted-foreground">
                                    {isAvatarPending ? PROFILE_FORM_TEXT.uploadingAvatar : PROFILE_FORM_TEXT.loadingAvatar}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className={profile.active
                                        ? "border-primary/30 bg-primary/10 text-primary"
                                        : "border-muted-foreground/20 bg-muted text-muted-foreground"
                                    }
                                >
                                    {profile.active ? PROFILE_FORM_TEXT.active : PROFILE_FORM_TEXT.inactive}
                                </Badge>
                                <Badge variant="outline" className="border-primary/35 bg-primary/10 text-primary">
                                    {profile.provider === "GOOGLE" ? PROFILE_FORM_TEXT.providerGoogle : PROFILE_FORM_TEXT.providerLocal}
                                </Badge>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="profile-email">
                                    {PROFILE_FORM_TEXT.emailLabel}
                                </Label>
                                <Input
                                    id="profile-email"
                                    value={profile.email}
                                    readOnly
                                    className="text-muted-foreground"
                                />
                                <div className="mt-1 inline-flex rounded-full border border-border/50 bg-secondary/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                    CHỈ ĐỌC
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="profile-full-name">
                                    {PROFILE_FORM_TEXT.fullNameLabel}
                                </Label>
                                <Input
                                    id="profile-full-name"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                />
                            </div>

                            <Button type="submit" disabled={isProfilePending} className="h-12 w-full text-xs font-bold uppercase tracking-[0.16em]">
                                {isProfilePending ? PROFILE_FORM_TEXT.saving : PROFILE_FORM_TEXT.saveChanges}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {!isGoogleAccount && (
                    <Card className="stitch-card rounded-xl border-border/40 p-7">
                        <CardContent className="space-y-6 p-0">
                            <div className="flex items-center gap-4 border-b border-border pb-5">
                                <Lock className="h-7 w-7 text-primary" />
                                <h2 className="text-lg font-black uppercase tracking-[0.14em] text-foreground">{PROFILE_FORM_TEXT.changePasswordTitle}</h2>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-5 pt-2">
                                <div className="space-y-2">
                                    <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="new-password">
                                        {PROFILE_FORM_TEXT.newPasswordLabel}
                                    </Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="confirm-password">
                                        {PROFILE_FORM_TEXT.confirmPasswordLabel}
                                    </Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="rounded-lg border border-border bg-secondary/55 p-4 text-xs leading-relaxed text-muted-foreground">
                                    {PROFILE_FORM_TEXT.passwordRule}
                                </div>

                                <Button type="submit" disabled={isPasswordPending} className="h-12 w-full text-xs font-bold uppercase tracking-[0.16em]">
                                    {isPasswordPending ? PROFILE_FORM_TEXT.updatingPassword : PROFILE_FORM_TEXT.updatePassword}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>

            <section>
                <Card className="rounded-xl border border-destructive/25 bg-destructive/5 p-7">
                    <CardContent className="flex flex-col justify-between gap-6 p-0 md:flex-row md:items-center">
                        <div className="flex gap-4">
                            <div className="text-3xl text-destructive">⚠</div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">{PROFILE_FORM_TEXT.deleteAccountTitle}</h3>
                                <p className="text-sm text-muted-foreground">{PROFILE_FORM_TEXT.deleteAccountDescription}</p>
                            </div>
                        </div>
                        <Button variant="destructive" className="px-6 py-3 text-base">
                            {PROFILE_FORM_TEXT.deactivateAccount}
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}