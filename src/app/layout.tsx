import type { Metadata } from "next";
import { Source_Sans_3, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "House Aquemini",
  description: "A personal vinyl collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${ibmPlexMono.variable} ${playfairDisplay.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <Header />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-steel-800 !text-steel-100 !border !border-steel-700",
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
