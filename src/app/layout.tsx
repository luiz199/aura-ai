import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"

export const metadata: Metadata = {
  title: "AURA AI - Intelig\u00eancia Artificial Premium",
  description: "Assistente virtual de \u00faltima gera\u00e7\u00e3o com IA avan\u00e7ada",
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
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-dark-900 text-white antialiased noise-bg min-h-screen overflow-x-hidden scrollbar-custom transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
