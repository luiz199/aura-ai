"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/context/AppContext"
import LoadingScreen from "@/components/LoadingScreen"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function Home() {
  const router = useRouter()
  const { user, loading, login, t } = useApp()
  const [showLoading, setShowLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (user) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error("Preencha todos os campos"); return }
    setIsLoading(true)
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err?.message || "Email ou senha incorretos")
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

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-neon pl-10" placeholder="seu@email.com" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-neon pl-10 pr-10" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="btn-neon w-full py-3.5 mt-2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            ) : (
              <><ArrowRight className="w-4 h-4" /> Entrar</>
            )}
          </button>
          <Link href="/auth/esqueci-senha" className="block text-center text-xs text-white/30 hover:text-neon-cyan/70 transition-colors mt-2">
            {t?.auth?.esqueciSenha || "Esqueci a senha?"}
          </Link>
        </form>
      </motion.div>
    </div>
  )
}
