import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { SiteNav } from "@/components/SiteNav";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Art Detective — MoMA Quest",
  description: "Your personalized AI-powered museum adventure at MoMA",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Art Detective" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className={`${dmSans.className} bg-zinc-50 antialiased`}>
        <GameProvider>
          <main className="max-w-md mx-auto min-h-screen bg-white">
            <div className="pb-20">{children}</div>
            <SiteNav />
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
