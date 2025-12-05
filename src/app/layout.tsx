import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Canada PR Tracker",
  description: "实时同步公开 Google 表格的加拿大 PR 申请追踪面板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
