import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSplash } from "@/components/app-splash";
import { NavigationProgress } from "@/components/navigation-progress";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("scout-theme");var d=t==="dark"||((t==="system"||!t)&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.add(d?"dark":"light")}catch(e){}`,
          }}
        />
        <ThemeProvider defaultTheme="system" storageKey="scout-theme">
          <AppSplash />
          <NavigationProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
