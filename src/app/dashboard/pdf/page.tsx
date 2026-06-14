"use client"

import { motion } from "framer-motion"
import { FileText, ExternalLink } from "lucide-react"

export default function PDFPage() {
  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] sm:h-[calc(100vh-4rem)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gradient tracking-tight">Editor de PDF</h1>
            <p className="text-sm text-white/30 mt-0.5">Ferramentas completas para editar, converter e assinar PDFs</p>
          </div>
          <a href="https://pdf.see.ac.gov.br/?lang=pt_BR" target="_blank" rel="noopener noreferrer"
            className="btn-neon text-xs px-4 py-2 hidden sm:flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> Abrir em nova aba
          </a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex-1 rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.01]">
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
