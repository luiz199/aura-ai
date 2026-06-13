"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton"
import { CountUp } from "@/components/ui/CountUp"
import {
  MessageSquareText, Users, FileText, Clock, TrendingUp, Activity,
  Bot, Sparkles, ArrowUpRight,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"

const chartData = [
  { name: "Seg", conversas: 180, usuarios: 120, ia: 90 },
  { name: "Ter", conversas: 220, usuarios: 150, ia: 110 },
  { name: "Qua", conversas: 190, usuarios: 130, ia: 95 },
  { name: "Qui", conversas: 260, usuarios: 170, ia: 130 },
  { name: "Sex", conversas: 240, usuarios: 160, ia: 120 },
  { name: "S\u00e1b", conversas: 150, usuarios: 90, ia: 70 },
  { name: "Dom", conversas: 170, usuarios: 100, ia: 80 },
]

export default function DashboardPage() {
  const { t } = useApp()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("aura_token")
        const res = await fetch("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setData(await res.json())
      } catch {} finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = [
    { label: t?.dashboard?.hoje || "Conversas Hoje", value: data?.conversasHoje ?? "1,247", icon: MessageSquareText, color: "from-neon-cyan/20 to-transparent", border: "border-neon-cyan/20" },
    { label: t?.dashboard?.ativos || "Usu\u00e1rios Ativos", value: data?.totalUsers ?? "3,891", icon: Users, color: "from-neon-purple/20 to-transparent", border: "border-neon-purple/20" },
    { label: t?.dashboard?.documentos || "Documentos", value: data?.totalDocumentos ?? "892", icon: FileText, color: "from-neon-green/20 to-transparent", border: "border-neon-green/20" },
    { label: t?.dashboard?.tempo || "Tempo M\u00e9dio", value: data?.tempoMedio ?? "4.2min", icon: Clock, color: "from-neon-cyan/20 to-transparent", border: "border-neon-cyan/20" },
  ]

  const recentActivity = data?.recentes || [
    { acao: "Chat conclu\u00eddo", detalhe: "An\u00e1lise de documento financeiro", tempo: "2 min atr\u00e1s" },
    { acao: "Tradu\u00e7\u00e3o realizada", detalhe: "Portugu\u00eas \u2192 Ingl\u00eas", tempo: "15 min atr\u00e1s" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-bold text-gradient tracking-tight">
          {t?.dashboard?.title || "Dashboard"}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm text-white/30 mt-1">
          {t?.dashboard?.subtitle || "Vis\u00e3o geral do seu assistente inteligente"}
        </motion.p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={cn("glass-card p-4 sm:p-5 border-l-2", stat.border)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-xl bg-gradient-to-br", stat.color)}>
                  <stat.icon className="w-4 h-4 text-white/70" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {typeof stat.value === "number" ? <CountUp end={stat.value} /> : stat.value}
              </p>
              <p className="text-xs text-white/30 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white/80">{t?.dashboard?.semanal || "Atividade Semanal"}</h3>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-white/40"><span className="w-2 h-2 rounded-full bg-neon-cyan" /> Conversas</span>
              <span className="flex items-center gap-1.5 text-white/40"><span className="w-2 h-2 rounded-full bg-neon-purple" /> IA</span>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(10,11,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="conversas" stroke="#00E5FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ia" stroke="#7B61FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white/80">{t?.dashboard?.usuariosDia || "Usu\u00e1rios por Dia"}</h3>
            <TrendingUp className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(10,11,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="usuarios" fill="#00FFA3" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/80">{t?.dashboard?.recente || "Atividade Recente"}</h3>
            <Sparkles className="w-4 h-4 text-neon-cyan/50" />
          </div>
          <div className="space-y-2">
            {recentActivity.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass-hover transition-all">
                <div className="p-2 rounded-lg bg-white/[0.03] text-neon-cyan">
                  <MessageSquareText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{item.acao}</p>
                  <p className="text-xs text-white/30 truncate">{item.detalhe}</p>
                </div>
                <span className="text-[10px] text-white/20 font-mono flex-shrink-0">{item.tempo}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
