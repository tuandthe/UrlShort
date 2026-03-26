import { Metadata } from "next";
import { Navbar } from "@/features/dashboard/components/Navbar";

export const metadata: Metadata = {
  title: "Bảng điều khiển - UrlShort",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stitch-shell">
      <Navbar />
      <main className="min-h-screen p-6 pb-24 md:ml-64 md:pt-24 md:pb-10 lg:p-8 lg:pt-24">{children}</main>
    </div>
  );
}
