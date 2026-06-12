import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CommandMenu } from "@/components/command-menu";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageEffects } from "@/components/page-effects";
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

export const metadata: Metadata = {
  title: "ammar hassan — software engineer",
  description:
    "Software engineer in Lahore building realtime web products — multiplayer games, live dashboards, and things with AI inside.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}
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
          </SmoothScroll>
          <CommandMenu />
          <PageEffects />
        </ThemeProvider>
      </body>
    </html>
  );
}
