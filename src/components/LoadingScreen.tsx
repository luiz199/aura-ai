"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const total = 3000
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / total) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timer)
        setTimeout(() => {
          setFadeOut(true)
          setTimeout(onComplete, 700)
        }, 300)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900 select-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_50%,rgba(255,255,255,0.015),transparent)]" />

          <div className="relative flex flex-col items-center gap-12">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-white/20">
              <motion.rect
                x="4" y="4" width="32" height="32" rx="6"
                stroke="currentColor" strokeWidth="1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M14 27L20 13L26 27"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M16.5 22.5H23.5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>

            <div className="flex flex-col items-center gap-1">
              <motion.h1
                className="text-lg font-medium text-white/60 tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                AURA
              </motion.h1>
              <motion.p
                className="text-[11px] text-white/15 font-mono tracking-[0.2em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Carregando
              </motion.p>
            </div>

            <div className="w-48 sm:w-56">
              <div className="relative h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/10 font-mono tabular-nums tracking-wider">
                  {String(Math.round(progress)).padStart(3, " ")}%
                </span>
                <span className="text-[10px] text-white/10 font-mono tabular-nums tracking-wider">100%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
