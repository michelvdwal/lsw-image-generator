import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LSW image generator",
  description: "Generate Leaseweb images with custom text, theme, and size",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-base font-normal leading-normal text-zinc-900">
        {children}
      </body>
    </html>
  );
}
