import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afferens — The Sensory Layer for AI Agents",
  description: "Give your AI agents real-world perception. One API. Six senses. Built for developers.",
  openGraph: {
    title: "Afferens — The Sensory Layer for AI Agents",
    description: "Give your AI agents real-world perception. One API. Six senses. Built for developers.",
    url: "https://afferens.com",
    siteName: "Afferens",
    images: [
      {
        url: "https://afferens.com/afferens-logo.png",
        width: 1320,
        height: 880,
        alt: "Afferens",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afferens — The Sensory Layer for AI Agents",
    description: "Give your AI agents real-world perception. One API. Six senses. Built for developers.",
    images: ["https://afferens.com/afferens-logo.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
