"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import {
  LayoutDashboard, MessageSquareText,
  BarChart3, Settings, ChevronLeft, PanelRightOpen, Sparkles,
  Bot, Globe, FileText, Mic, LogOut, Shield, Apple,
} from "lucide-react"

const LINKS = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/dashboard/chat", icon: MessageSquareText, key: "chat" },
  { href: "/dashboard/pdf", icon: FileText, key: "pdf" },
  { href: "/dashboard/estatisticas", icon: BarChart3, key: "estatisticas" },
  { href: "/dashboard/merenda", icon: Apple, key: "merenda", alerta: true },
  { href: "/dashboard/admin", icon: Shield, key: "admin" },
  { href: "/dashboard/configuracoes", icon: Settings, key: "configuracoes" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { t, user, logout } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("aura_token")
        if (!token) return
        const res = await fetch("/api/merenda/alertas", { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setAlertCount(data.vencidos + data.venceHoje)
        }
      } catch {}
    })()
  }, [])

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass p-3 rounded-xl min-h-[48px] min-w-[48px] flex items-center justify-center"
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
      >
        <PanelRightOpen className="w-5 h-5 text-white/70" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed lg:static z-40 h-screen flex flex-col border-r border-white/[0.04] bg-dark-900/95 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        layout
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 px-4 border-b border-white/[0.04]", collapsed && "justify-center px-2")}>
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 animate-pulse-neon" />
            <div className="absolute inset-0.5 rounded-lg bg-dark-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
            </div>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="ml-3 text-sm font-bold text-gradient tracking-wide"
            >
              {t?.app?.name || "AURA"}
            </motion.span>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 rounded-full glass items-center justify-center text-white/30 hover:text-white/60 transition-colors z-10"
          aria-label={collapsed ? "Expandir" : "Recolher"}
        >
          <ChevronLeft className={cn("w-3 h-3 transition-transform", collapsed && "rotate-180")} />
        </button>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-custom">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative min-h-[44px]",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-white/[0.04] text-white"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]",
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl border border-white/[0.06]"
                      style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04), rgba(123,97,255,0.04))" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <link.icon className={cn("w-[18px] h-[18px]", isActive ? "text-neon-cyan" : "")} />
                    {link.alerta && alertCount > 0 && (
                      <span className={cn(
                        "absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-2 border-dark-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white",
                        collapsed ? "" : "",
                      )}>
                        {alertCount > 9 ? "9+" : alertCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && <span className="text-sm relative z-10">{t?.nav?.[link.key as keyof typeof t.nav] || link.key}</span>}
                  {isActive && !collapsed && (
                    <div className="w-1 h-1 rounded-full bg-neon-cyan ml-auto relative z-10 glow-dot" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4">
          <button onClick={logout}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/20 hover:text-neon-pink hover:bg-white/[0.02] w-full min-h-[44px]",
              collapsed && "justify-center px-0",
            )}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
