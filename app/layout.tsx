import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gold & Finance Tracker",
  description: "Local-first personal finance and gold portfolio tracker",
  appleWebApp: {
    capable: true,
    title: "Finance",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileNav />
            <div className="flex-1">{children}</div>
          </div>
        </div>
        <Toaster richColors position="top-right" />
        <PwaRegister />
      </body>
    </html>
  );
}
