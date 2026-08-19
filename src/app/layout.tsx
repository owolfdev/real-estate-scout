import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#17181b" },
  ],
};

export const metadata: Metadata = {
  title: "Scout",
  description: "Catalog Thai properties for acquisition, rental, and flips.",
  applicationName: "Scout",
  appleWebApp: {
    capable: true,
    title: "Scout",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col font-mono antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="scout-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
