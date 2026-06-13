"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, Server } from "lucide-react"
import toast from "react-hot-toast"
import { useApp } from "@/context/AppContext"

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, loading } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && user?.tipo === "admin") router.push("/dashboard/admin")
  }, [user, loading, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  if (user) {
    if (user.tipo !== "admin") {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
          <div className="bg-dark-800/80 backdrop-blur-xl p-6 sm:p-8 max-w-sm w-full text-center rounded-2xl border border-white/[0.06]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">Sua conta não tem permissão de administrador.</p>
          </div>
        </div>
      )
    }
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error("Preencha todos os campos"); return }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      localStorage.setItem("aura_token", data.token)
      window.location.href = "/dashboard/admin"
    } catch { toast.error("Erro ao conectar") }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-dark-900 overflow-hidden relative">
      <div className="noise-bg fixed inset-0 z-0" />

      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-dark-800/50">
        <div className="relative z-10 max-w-md">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="w-14 h-14 mb-6 rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center">
              <Server className="w-7 h-7 text-white/40" />
            </div>
            <h2 className="text-2xl font-semibold text-white/90 tracking-tight leading-tight">
              Painel de<br />Administração
            </h2>
            <p className="text-sm text-white/30 mt-3 leading-relaxed max-w-sm">
              Gerencie usuários, monitore o sistema e configure as permissões da plataforma AURA AI.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { label: "Usuários", desc: "Cadastro e permissões" },
                { label: "Métricas", desc: "Estatísticas do sistema" },
                { label: "Segurança", desc: "Logs e auditoria" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="text-white/40">{item.label}</span>
                  <span className="text-white/20 text-xs">— {item.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-transparent to-dark-800/50 lg:hidden" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 mx-auto mb-3 rounded-xl bg-dark-800 border border-white/[0.06] flex items-center justify-center">
              <Server className="w-6 h-6 text-white/40" />
            </motion.div>
            <h1 className="text-lg font-semibold text-white/80 tracking-tight">Painel Admin</h1>
            <p className="text-xs text-white/30 mt-0.5">Acesso restrito</p>
          </div>

          <form onSubmit={handleLogin} className="bg-dark-800/40 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-white/[0.06] space-y-5">
            <div className="hidden lg:block mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white/70">Administrador</h2>
                  <p className="text-[11px] text-white/30">Autenticação necessária</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Email</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" inputMode="email"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]"
                  placeholder="admin@email.com" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/40 transition-colors p-1"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 font-medium transition-all duration-200 hover:bg-white/[0.09] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ArrowRight className="w-4 h-4" /> Entrar</>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-white/[0.07] mt-6 font-mono tracking-wider uppercase">
            AURA AI &mdash; Administração
          </p>
        </motion.div>
      </div>
    </div>
  )
}
