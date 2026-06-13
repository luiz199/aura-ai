"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const total = 3200
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / total) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timer)
        setTimeout(() => { setFadeOut(true); setTimeout(onComplete, 900) }, 200)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [onComplete])

  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference * (1 - progress / 100)

  const gradientId = useMemo(() => "grad-" + Math.random().toString(36).slice(2, 8), [])

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900 select-none overflow-hidden"
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.04) 0%, rgba(168,85,247,0.02) 30%, transparent 60%)",
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-10">
            <div className="relative" style={{ width: 100, height: 100 }}>
              <svg width="100" height="100" viewBox="0 0 100 100" className="absolute inset-0">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="50" cy="50" r="36"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.circle
                  cx="50" cy="50" r="36"
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ rotate: "-90deg", transformOrigin: "center" }}
                />
              </svg>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <motion.path
                    d="M22 6L36 16V34L22 38L8 34V16L22 6Z"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.path
                    d="M16 28L22 16L28 28"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.path
                    d="M18.5 24.5H25.5"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <motion.h1
                className="text-lg font-medium tracking-tight"
                style={{ color: "rgba(255,255,255,0.55)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                AURA
              </motion.h1>
              <motion.p
                className="text-[10px] tracking-[0.35em] uppercase"
                style={{ color: "rgba(255,255,255,0.12)", fontFamily: "var(--font-mono)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Inicializando
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
