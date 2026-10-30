import type { Metadata } from "next";
import { Outfit, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "FreightIQ - Rate Confirmation Operations",
    template: "%s | FreightIQ"
  },
  description: "A freight broker workspace for rate confirmation extraction, validation, human review, CSV export, and mock TMS handoff.",
  keywords: ["freight brokerage", "rate confirmation", "document extraction", "carrier rates", "TMS", "logistics operations"],
  authors: [{ name: "FreightIQ Team" }],
  creator: "FreightIQ",
  publisher: "FreightIQ",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "FreightIQ - Rate Confirmation Operations",
    description: "Extract, validate, review, and hand off carrier rate confirmations.",
    siteName: "FreightIQ",
    images: [
      {
        url: "/freightiq-logo.png",
        width: 1024,
        height: 1024,
        alt: "FreightIQ - Freight Broker Operations",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "FreightIQ - Rate Confirmation Operations",
    description: "Extract, validate, review, and hand off carrier rate confirmations.",
    images: ["/freightiq-logo.png"],
    creator: "@freightiq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable} ${notoSansBengali.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
