"use client"

import { motion } from "framer-motion"
import {
  FileText, ExternalLink, Layers, Scissors, Lock, Unlock,
  Image, ScanEye, Stamp, FileDown,
} from "lucide-react"

const tools = [
  { icon: Layers, label: "Mesclar PDFs", desc: "Junte v\u00e1rios PDFs em um s\u00f3" },
  { icon: Scissors, label: "Dividir PDF", desc: "Separe p\u00e1ginas individuais" },
  { icon: FileDown, label: "Comprimir", desc: "Reduza o tamanho do arquivo" },
  { icon: Lock, label: "Proteger", desc: "Adicione senha ao PDF" },
  { icon: Unlock, label: "Desproteger", desc: "Remova a senha do PDF" },
  { icon: Image, label: "PDF para Imagem", desc: "Converta p\u00e1ginas em imagens" },
  { icon: ScanEye, label: "OCR", desc: "Reconhecimento de texto" },
  { icon: Stamp, label: "Assinar", desc: "Adicione assinatura digital" },
]

export default function PDFPage() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gradient tracking-tight">Editor de PDF</h1>
            <p className="text-sm text-white/30 mt-0.5">Ferramentas completas da Secretaria de Educa\u00e7\u00e3o</p>
          </div>
          <a href="https://pdf.see.ac.gov.br/?lang=pt_BR" target="_blank" rel="noopener noreferrer"
            className="btn-neon text-xs sm:text-sm px-4 sm:px-6 py-3 sm:py-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Abrir Editor
          </a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8 rounded-2xl text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 flex items-center justify-center border border-white/[0.06]">
          <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-neon-cyan/60" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white/90 mb-2">Editor de PDF Online</h2>
        <p className="text-sm text-white/40 max-w-lg mx-auto mb-6">
          Editor gratuito do governo do Acre com ferramentas para mesclar, dividir, comprimir,
          proteger, assinar e converter PDFs. Para usar, clique no bot\u00e3o abaixo.
        </p>
        <a href="https://pdf.see.ac.gov.br/?lang=pt_BR" target="_blank" rel="noopener noreferrer"
          className="btn-neon text-sm px-8 py-3 inline-flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Abrir Editor de PDF
        </a>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Ferramentas dispon\u00edveis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tools.map((tool, i) => (
            <motion.div key={tool.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
              className="glass-card p-4 rounded-xl text-center hover:border-white/[0.12] transition-all cursor-default">
              <div className="p-2 rounded-lg bg-white/[0.03] inline-block mb-3">
                <tool.icon className="w-4 h-4 text-neon-cyan/60" />
              </div>
              <p className="text-xs font-medium text-white/70">{tool.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{tool.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
