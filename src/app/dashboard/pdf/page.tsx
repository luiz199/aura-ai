"use client"

import { motion } from "framer-motion"
import { FileText, ExternalLink } from "lucide-react"

export default function PDFPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-1 py-2 sm:py-3 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.03] flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-neon-cyan/60" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-gradient tracking-tight truncate">Editor de PDF</h1>
            <p className="text-[10px] sm:text-xs text-white/30 truncate">Ferramentas completas da SEE/AC</p>
          </div>
        </div>
        <a href="https://pdf.see.ac.gov.br/?lang=pt_BR" target="_blank" rel="noopener noreferrer"
          className="btn-neon text-[11px] sm:text-xs px-3 sm:px-4 py-2 flex items-center gap-1.5 flex-shrink-0">
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Abrir em nova aba</span>
        </a>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex-1 rounded-xl sm:rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.01] min-h-0">
        <iframe
          src="https://pdf.see.ac.gov.br/?lang=pt_BR"
          className="w-full h-full"
          title="Editor de PDF"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          loading="lazy"
        />
      </motion.div>
    </div>
  )
}
