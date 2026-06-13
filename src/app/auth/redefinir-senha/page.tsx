"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { Lock, Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useApp()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = searchParams.get("token")
    if (t) setToken(t)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) { toast.error("Preencha todos os campos"); return }
    if (password.length < 6) { toast.error("Senha deve ter pelo menos 6 caracteres"); return }
    if (password !== confirmPassword) { toast.error("Senhas n\u00e3o conferem"); return }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        toast.success("Senha redefinida com sucesso!")
      } else {
        toast.error(data.error || "Erro ao redefinir senha")
      }
    } catch {
      toast.error("Erro ao redefinir senha")
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

        {!token ? (
          <div className="glass-card p-6 text-center">
            <p className="text-white/50 text-sm">{t?.auth?.linkInvalido || "Link inv\u00e1lido ou expirado. Solicite um novo link de recupera\u00e7\u00e3o."}</p>
            <Link href="/auth/esqueci-senha" className="inline-flex items-center gap-2 text-xs text-neon-cyan hover:text-neon-cyan/70 transition-colors mt-4">
              <ArrowLeft className="w-3 h-3" /> {t?.auth?.solicitarNovoLink || "Solicitar novo link"}
            </Link>
          </div>
        ) : done ? (
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-neon-green/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-neon-green" />
            </div>
            <p className="text-white/70 text-sm">{t?.auth?.senhaRedefinida || "Senha redefinida com sucesso!"}</p>
            <Link href="/" className="btn-neon inline-flex items-center gap-2 text-xs px-6 py-3">
              {t?.auth?.fazerLogin || "Fazer login"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <div>
              <label htmlFor="password" className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">{t?.auth?.novaSenha || "Nova Senha"}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-neon pl-10 pr-10" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">{t?.auth?.confirmarSenha || "Confirmar Senha"}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-neon pl-10" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="btn-neon w-full py-3.5 mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
              ) : (
                t?.auth?.redefinirSenha || "Redefinir Senha"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ResetForm />
    </Suspense>
  )
}
