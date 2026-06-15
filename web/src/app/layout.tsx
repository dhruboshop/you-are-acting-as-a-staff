import type { Metadata, Viewport } from "next";
import { RegisterServiceWorker } from "./register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoyaltyPilot",
  description: "WhatsApp-first customer growth platform for local businesses",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LoyaltyPilot",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#146c5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
