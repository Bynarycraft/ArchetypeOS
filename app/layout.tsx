import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ArchetypeOS",
  description: "Internal Talent Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${fraunces.variable} font-sans antialiased transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
