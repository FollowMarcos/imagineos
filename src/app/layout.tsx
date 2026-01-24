import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(34, 64%, 96%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(30, 23%, 10%)" },
  ],
};

export const metadata: Metadata = {
  title: "ImagineOS",
  description: "Create endlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${figtree.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
