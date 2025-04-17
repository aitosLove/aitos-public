import type { Metadata } from "next";
import { Source_Sans_3, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeProvider } from "./theme-provider";
import { cn } from "@/lib/utils";
import Head from "next/head";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const sourceMono = Source_Code_Pro({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASOL",
  description: "Automated Solana Trading & Alpha Seeking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.className}  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Head>
            <title>SolanaAgent | Automated Trading & Alpha Seeking</title>
            <meta
              name="description"
              content="Launch intelligent agents that automatically trade and seek alpha opportunities across the Solana ecosystem"
            />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicon-16x16.png"
            />
            <link rel="manifest" href="/site.webmanifest" />
          </Head>
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full ">
              <div className="bg-background -mb-6">
                <SidebarTrigger className="text-primary bg-background hover:bg-background ml-4" />
              </div>
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
