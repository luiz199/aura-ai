"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/context/AppContext"
import LoadingScreen from "@/components/LoadingScreen"
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User,
  Globe, Code2, Check,
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: 1 + Math.random() * 2, delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
}))

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
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]
  const labels = ["", "Fraca", "Media", "Boa", "Forte", "Excelente"]
  if (!password) return null
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-white/[0.06]"}`} />
        ))}
      </div>
      <p className="text-[10px] text-white/30 font-mono">{labels[score]}</p>
    </div>
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
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-900">
      <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
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
    if (regPassword !== regConfirm) { toast.error("Senhas nao conferem"); return }
    setIsLoading(true)
    try { await register(regNome, regEmail, regPassword); router.push("/dashboard") }
    catch (err: any) { toast.error(err?.message || "Erro ao cadastrar") }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 60%, rgba(123,97,255,0.04) 0%, transparent 50%)",
      }} />
      {PARTICLES.map((p) => (
        <motion.div key={p.id}
          className="absolute w-1 h-1 rounded-full bg-neon-cyan/20"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm">
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/[0.06]">
            <Sparkles className="w-8 h-8 text-neon-cyan" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient">AURA AI</h1>
          <p className="text-sm text-white/30 mt-1">{t?.app?.subtitle || "Intelig\u00eancia Artificial Premium"}</p>
        </div>

        <div className="glass-card p-1.5 rounded-xl flex mb-4">
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setShowPassword(false); setShowRegPassword(false) }}
              className={`flex-1 text-xs py-2.5 rounded-lg font-medium transition-all ${
                tab === t ? "bg-neon-cyan/10 text-neon-cyan shadow-sm" : "text-white/30 hover:text-white/50"
              }`}>
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "login" ? (
            <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
              onSubmit={handleLogin} className="glass-card p-6 space-y-4">
              <div>
                <label className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-neon pl-10" placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-neon pl-10 pr-10" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => setRemember(!remember)}
                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${remember ? "bg-neon-cyan border-neon-cyan" : "border-white/20 hover:border-white/40"}`}>
                    {remember && <Check className="w-3 h-3 text-dark-900" />}
                  </button>
                  <span className="text-[11px] text-white/30">Lembrar de mim</span>
                </label>
                <Link href="/auth/esqueci-senha" className="text-[11px] text-white/30 hover:text-neon-cyan/70 transition-colors">
                  Esqueci a senha?
                </Link>
              </div>
              <button type="submit" disabled={isLoading} className="btn-neon w-full py-3.5">
                {isLoading ? <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Entrar</>}
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                <div className="relative flex justify-center"><span className="text-[11px] text-white/20 bg-dark-900 px-3">ou continue com</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/20 transition-all text-xs">
                  <Code2 className="w-4 h-4" /> GitHub
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/20 transition-all text-xs">
                  <Globe className="w-4 h-4" /> Google
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              onSubmit={handleRegister} className="glass-card p-6 space-y-4">
              <div>
                <label className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Nome</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" value={regNome} onChange={(e) => setRegNome(e.target.value)}
                    className="input-neon pl-10" placeholder="Seu nome" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    className="input-neon pl-10" placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="input-neon pl-10 pr-10" placeholder="Min. 6 caracteres" />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={regPassword} />
              </div>
              <div>
                <label className="text-xs text-white/40 font-mono uppercase tracking-wider block mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showRegPassword ? "text" : "password"} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    className="input-neon pl-10" placeholder="Repita a senha" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-neon w-full py-3.5">
                {isLoading ? <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Criar Conta</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
