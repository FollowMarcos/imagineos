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

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import BottomMenu from "@/components/bottom-menu"
import { createClient } from "@/utils/supabase/server"
import { CreativeProvider } from "@/context/creative-context"
import { CustomThemeProvider } from "@/context/custom-theme-context"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${figtree.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CustomThemeProvider>
            <CreativeProvider>
              {children}
              {user && <BottomMenu />}
              <Toaster />
            </CreativeProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
