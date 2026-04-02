import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = localFont({
  src: [
    {
      path: "./fonts/InterVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "CineMatch - AI Movie Recommendations",
  description:
    "Get personalized movie recommendations powered by AI. Discover films based on your mood, taste profile, and streaming services.",
  keywords: [
    "movies",
    "recommendations",
    "AI",
    "streaming",
    "watchlist",
    "film",
  ],
  openGraph: {
    title: "CineMatch - AI Movie Recommendations",
    description:
      "Get personalized movie recommendations powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
