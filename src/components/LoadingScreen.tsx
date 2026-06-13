"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const STATUSES = [
  "Inicializando núcleo neural...",
  "Conectando sistemas quânticos...",
  "Carregando modelos de IA...",
  "Calibrando redes neurais...",
  "Sincronizando bancos de dados...",
  "Preparando ambiente cognitivo...",
  "Tudo pronto!",
]

const PARTICLE_COUNT = 25

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
          setTimeout(onComplete, 800)
        }, 400)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [totalDuration, stepTime, onComplete])

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, delay: Math.random() * 3,
    duration: 3 + Math.random() * 4, drift: (Math.random() - 0.5) * 50,
  }))

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900 overflow-hidden")}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background aurora */}
          <div className="absolute inset-0 opacity-30" style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 60%, rgba(123,97,255,0.06) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 70% 60%, rgba(0,255,163,0.04) 0%, transparent 50%)",
          }} />

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id} className="absolute rounded-full"
              style={{
                left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
                background: p.id % 3 === 0 ? "#00E5FF" : p.id % 3 === 1 ? "#7B61FF" : "#00FFA3",
                boxShadow: `0 0 ${p.size * 4}px ${p.id % 3 === 0 ? "#00E5FF" : p.id % 3 === 1 ? "#7B61FF" : "#00FFA3"}`,
              }}
              animate={{ y: [0, p.drift, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: "easeInOut" }}
            />
          ))}

          {/* Holographic center */}
          <div className="relative mb-12">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent, rgba(0,229,255,0.1), rgba(123,97,255,0.1), rgba(0,255,163,0.1), transparent)",
                filter: "blur(20px)",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />

            <motion.div
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
                border: "1px solid rgba(0,229,255,0.1)",
                boxShadow: "0 0 60px rgba(0,229,255,0.05), inset 0 0 60px rgba(0,229,255,0.02)",
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #00E5FF, #7B61FF, #00FFA3, #00E5FF)",
                  maskImage: "radial-gradient(circle, transparent 30%, black 70%)",
                  WebkitMaskImage: "radial-gradient(circle, transparent 30%, black 70%)",
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              />
              <motion.div
                className="relative z-10"
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="sm:w-14 sm:h-14">
                  <motion.circle cx="24" cy="24" r="20" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="8 4"
                    animate={{ rotate: 360 }} style={{ originX: "24px", originY: "24px" }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }} />
                  <motion.path d="M16 24 L22 30 L32 18" stroke="#00FFA3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    animate={{ pathLength: [0, 1, 1], opacity: [0.5, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
                  <motion.circle cx="24" cy="24" r="6" fill="#00E5FF" fillOpacity="0.2"
                    animate={{ r: [6, 8, 6], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold mb-3 text-gradient tracking-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          >
            AURA AI
          </motion.h1>
          <motion.p
            className="text-sm text-white/30 mb-12 tracking-widest uppercase font-mono"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            Inteligência Artificial Premium
          </motion.p>

          {/* Progress */}
          <div className="w-64 sm:w-80 relative mb-4">
            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #00E5FF, #7B61FF, #00FFA3)",
                  boxShadow: "0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(123,97,255,0.1)",
                  width: `${progress}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px] text-white/20 font-mono">{Math.round(progress)}%</span>
              <span className="text-[11px] text-white/20 font-mono">100%</span>
            </div>
          </div>

          {/* Status */}
          <motion.p
            key={statusIndex}
            className="text-xs text-white/25 font-mono tracking-wide"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          >
            {STATUSES[statusIndex]}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
