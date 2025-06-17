import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHASE - Modern Web Game",
  description: "A modern take on the classic chase game with neon aesthetics and smooth gameplay",
  keywords: "game, chase, web game, neon, modern",
  authors: [{ name: "Chase Game Studio" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}