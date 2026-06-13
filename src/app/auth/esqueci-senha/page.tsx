"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { Mail, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const { t } = useApp()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error("Digite seu email"); return }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        if (data.resetLink) {
          toast.success(data.message)
        }
      } else {
        toast.error(data.error || "Erro ao enviar")
      }
    } catch {
      toast.error("Erro ao enviar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-900">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 60%, rgba(123,97,255,0.04) 0%, transparent 50%)",
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/[0.06]">
            <Sparkles className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">AURA AI</h1>
          <p className="text-sm text-white/30 mt-1">{t?.app?.subtitle || "Intelig\u00eancia Artificial Premium"}</p>
        </div>

        {sent ? (
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-neon-green" />
            </div>
            <p className="text-white/70 text-sm">{t?.auth?.linkEnviado || "Se o email existir, voc\u00ea receber\u00e1 o link de recupera\u00e7\u00e3o."}</p>
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-neon-cyan hover:text-neon-cyan/70 transition-colors">
              <ArrowLeft className="w-3 h-3" /> {t?.auth?.voltarLogin || "Voltar ao login"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-neon pl-10" placeholder="seu@email.com" />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="btn-neon w-full py-3.5 mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
              ) : (
                t?.auth?.enviarLink || "Enviar link de recupera\u00e7\u00e3o"
              )}
            </button>
            <Link href="/" className="flex items-center justify-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors">
              <ArrowLeft className="w-3 h-3" /> {t?.auth?.voltarLogin || "Voltar ao login"}
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  )
}
