import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@cuckoobook/ui/theme.scss";
import "./globals.css";
import "./recipe-design.css";
import { AuthGate } from "@/lib/supabase/AuthGate";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cuckoobook",
  description: "Your personal recipe collection. Capture · Scale · Convert.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="theme-cuckoobook"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=42dot+Sans:wght@300;400;600;700;800&display=swap"
        />
        <link rel="stylesheet" href="https://use.typekit.net/usz6qzd.css" />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
