"use client";

import { Lock, Mail, User, UserPlus } from "lucide-react";

import { useRegisterForm } from "../hooks/useRegisterForm";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { REGISTER_FORM_TEXT } from "@/features/auth/constants/authUi.constants";

export default function RegisterForm() {
  const { form, isLoading, registerWithGoogle, onSubmit } = useRegisterForm();

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{REGISTER_FORM_TEXT.fullName}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-10" placeholder={REGISTER_FORM_TEXT.fullNamePlaceholder} {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{REGISTER_FORM_TEXT.email}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-10" placeholder={REGISTER_FORM_TEXT.emailPlaceholder} type="email" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{REGISTER_FORM_TEXT.password}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-10" placeholder={REGISTER_FORM_TEXT.passwordPlaceholder} type="password" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="h-12 w-full text-xs font-bold uppercase tracking-[0.16em]" disabled={isLoading}>
            {isLoading ? REGISTER_FORM_TEXT.creatingAccount : REGISTER_FORM_TEXT.createAccount}
            <UserPlus className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-[10px] font-bold tracking-[0.16em] text-muted-foreground">
            {REGISTER_FORM_TEXT.continueWith}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="h-12 w-full text-xs font-bold uppercase tracking-[0.14em] text-foreground"
        onClick={registerWithGoogle}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            fill="currentColor"
            d="M21.805 10.023h-9.8v3.955h5.617c-.243 1.298-.974 2.399-2.07 3.136v2.598h3.347c1.958-1.803 3.106-4.458 3.106-7.614 0-.683-.061-1.34-.2-2.075Z"
          />
          <path
            fill="currentColor"
            d="M12.005 22c2.806 0 5.165-.926 6.894-2.52l-3.346-2.598c-.926.627-2.104 1.001-3.548 1.001-2.716 0-5.015-1.832-5.842-4.29H2.704v2.68A10.414 10.414 0 0 0 12.005 22Z"
          />
          <path
            fill="currentColor"
            d="M6.163 13.593A6.26 6.26 0 0 1 5.83 11.7c0-.656.118-1.293.332-1.894V7.126H2.704A10.294 10.294 0 0 0 1.59 11.7c0 1.65.394 3.212 1.113 4.574l3.46-2.68Z"
          />
          <path
            fill="currentColor"
            d="M12.005 5.518c1.53 0 2.901.526 3.982 1.558l2.983-2.984C17.164 2.47 14.811 1.4 12.005 1.4A10.414 10.414 0 0 0 2.704 7.126l3.459 2.68c.827-2.458 3.126-4.288 5.842-4.288Z"
          />
        </svg>
        {REGISTER_FORM_TEXT.continueWithGoogle}
      </Button>
    </div>
  );
}
