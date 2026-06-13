import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { PWARegister } from "@/components/PWARegister"

export const metadata: Metadata = {
  title: "AURA AI - Intelig\u00eancia Artificial Premium",
  description: "Assistente virtual de \u00faltima gera\u00e7\u00e3o com IA avan\u00e7ada",
  applicationName: "AURA AI",
  appleWebApp: {
    capable: true,
    title: "AURA AI",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "AURA AI - Intelig\u00eancia Artificial Premium",
    description: "Assistente virtual de \u00faltima gera\u00e7\u00e3o com IA avan\u00e7ada",
    type: "website",
    siteName: "AURA AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURA AI",
    description: "Assistente virtual de \u00faltima gera\u00e7\u00e3o com IA avan\u00e7ada",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192" },
      { url: "/icons/icon-512.png", sizes: "512x512" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AURA AI" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512.png" />
      </head>
      <body className="bg-dark-900 text-white antialiased noise-bg min-h-screen overflow-x-hidden scrollbar-custom transition-colors duration-300">
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  )
}
