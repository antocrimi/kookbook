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

// Site URL used to resolve absolute URLs for opengraph-image / twitter-image
// (Next.js metadata file conventions emit relative paths and need metadataBase
// to absolutise them — scrapers like iMessage / Twitter require absolute).
// Override locally by setting NEXT_PUBLIC_SITE_URL during build.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://kookbook-s2gn8.ondigitalocean.app";

const SITE_TITLE = "Kookbook";
const SITE_TAGLINE = "Every recipe you love, beautifully in one place.";
const SITE_DESCRIPTION =
  "Every recipe you love, beautifully in one place. Snap a recipe from any cookbook, scale it to your servings, and cook step by step.";

// opengraph-image.png and twitter-image.png live alongside this file
// (app/opengraph-image.png, app/twitter-image.png). Next picks them up
// automatically and emits og:image / twitter:image meta tags.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_TITLE} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_TAGLINE,
  },
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
