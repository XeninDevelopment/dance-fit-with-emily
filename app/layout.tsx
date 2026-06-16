import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/config";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: `Book onto dance classes with ${SITE_NAME}.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Note: no maximumScale/userScalable — pinch-to-zoom stays enabled (WCAG 1.4.4).
  themeColor: "#9333ea",
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
