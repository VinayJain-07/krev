import type { Metadata } from "next";
import Script from "next/script";
import { AppPreloader } from "@/components/app-preloader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "KREV AI — AI CMO for Evidence-Led Marketing",
  description: "Turn your website into connected company intelligence, clear marketing priorities, and specialist agent work with an always-on AI CMO.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "KREV AI",
    title: "KREV AI — Give your marketing direction.",
    description: "Connect your company URL, build evidence-led marketing intelligence, and turn the next best move into work.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "KREV AI CMO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KREV AI — Give your marketing direction.",
    description: "Evidence-led company intelligence, clear priorities, and specialist agent work in one AI CMO workspace.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppPreloader />
        {children}
        <Script id="smark-theme" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('smark-theme');var v=t==='dark'?'dark':'light';document.documentElement.dataset.theme=v;document.documentElement.style.colorScheme=v}catch(e){document.documentElement.dataset.theme='light'}})();`}</Script>
      </body>
    </html>
  );
}
