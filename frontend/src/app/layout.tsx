import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.css";
import Navbar from "@/components/navbar/navbar";

const factionsFont = localFont({ src: './retrogaming.ttf' });

export const metadata: Metadata = {
  title: "Factions Companion",
  description: "Companion app for Factions stats and helper programs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${factionsFont.className} sans-serif`}
      >
        {children}
        <Navbar />
      </body>
    </html>
  );
}
