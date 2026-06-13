"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Settings, Moon, Sun, Globe, Bell, Shield, Palette, Monitor,
  Smartphone, Languages, User, Save, Sparkles, ChevronRight,
} from "lucide-react"

const themes = [
  { name: "Dark Aura", icon: Moon, active: true, gradient: "from-neon-cyan to-neon-purple" },
  { name: "Light Crystal", icon: Sun, active: false, gradient: "from-amber-400 to-rose-400" },
  { name: "Matrix", icon: Monitor, active: false, gradient: "from-neon-green to-emerald-400" },
  { name: "Royal", icon: Smartphone, active: false, gradient: "from-neon-purple to-pink-400" },
]

const languages = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export default function ConfiguracoesPage() {
  const [selectedLang, setSelectedLang] = useState("pt-BR")
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">Configurações</h1>
        <p className="text-sm text-white/30 mt-1">Personalize sua experiência com a AURA</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/[0.06]">
            <User className="w-7 h-7 text-neon-cyan/60" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-white/80">Usuário Premium</p>
            <p className="text-xs text-white/30">usuario@email.com</p>
          </div>
          <button className="btn-neon text-xs px-4 py-2">
            <Save className="w-3 h-3" /> Editar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-white/30 uppercase tracking-wider font-mono block mb-1.5">Nome</label>
            <input type="text" defaultValue="Usuário Premium" className="input-neon text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-white/30 uppercase tracking-wider font-mono block mb-1.5">Email</label>
            <input type="email" defaultValue="usuario@email.com" className="input-neon text-sm" />
          </div>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-neon-cyan/60" />
          <h3 className="text-sm font-semibold text-white/70">Tema Visual</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themes.map((theme) => (
            <button key={theme.name} className={cn(
              "relative p-4 rounded-xl border transition-all text-left",
              theme.active
                ? "border-neon-cyan/30 bg-neon-cyan/[0.04]"
                : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]",
            )}>
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br mb-2 flex items-center justify-center", theme.gradient)}>
                <theme.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-white/60">{theme.name}</p>
              {theme.active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-cyan glow-dot" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Languages className="w-4 h-4 text-neon-cyan/60" />
          <h3 className="text-sm font-semibold text-white/70">Idioma</h3>
        </div>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                selectedLang === lang.code ? "bg-neon-cyan/[0.04] border border-neon-cyan/20" : "hover:bg-white/[0.02] border border-transparent",
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm text-white/60 flex-1 text-left">{lang.name}</span>
              {selectedLang === lang.code && <ChevronRight className="w-4 h-4 text-neon-cyan" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-neon-cyan/60" />
          <h3 className="text-sm font-semibold text-white/70">Preferências</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Notificações", desc: "Receber alertas de atividades", icon: Bell, enabled: notifications, set: setNotifications },
            { label: "Som", desc: "Efeitos sonoros da interface", icon: Monitor, enabled: soundEnabled, set: setSoundEnabled },
            { label: "Auto-save", desc: "Salvar conversas automaticamente", icon: Save, enabled: autoSave, set: setAutoSave },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-sm text-white/70">{item.label}</p>
                  <p className="text-xs text-white/20">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => item.set(!item.enabled)}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300",
                  item.enabled ? "bg-neon-cyan/30" : "bg-white/[0.06]",
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-lg",
                  item.enabled ? "left-5 bg-neon-cyan" : "left-0.5",
                )} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button className="btn-neon w-full sm:w-auto">
          <Sparkles className="w-4 h-4" /> Salvar Configurações
        </button>
      </motion.div>
    </div>
  )
}
