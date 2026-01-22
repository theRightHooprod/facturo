import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "facturo",
  description: "Manage and export to csv invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="h-8"></div>
        <div className="app-region-drag fixed top-0 right-0 left-0 flex h-8 flex-row items-center justify-center gap-1 border-b border-gray-400 bg-white dark:bg-[var(--background)]">
          <p>FacTURO</p>
          <p>v0.0.1</p>
        </div>
        {children}
      </body>
    </html>
  );
}
