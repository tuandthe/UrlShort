"use client";

import { Link2 } from "lucide-react";

import { useCreateUrlForm } from "../hooks/useCreateUrlForm";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { CREATE_URL_FORM_TEXT } from "../constants/urlForms.constants";

export function CreateUrlForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    form,
    onSubmit,
    isAdvancedOptionsOpen,
    toggleAdvancedOptions,
    isPending,
  } = useCreateUrlForm(onSuccess);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="originalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{CREATE_URL_FORM_TEXT.destinationUrl}</FormLabel>
              <FormControl>
                <Input placeholder={CREATE_URL_FORM_TEXT.destinationPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-1">
          <button
            type="button"
            onClick={toggleAdvancedOptions}
            className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <span>{isAdvancedOptionsOpen ? CREATE_URL_FORM_TEXT.hideAdvancedOptions : CREATE_URL_FORM_TEXT.advancedOptions}</span>
            <span className="text-xs">{isAdvancedOptionsOpen ? "▴" : "▾"}</span>
          </button>

          {isAdvancedOptionsOpen && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customAlias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{CREATE_URL_FORM_TEXT.customAlias}</FormLabel>
                      <FormControl>
                        <Input placeholder={CREATE_URL_FORM_TEXT.customAliasPlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>{CREATE_URL_FORM_TEXT.optional}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{CREATE_URL_FORM_TEXT.password}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={CREATE_URL_FORM_TEXT.passwordPlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>{CREATE_URL_FORM_TEXT.optional}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <Button type="submit" disabled={isPending} className="h-12 w-full text-base">
            {isPending ? CREATE_URL_FORM_TEXT.shortening : CREATE_URL_FORM_TEXT.shortenUrl}
            <Link2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
