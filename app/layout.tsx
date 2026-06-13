import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  Geist,
  Geist_Mono,
  Newsreader,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CommandMenu } from "@/components/command-menu";
import { BeyondTheEnd } from "@/components/beyond-the-end";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageEffects } from "@/components/page-effects";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
});

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "600"],
  // Only ~1 in 4 visits renders Urdu; the browser fetches this lazily.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ammar hassan — software engineer",
  description:
    "Software engineer in Lahore building for the web — multiplayer games, campus tools, and a few things with AI inside.",
  openGraph: {
    title: "ammar hassan — software engineer",
    description:
      "Software engineer in Lahore building for the web — multiplayer games, campus tools, and a few things with AI inside.",
    url: "/",
    siteName: "ammar hassan",
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ammar hassan — software engineer",
    description:
      "Software engineer in Lahore building for the web — multiplayer games, campus tools, and a few things with AI inside.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${nastaliq.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          value={{ dark: "dark", light: "light" }}
        >
          <SmoothScroll>
            <Nav />
            <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-3xl px-6 pt-36">
              {children}
            </main>
            <Footer />
            <BeyondTheEnd />
          </SmoothScroll>
          <CommandMenu />
          <PageEffects />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
