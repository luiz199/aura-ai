import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"

export const metadata: Metadata = {
  title: "AURA AI - Inteligência Artificial Premium",
  description: "Assistente virtual de última geração com IA avançada",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-dark-900 text-white antialiased noise-bg min-h-screen overflow-x-hidden scrollbar-custom">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
