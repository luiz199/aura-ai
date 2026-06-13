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

const BLOBS = [
  { size: 300, color: "rgba(0,229,255,0.08)", x: "10%", y: "20%", delay: 0 },
  { size: 250, color: "rgba(123,97,255,0.06)", x: "80%", y: "10%", delay: 2 },
  { size: 200, color: "rgba(0,255,163,0.05)", x: "70%", y: "70%", delay: 4 },
  { size: 180, color: "rgba(255,61,113,0.04)", x: "20%", y: "80%", delay: 1 },
]

const SHAPES = [
  { type: "circle", size: 60, x: "15%", y: "25%", color: "border-neon-cyan/20", delay: 0 },
  { type: "square", size: 40, x: "75%", y: "60%", color: "border-neon-purple/20", delay: 1.5 },
  { type: "circle", size: 30, x: "60%", y: "20%", color: "border-neon-green/20", delay: 3 },
  { type: "square", size: 50, x: "25%", y: "70%", color: "border-neon-pink/20", delay: 2 },
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
    { fill: "bg-red-500", label: "Fraca" },
    { fill: "bg-orange-500", label: "Media" },
    { fill: "bg-yellow-500", label: "Boa" },
    { fill: "bg-lime-500", label: "Forte" },
    { fill: "bg-green-500", label: "Excelente" },
  ]
  if (!password) return null
  const idx = Math.min(score - 1, 4)
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
      <div className="flex gap-1 mt-2">
        {bars.map((b, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= idx ? b.fill : "bg-white/[0.06]"}`} />
        ))}
      </div>
      <p className="text-[10px] text-white/30 font-mono mt-1">{bars[idx].label}</p>
    </motion.div>
  )
}

function FloatingInput({ icon: Icon, label, value, onChange, type, placeholder, onFocus, onBlur }: {
  icon: any; label: string; value: string; type?: string; placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = String(value || "").length > 0
  return (
    <div>
      <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-cyan transition-colors duration-300" />
        <input
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          onFocus={(e) => { setFocused(true); onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); onBlur?.(e) }}
          className="input-neon pl-10 transition-all duration-300 focus:border-neon-cyan/40 focus:shadow-[0_0_20px_rgba(0,229,255,0.08)]"
        />
        {type !== "date" && (
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: focused || hasValue ? 1 : 0 }}
            className="absolute bottom-0 left-10 right-3 h-[1px] bg-gradient-to-r from-neon-cyan to-neon-purple origin-left"
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
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
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-900 overflow-hidden relative">
      <div className="noise-bg fixed inset-0 z-0" />

      {BLOBS.map((b, i) => (
        <div key={i}
          className="absolute rounded-full animate-blob pointer-events-none"
          style={{
            width: b.size, height: b.size,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            left: b.x, top: b.y,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {SHAPES.map((s, i) => (
        <motion.div key={i}
          className={`absolute pointer-events-none border ${s.color} backdrop-blur-xl`}
          style={{
            width: s.size, height: s.size,
            left: s.x, top: s.y,
            borderRadius: s.type === "circle" ? "50%" : "20%",
            background: "rgba(255,255,255,0.02)",
          }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/[0.06] relative group"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="w-8 h-8 text-neon-cyan relative z-10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gradient tracking-tight"
          >
            AURA AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/30 mt-1"
          >
            {t?.app?.subtitle || "Intelig\u00eancia Artificial Premium"}
          </motion.p>
        </div>

        <div className="glass-card p-1 rounded-xl flex mb-4 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 opacity-50" />
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setShowPassword(false); setShowRegPassword(false) }}
              className="flex-1 text-xs py-2.5 rounded-lg font-medium transition-all duration-300 relative z-10"
            >
              {tab === t && (
                <motion.div layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-cyan/15 to-neon-purple/15 border border-neon-cyan/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${tab === t ? "text-neon-cyan" : "text-white/30 hover:text-white/50"}`}>
                {t === "login" ? "Entrar" : "Criar Conta"}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onSubmit={handleLogin}
              className="glass-card p-6 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
              <FloatingInput icon={Mail} label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider">Senha</label>
                  <Link href="/auth/esqueci-senha" className="text-[10px] text-white/20 hover:text-neon-cyan/70 transition-colors">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-cyan transition-colors duration-300" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-neon pl-10 pr-10 transition-all duration-300 focus:border-neon-cyan/40 focus:shadow-[0_0_20px_rgba(0,229,255,0.08)]" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <button type="button" onClick={() => setRemember(!remember)}
                    className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                      remember ? "bg-neon-cyan border-neon-cyan shadow-[0_0_10px_rgba(0,229,255,0.3)]" : "border-white/20 group-hover:border-white/40"
                    }`}>
                    {remember && <Check className="w-3 h-3 text-dark-900" />}
                  </button>
                  <span className="text-[11px] text-white/30 group-hover:text-white/50 transition-colors">Lembrar de mim</span>
                </label>
              </div>
              <button type="submit" disabled={isLoading}
                className="btn-neon w-full py-3.5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Entrar no AURA</>
                )}
              </button>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.04]" /></div>
                <div className="relative flex justify-center"><span className="text-[10px] text-white/15 bg-dark-900 px-3">ou continue com</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Code2, label: "GitHub" },
                  { icon: Globe, label: "Google" },
                ].map((s) => (
                  <button key={s.label} type="button"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-white/70 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200 text-xs group">
                    <s.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onSubmit={handleRegister}
              className="glass-card p-6 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
              <FloatingInput icon={User} label="Nome" type="text" value={regNome} onChange={(e) => setRegNome(e.target.value)} placeholder="Seu nome" />
              <FloatingInput icon={Mail} label="Email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="seu@email.com" />
              <div>
                <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1.5">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-cyan transition-colors duration-300" />
                  <input type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="input-neon pl-10 pr-10 transition-all duration-300 focus:border-neon-cyan/40 focus:shadow-[0_0_20px_rgba(0,229,255,0.08)]" placeholder="Min. 6 caracteres" />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={regPassword} />
              </div>
              <div>
                <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1.5">Confirmar</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-cyan transition-colors duration-300" />
                  <input type={showRegPassword ? "text" : "password"} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    className="input-neon pl-10 transition-all duration-300 focus:border-neon-cyan/40 focus:shadow-[0_0_20px_rgba(0,229,255,0.08)]" placeholder="Repita a senha" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="btn-neon w-full py-3.5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Sparkles className="w-4 h-4" /> Criar Conta</>
                )}
              </button>
              <p className="text-[10px] text-white/20 text-center">
                Ao criar uma conta, voce aceita nossos <span className="text-white/30 hover:text-neon-cyan/70 cursor-pointer transition-colors">Termos de Uso</span>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-white/10 mt-6 font-mono"
        >
          AURA AI v1.0 &mdash; Todos os direitos reservados
        </motion.p>
      </motion.div>
    </div>
  )
}
