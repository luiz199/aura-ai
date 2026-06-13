"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  MessageSquareText, Bot, FileText, Mic, Globe, Code, Star,
  Clock, FolderOpen, Heart, MoreHorizontal,
} from "lucide-react"

const favorites = [
  { icon: Code, label: "Função QuickSort em Python", desc: "Implementação otimizada de ordenação", color: "text-neon-cyan", date: "Adicionado ontem" },
  { icon: FileText, label: "Resumo: Machine Learning", desc: "Principais conceitos de ML em 5 min", color: "text-neon-purple", date: "Adicionado ontem" },
  { icon: Globe, label: "Tradução EN → PT", desc: "Documento técnico de 2.000 palavras", color: "text-neon-green", date: "Adicionado 2 dias" },
  { icon: Bot, label: "Explicação: Redes Neurais", desc: "Fundamentos de deep learning", color: "text-neon-cyan", date: "Adicionado 3 dias" },
  { icon: Mic, label: "Transcrição reunião", desc: "Ata da reunião semanal", color: "text-neon-purple", date: "Adicionado 5 dias" },
  { icon: MessageSquareText, label: "Análise de contrato", desc: "Revisão de cláusulas contratuais", color: "text-neon-green", date: "Adicionado 1 semana" },
]

const folders = [
  { name: "Códigos", count: 12, icon: Code, color: "from-neon-cyan/20 to-transparent" },
  { name: "Documentos", count: 8, icon: FileText, color: "from-neon-purple/20 to-transparent" },
  { name: "Traduções", count: 5, icon: Globe, color: "from-neon-green/20 to-transparent" },
  { name: "Transcrições", count: 3, icon: Mic, color: "from-neon-cyan/20 to-transparent" },
]

export default function FavoritosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">Favoritos</h1>
        <p className="text-sm text-white/30 mt-1">Itens salvos para acesso rápido</p>
      </div>

      {/* Folders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {folders.map((folder, i) => (
          <motion.button
            key={folder.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-left group"
          >
            <div className={cn("p-2.5 rounded-xl bg-gradient-to-br mb-3 inline-block", folder.color)}>
              <folder.icon className="w-4 h-4 text-white/60" />
            </div>
            <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{folder.name}</p>
            <p className="text-[11px] text-white/20 font-mono mt-0.5">{folder.count} itens</p>
          </motion.button>
        ))}
      </div>

      {/* Favorites list */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-neon-pink/60" />
          <span className="text-sm text-white/40">Itens Salvos</span>
        </div>
        {favorites.map((item, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-card p-4 flex items-center gap-4 group"
          >
            <div className={cn("p-2.5 rounded-xl bg-white/[0.03]", item.color)}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 truncate group-hover:text-white/90 transition-colors">{item.label}</p>
              <p className="text-xs text-white/30 mt-0.5 truncate">{item.desc}</p>
            </div>
            <span className="text-[10px] text-white/20 font-mono flex-shrink-0">{item.date}</span>
            <button className="p-2 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-white/50 transition-all opacity-0 group-hover:opacity-100" aria-label="Mais opções">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
