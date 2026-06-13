"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/context/AppContext"
import LoadingScreen from "@/components/LoadingScreen"
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User,
  Globe, Code2, Check, Sparkle,
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

const BLOBS = [
  { size: 320, color: "rgba(99,102,241,0.06)", x: "5%", y: "15%" },
  { size: 280, color: "rgba(236,72,153,0.04)", x: "80%", y: "70%" },
  { size: 200, color: "rgba(0,229,255,0.04)", x: "70%", y: "10%" },
]

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    let s = 0
    if (password.length >= 6) s++
    if (password.length >= 10) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  }, [password])
  const bars = [
    { fill: "bg-red-500/60", label: "Fraca" },
    { fill: "bg-orange-500/60", label: "Média" },
    { fill: "bg-yellow-500/60", label: "Boa" },
    { fill: "bg-lime-500/60", label: "Forte" },
    { fill: "bg-green-500/60", label: "Excelente" },
  ]
  if (!password) return null
  const idx = Math.min(score - 1, 4)
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
      <div className="flex gap-1 mt-2">
        {bars.map((b, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= idx ? b.fill : "bg-white/[0.04]"}`} />
        ))}
      </div>
      <p className="text-[10px] text-white/20 font-mono mt-1">{bars[idx].label}</p>
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter()
  const { user, loading, login, register, t } = useApp()
  const [showLoading, setShowLoading] = useState(true)
  const [tab, setTab] = useState<"login" | "register">("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [regNome, setRegNome] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")
  const [showRegPassword, setShowRegPassword] = useState(false)

  useEffect(() => {
    if (!loading && user) router.push("/dashboard")
  }, [user, loading, router])

  if (showLoading) return <LoadingScreen onComplete={() => setShowLoading(false)} />
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="w-9 h-9 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )
  if (user) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error("Preencha todos os campos"); return }
    setIsLoading(true)
    try { await login(email, password); router.push("/dashboard") }
    catch (err: any) { toast.error(err?.message || "Email ou senha incorretos") }
    finally { setIsLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNome || !regEmail || !regPassword || !regConfirm) { toast.error("Preencha todos os campos"); return }
    if (regPassword.length < 6) { toast.error("Senha deve ter pelo menos 6 caracteres"); return }
    if (regPassword !== regConfirm) { toast.error("Senhas não conferem"); return }
    setIsLoading(true)
    try { await register(regNome, regEmail, regPassword); router.push("/dashboard") }
    catch (err: any) { toast.error(err?.message || "Erro ao cadastrar") }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-dark-900 overflow-hidden relative">
      <div className="noise-bg fixed inset-0 z-0" />

      {BLOBS.map((b, i) => (
        <div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: b.size, height: b.size,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            left: b.x, top: b.y,
          }}
        />
      ))}

      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 bg-dark-800/40">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative z-10 max-w-sm">
          <div className="w-12 h-12 mb-5 rounded-xl bg-dark-700 border border-white/[0.06] flex items-center justify-center">
            <Sparkle className="w-6 h-6 text-white/30" />
          </div>
          <h2 className="text-2xl font-semibold text-white/90 tracking-tight leading-tight">
            Inteligência Artificial<br />para seu negócio
          </h2>
          <p className="text-sm text-white/30 mt-3 leading-relaxed">
            AURA AI oferece automação inteligente, análise de dados e assistência personalizada para transformar seus processos.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Chat com IA contextual",
              "Análise de documentos",
              "Gestão de merenda escolar",
              "Dashboard em tempo real",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-white/40">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm">
          <div className="text-center mb-7 lg:hidden">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-11 h-11 mx-auto mb-3 rounded-xl bg-dark-800 border border-white/[0.06] flex items-center justify-center">
              <Sparkle className="w-5 h-5 text-white/30" />
            </motion.div>
            <h1 className="text-lg font-semibold text-white/80 tracking-tight">AURA AI</h1>
            <p className="text-xs text-white/30 mt-0.5">Inteligência Artificial Premium</p>
          </div>

          <div className="bg-dark-800/30 backdrop-blur-xl p-1 rounded-xl flex mb-4 border border-white/[0.04]">
            {(["login", "register"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setShowPassword(false); setShowRegPassword(false) }}
                className="flex-1 text-xs py-2.5 min-h-[44px] rounded-lg font-medium transition-all duration-200 relative">
                {tab === t && (
                  <motion.div layoutId="tab-bg"
                    className="absolute inset-0 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-colors ${tab === t ? "text-white/70" : "text-white/20 hover:text-white/40"}`}>
                  {t === "login" ? "Entrar" : "Criar Conta"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form key="login" initial={{ opacity: 0, x: -20, scale: 0.99 }}
                animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onSubmit={handleLogin}
                className="bg-dark-800/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/[0.06] space-y-4">
                <div>
                  <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email" placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] text-white/30 font-medium tracking-wide">Senha</label>
                    <Link href="/auth/esqueci-senha" className="text-[10px] text-white/15 hover:text-white/40 transition-colors">
                      Esqueceu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/10 hover:text-white/30 transition-colors p-1">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <button type="button" onClick={() => setRemember(!remember)}
                      className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                        remember ? "bg-white/10 border-white/20" : "border-white/[0.08] group-hover:border-white/20"
                      }`}>
                      {remember && <Check className="w-3 h-3 text-white/50" />}
                    </button>
                    <span className="text-[11px] text-white/20 group-hover:text-white/30 transition-colors">Lembrar de mim</span>
                  </label>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 font-medium transition-all duration-200 hover:bg-white/[0.09] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Entrar no AURA</>
                  )}
                </button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.04]" /></div>
                  <div className="relative flex justify-center"><span className="text-[10px] text-white/10 bg-dark-900 px-3">ou continue com</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Code2, label: "GitHub" },
                    { icon: Globe, label: "Google" },
                  ].map((s) => (
                    <button key={s.label} type="button"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.06] text-white/20 hover:text-white/50 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200 text-xs group">
                      <s.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{ opacity: 0, x: 20, scale: 0.99 }}
                animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onSubmit={handleRegister}
                className="bg-dark-800/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/[0.06] space-y-4">
                <div>
                  <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input type="text" value={regNome} onChange={(e) => setRegNome(e.target.value)}
                      autoComplete="name" placeholder="Seu nome"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      autoComplete="email" placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]"
                      placeholder="Min. 6 caracteres" />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/10 hover:text-white/30 transition-colors p-1">
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={regPassword} />
                </div>
                <div>
                  <label className="text-[11px] text-white/30 font-medium tracking-wide block mb-1.5">Confirmar</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input type={showRegPassword ? "text" : "password"} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 focus:border-white/[0.15] focus:bg-white/[0.04]"
                      placeholder="Repita a senha" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 font-medium transition-all duration-200 hover:bg-white/[0.09] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Criar Conta</>
                  )}
                </button>
                <p className="text-[10px] text-white/10 text-center">
                  Ao criar uma conta, você aceita nossos <span className="text-white/20 hover:text-white/40 cursor-pointer transition-colors">Termos de Uso</span>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-[10px] text-white/[0.07] mt-6 font-mono tracking-wider uppercase">
            AURA AI v1.0
          </p>
        </motion.div>
      </div>
    </div>
  )
}
