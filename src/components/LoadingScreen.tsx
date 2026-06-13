"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STATUSES = [
  "Iniciando...",
  "Carregando módulos...",
  "Preparando ambiente...",
  "Quase lá...",
  "Pronto!",
]

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const totalDuration = 3500
  const stepTime = totalDuration / STATUSES.length

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(pct)
      const idx = Math.min(Math.floor(elapsed / stepTime), STATUSES.length - 1)
      setStatusIndex(idx)
      if (pct >= 100) {
        clearInterval(timer)
        setTimeout(() => {
          setFadeOut(true)
          setTimeout(onComplete, 600)
        }, 400)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [totalDuration, stepTime, onComplete])

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 45%, rgba(255,255,255,0.02) 0%, transparent 60%)",
          }} />

          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 mb-6 rounded-xl border border-white/[0.06] flex items-center justify-center bg-white/[0.02]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L20 9V19H4V9L12 3Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 19V12H15V19" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-white/70 tracking-tight mb-1">AURA AI</h1>
            <p className="text-xs text-white/20 font-mono tracking-wider uppercase mb-12">Inteligência Artificial</p>

            <div className="w-56 sm:w-72">
              <div className="h-[1px] w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/20 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/15 font-mono tabular-nums">{Math.round(progress)}%</span>
                <span className="text-[10px] text-white/15 font-mono">100%</span>
              </div>
            </div>

            <motion.p
              key={statusIndex}
              className="text-xs text-white/20 font-mono mt-4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {STATUSES[statusIndex]}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
