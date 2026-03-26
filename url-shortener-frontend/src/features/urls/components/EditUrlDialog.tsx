"use client";

import { useEditUrlDialog } from "../hooks/useEditUrlDialog";
import { UrlDetail } from "../types/url.types";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { EDIT_URL_FORM_TEXT } from "../constants/urlForms.constants";

interface EditUrlDialogProps {
    url: UrlDetail | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditUrlDialog({ url, open, onOpenChange }: EditUrlDialogProps) {
    const { form, onSubmit, isPending } = useEditUrlDialog(url, onOpenChange);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{EDIT_URL_FORM_TEXT.title}</DialogTitle>
                    <DialogDescription>
                        {EDIT_URL_FORM_TEXT.description}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="originalUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{EDIT_URL_FORM_TEXT.originalUrl}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={EDIT_URL_FORM_TEXT.originalUrlPlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customAlias"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{EDIT_URL_FORM_TEXT.customAlias}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={EDIT_URL_FORM_TEXT.customAliasPlaceholder} {...field} />
                                    </FormControl>
                                    <FormDescription>{EDIT_URL_FORM_TEXT.customAliasHint}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{EDIT_URL_FORM_TEXT.password}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={EDIT_URL_FORM_TEXT.passwordPlaceholder} {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {EDIT_URL_FORM_TEXT.passwordHint}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expiresAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{EDIT_URL_FORM_TEXT.expiresAt}</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormDescription>{EDIT_URL_FORM_TEXT.expiresAtHint}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {EDIT_URL_FORM_TEXT.cancel}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? EDIT_URL_FORM_TEXT.saving : EDIT_URL_FORM_TEXT.saveChanges}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
