import type { Metadata } from "next";
import {  Source_Sans_3,Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeProvider } from "./theme-provider";
import { cn } from "@/lib/utils";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight:"variable",
  display: "swap"
});

const sourceMono = Source_Code_Pro({
  subsets: ["latin"],
    weight:"variable",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AITOS",
  description: "Blockchain Intelligence, Simplified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSans.className}  antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full ">
              <div className="bg-background -mb-6">
              <SidebarTrigger className="text-primary bg-background hover:bg-background ml-4"/>
              </div>
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
