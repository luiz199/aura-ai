"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  TrendingUp, Users, MessageSquareText, Clock, Zap, Target,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"

const stats = [
  { label: "Total de Interações", value: "12,847", change: "+18.2%", icon: MessageSquareText, up: true },
  { label: "Usuários Únicos", value: "4,291", change: "+12.5%", icon: Users, up: true },
  { label: "Taxa de Sucesso", value: "97.3%", change: "+2.1%", icon: Target, up: true },
  { label: "Tempo Médio", value: "4.2min", change: "-0.8%", icon: Clock, up: false },
]

const weeklyData = [
  { name: "Seg", conversas: 180, usuarios: 120, satisfacao: 95 },
  { name: "Ter", conversas: 220, usuarios: 150, satisfacao: 92 },
  { name: "Qua", conversas: 190, usuarios: 130, satisfacao: 96 },
  { name: "Qui", conversas: 260, usuarios: 170, satisfacao: 94 },
  { name: "Sex", conversas: 240, usuarios: 160, satisfacao: 93 },
  { name: "Sáb", conversas: 150, usuarios: 90, satisfacao: 97 },
  { name: "Dom", conversas: 170, usuarios: 100, satisfacao: 95 },
]

const categoryData = [
  { name: "Chat", value: 45 }, { name: "Código", value: 20 },
  { name: "Tradução", value: 15 }, { name: "Resumo", value: 12 },
  { name: "Voz", value: 8 },
]

const COLORS = ["#00E5FF", "#7B61FF", "#00FFA3", "#FF3D71", "#FFB800"]

export default function EstatisticasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">Estatísticas</h1>
        <p className="text-sm text-white/30 mt-1">Métricas detalhadas de uso da plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-white/[0.03]">
                <stat.icon className="w-4 h-4 text-white/50" />
              </div>
              <span className={cn("text-[11px] font-mono flex items-center gap-0.5", stat.up ? "text-neon-green" : "text-neon-pink")}>
                {stat.change} {stat.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              </span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs text-white/30 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white/80">Desempenho Semanal</h3>
            <Activity className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(10,11,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="conversas" stroke="#00E5FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="usuarios" stroke="#7B61FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="satisfacao" stroke="#00FFA3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white/80">Categorias</h3>
            <TrendingUp className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-64 sm:h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(10,11,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-white/40">{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-white/80">Distribuição por Hora</h3>
          <Zap className="w-4 h-4 text-white/20" />
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { hora: "00h", valor: 20 }, { hora: "04h", valor: 10 }, { hora: "08h", valor: 80 },
              { hora: "10h", valor: 150 }, { hora: "12h", valor: 120 }, { hora: "14h", valor: 170 },
              { hora: "16h", valor: 190 }, { hora: "18h", valor: 140 }, { hora: "20h", valor: 100 },
              { hora: "22h", valor: 50 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="hora" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(10,11,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="valor" fill="#7B61FF" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
