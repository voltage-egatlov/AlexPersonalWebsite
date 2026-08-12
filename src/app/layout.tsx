import type { Metadata, Viewport } from "next";
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

// viewport-fit=cover + a matching theme-color let the mobile chrome (status
// bar, home-indicator area) blend into the case-file paper instead of
// showing bare OS black/white behind the notch and gesture bar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e8f8f6",
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
