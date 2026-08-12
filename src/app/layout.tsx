import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Alexandra Nikita",
  description: "Photography portfolio of Alexandra Nikita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexMono.variable}`}>
      <body>
        <Sidebar />
        <main className="content">{children}</main>
      </body>
    </html>
  );
}
