import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gold & Finance Tracker",
  description: "Local-first personal finance and gold portfolio tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppShell>{children}</AppShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
