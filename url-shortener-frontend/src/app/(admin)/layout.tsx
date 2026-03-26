import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/shared/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { Navbar } from "@/features/dashboard/components/Navbar";

export const metadata: Metadata = {
    title: "Quản trị - UrlShort",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect(ROUTES.LOGIN);
    }

    if (session.user?.role !== "ADMIN") {
        redirect(ROUTES.DASHBOARD);
    }

    return (
        <div className="stitch-shell">
            <Navbar />
            <main className="min-h-screen p-6 pb-24 md:ml-64 md:pt-24 md:pb-10 lg:p-8 lg:pt-24">{children}</main>
        </div>
    );
}