import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.scss";
import Navbar from "@/components/navbar/navbar";
import { Provider } from "@/components/ui/provider"
import { Suspense } from "react";

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
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        id="mainbody"
        className={`${factionsFont.className} sans-serif`}
      >
        <Provider>
          <Suspense>
            {children}
            <Navbar />
          </Suspense>
        </Provider>
      </body>
    </html>
  );
}
