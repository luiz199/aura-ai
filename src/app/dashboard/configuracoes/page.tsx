"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import {
  Settings, Moon, Sun, Monitor, Smartphone,
  Globe, Bell, Palette, User, Save, Sparkles, ChevronRight, Volume2, HardDrive,
} from "lucide-react"
import toast from "react-hot-toast"

const themes = [
  { name: "Dark Aura", icon: Moon, key: "dark" as const, gradient: "from-neon-cyan to-neon-purple" },
  { name: "Light Crystal", icon: Sun, key: "light" as const, gradient: "from-amber-400 to-rose-400" },
  { name: "Matrix", icon: Monitor, key: "matrix" as const, gradient: "from-neon-green to-emerald-400" },
  { name: "Royal", icon: Smartphone, key: "royal" as const, gradient: "from-neon-purple to-pink-400" },
]

const languages = [
  { code: "pt-BR", name: "Portugu\u00eas (Brasil)", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "en-US", name: "English (US)", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "es", name: "Espa\u00f1ol", flag: "\ud83c\uddea\ud83c\uddf8" },
]

export default function ConfiguracoesPage() {
  const { user, theme, locale, setTheme, setLocale, updatePreferences, t } = useApp()
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState(user?.nome || "")

  const handleSave = async () => {
    setSaving(true)
    try {
      if (nome && nome !== user?.nome) {
        const token = localStorage.getItem("aura_token")
        await fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome }),
        })
      }
      toast.success("Configura\u00e7\u00f5es salvas!")
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">{t?.settings?.title || "Configura\u00e7\u00f5es"}</h1>
        <p className="text-sm text-white/30 mt-1">{t?.settings?.subtitle || "Personalize sua experi\u00eancia com a AURA"}</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/[0.06]">
            <User className="w-7 h-7 text-neon-cyan/60" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-white/80">{user?.nome || "Usu\u00e1rio"}</p>
            <p className="text-xs text-white/30">{user?.email}</p>
          </div>
        </div>
        <div>
          <label className="text-[11px] text-white/30 uppercase tracking-wider font-mono block mb-1.5">{t?.settings?.profile || "Perfil"}</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
            className="input-neon text-sm" placeholder="Seu nome" />
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-neon-cyan/60" />
          <h3 className="text-sm font-semibold text-white/70">{t?.settings?.theme || "Tema Visual"}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themes.map((th) => (
            <button key={th.key} onClick={() => setTheme(th.key)}
              className={cn(
                "relative p-4 rounded-xl border transition-all text-left",
                theme === th.key
                  ? "border-neon-cyan/30 bg-neon-cyan/[0.04]"
                  : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]",
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br mb-2 flex items-center justify-center", th.gradient)}>
                <th.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-white/60">{th.name}</p>
              {theme === th.key && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-cyan glow-dot" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-neon-cyan/60" />
          <h3 className="text-sm font-semibold text-white/70">{t?.settings?.language || "Idioma"}</h3>
        </div>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => setLocale(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                locale === lang.code ? "bg-neon-cyan/[0.04] border border-neon-cyan/20" : "hover:bg-white/[0.02] border border-transparent",
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm text-white/60 flex-1 text-left">{lang.name}</span>
              {locale === lang.code && <ChevronRight className="w-4 h-4 text-neon-cyan" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-neon-cyan/60" />
          <h3 className="text-sm font-semibold text-white/70">{t?.settings?.preferences || "Prefer\u00eancias"}</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: t?.settings?.notifications || "Notifica\u00e7\u00f5es", desc: "Receber alertas de atividades", icon: Bell, key: "notifications" },
            { label: t?.settings?.sound || "Som", desc: "Efeitos sonoros da interface", icon: Volume2, key: "sound" },
            { label: t?.settings?.autosave || "Auto-save", desc: "Salvar conversas automaticamente", icon: HardDrive, key: "autosave" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-sm text-white/70">{item.label}</p>
                  <p className="text-xs text-white/20">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newVal = !(user?.preferences as any)?.[item.key]
                  updatePreferences({ ...user?.preferences, [item.key]: newVal })
                }}
                className={cn(
                  "relative w-12 h-7 rounded-full transition-all duration-300 flex items-center px-0.5",
                  (user?.preferences as any)?.[item.key] ? "bg-neon-cyan/30" : "bg-white/[0.06]",
                )}
                aria-label={item.label}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-lg",
                  (user?.preferences as any)?.[item.key] ? "translate-x-5 bg-neon-cyan" : "translate-x-0",
                )} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button onClick={handleSave} disabled={saving} className="btn-neon w-full sm:w-auto">
          {saving ? (
            <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Sparkles className="w-4 h-4" /> {t?.settings?.save || "Salvar Configura\u00e7\u00f5es"}</>
          )}
        </button>
      </motion.div>
    </div>
  )
}
