import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SITE_NAME, baseUrl } from "@/lib/config";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const DESCRIPTION =
  "Feel-good dance fitness classes with Emily in the North West — all levels welcome. Find a class and book online in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: DESCRIPTION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Note: no maximumScale/userScalable — pinch-to-zoom stays enabled (WCAG 1.4.4).
  themeColor: "#db2777",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
