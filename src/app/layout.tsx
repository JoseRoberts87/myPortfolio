import type { Metadata } from "next";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  title: "Portfolio | Skills Showcase",
  description: "Showcasing expertise in Web Development, Data Pipelines, Analytics, Machine Learning, and Computer Vision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-gray-100">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
