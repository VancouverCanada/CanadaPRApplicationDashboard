import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
