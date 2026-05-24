import type { Metadata, Viewport } from "next";
import { ViewportStabilizer } from "@/components/app/viewport-stabilizer";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loan Tracker",
  description: "Standalone PWA for personal loan and interest tracking.",
  applicationName: "Loan Tracker",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loan Tracker",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#121922" },
    { media: "(prefers-color-scheme: light)", color: "#121922" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#121922", colorScheme: "dark" }}>
      <body style={{ backgroundColor: "#121922" }}>
        <I18nProvider>
          <ViewportStabilizer />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
