import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

const SITE_URL = "https://www.therpiproject.com";
const TITLE = "Jose Roberts — Data & AI Architect";
const DESCRIPTION =
  "Data & AI Architect with 15+ years building data platforms and production AI systems across finance, consumer services, and industrial IoT. Databricks Certified Data Engineer Professional with deep AWS, Python, and Spark experience.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Jose Roberts",
    "Data & AI Architect",
    "Databricks",
    "AWS",
    "Machine Learning",
    "LLMs",
    "AI Agents",
    "Data Engineering",
  ],
  authors: [{ name: "Jose Roberts" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Jose Roberts — Portfolio",
    images: [{ url: "/profile-photo.jpg", width: 800, height: 1200, alt: "Jose Roberts" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/profile-photo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-gray-100">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
