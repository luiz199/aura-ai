"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  MessageSquareText, Bot, FileText, Mic, Globe, Code,
  Clock, ArrowUpRight, Trash2, Heart, Search,
} from "lucide-react"
import { useState } from "react"

const historyItems = [
  { icon: MessageSquareText, label: "Análise de documento financeiro", date: "Hoje, 14:32", type: "Chat", color: "text-neon-cyan" },
  { icon: Globe, label: "Tradução: Português → Inglês", date: "Hoje, 11:15", type: "Tradução", color: "text-neon-green" },
  { icon: FileText, label: "Resumo: Machine Learning", date: "Ontem, 18:45", type: "Resumo", color: "text-neon-purple" },
  { icon: Code, label: "Função QuickSort em Python", date: "Ontem, 15:20", type: "Código", color: "text-neon-cyan" },
  { icon: Mic, label: "Transcrição de áudio reunião", date: "2 dias atrás", type: "Voz", color: "text-neon-green" },
  { icon: Bot, label: "Explicação: Redes Neurais", date: "2 dias atrás", type: "IA", color: "text-neon-purple" },
  { icon: FileText, label: "Análise de contrato jurídico", date: "3 dias atrás", type: "Documento", color: "text-neon-cyan" },
  { icon: MessageSquareText, label: "Suporte técnico API REST", date: "3 dias atrás", type: "Chat", color: "text-neon-green" },
]

export default function HistoricoPage() {
  const [search, setSearch] = useState("")

  const filtered = historyItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient tracking-tight">Histórico</h1>
          <p className="text-sm text-white/30 mt-1">Todas as interações com a IA</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no histórico..."
            className="input-neon pl-10 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-card p-4 flex items-center gap-4 group"
          >
            <div className={cn("p-2.5 rounded-xl bg-white/[0.03]", item.color)}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 truncate group-hover:text-white/90 transition-colors">{item.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/20 font-mono">{item.type}</span>
                <span className="text-white/10">·</span>
                <span className="text-[10px] text-white/20 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {item.date}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-neon-pink transition-all" aria-label="Favoritar">
                <Heart className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-white/50 transition-all" aria-label="Abrir">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-neon-pink transition-all" aria-label="Excluir">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
