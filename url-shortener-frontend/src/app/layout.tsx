import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import QueryProvider from "@/shared/providers/QueryProvider";
import SessionProvider from "@/shared/providers/SessionProvider";
import { Toaster } from "@/shared/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "UrlShort - Nền tảng rút gọn URL",
  description: "Nền tảng rút gọn URL chuẩn doanh nghiệp với phân tích, bảo mật và bảng điều khiển hiện đại.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-background text-foreground`}>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
