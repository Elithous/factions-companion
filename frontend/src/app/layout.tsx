import "./globals.scss";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Suspense } from "react";
import localFont from 'next/font/local';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import Navbar from "@/components/navbar/navbar";

import type { Metadata } from "next";

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
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body id="mainbody"
        className={`${factionsFont.className} sans-serif`}>
        <MantineProvider>
          <Suspense>
            {children}
            <Navbar />
          </Suspense>
        </MantineProvider>
      </body>
    </html>
  );
}
