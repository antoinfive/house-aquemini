import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
        className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
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
