"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Send, Bot, User, Sparkles, FileText, StopCircle, Mic, Image,
  Code, Globe, BookOpen, ArrowUpRight, Plus, Trash2,
} from "lucide-react"

type Message = { role: "user" | "assistant"; content: string; timestamp: Date }

const suggestions = [
  { icon: FileText, label: "Resumir documento", desc: "Resuma um texto ou PDF" },
  { icon: Code, label: "Gerar código", desc: "Criar função em Python/JS" },
  { icon: Globe, label: "Traduzir texto", desc: "Traduzir entre idiomas" },
  { icon: BookOpen, label: "Explicar conceito", desc: "Explicação detalhada" },
]

const quickReplies = [
  "Explique machine learning",
  "Crie uma função para ordenar array",
  "Resuma como funciona React",
  "Traduza 'Hello World' para português",
]

export default function ChatPage() {
  const { t } = useApp()
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ol\u00e1! Sou a AURA, sua assistente de IA. Como posso ajud\u00e1-lo hoje?", timestamp: new Date() },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  const newChat = () => setMessages([
    { role: "assistant", content: "Ol\u00e1! Sou a AURA, sua assistente de IA. Como posso ajud\u00e1-lo hoje?", timestamp: new Date() },
  ])

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input
    if (!msg.trim() || isTyping) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }])
    setIsTyping(true)

    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10),
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response || data.error || "Desculpe, houve um erro.",
        timestamp: new Date(),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Erro de conex\u00e3o. Verifique sua internet e tente novamente.",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, messages])

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gradient tracking-tight">{t?.chat?.title || "Chat Inteligente"}</h1>
          <p className="text-xs text-white/30 mt-0.5">{t?.chat?.subtitle || "Converse com a IA em tempo real"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={newChat} className="btn-neon text-xs px-3 py-1.5" aria-label="Novo Chat">
            <Plus className="w-3 h-3" /> {t?.chat?.novo || "Novo"}
          </button>
          <span className="flex items-center gap-1.5 text-[11px] text-neon-green/60"><span className="w-1.5 h-1.5 rounded-full bg-neon-green glow-dot-green" /> {t?.chat?.online || "Online"}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-custom space-y-3 pr-2 mb-3">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                      <Bot className="w-4 h-4 text-neon-cyan" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-white/[0.06] text-white/90"
                      : "glass text-white/80",
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    <p className="text-[10px] text-white/20 mt-2 text-right font-mono">
                      {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                      <User className="w-4 h-4 text-white/40" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-white/[0.06]">
                  <Bot className="w-4 h-4 text-neon-cyan/50" />
                </div>
                <div className="glass rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-neon-cyan/50"
                        animate={{ y: [-2, 2, -2], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="glass rounded-2xl p-1.5 flex items-center gap-2 border border-white/[0.06]">
            <button className="p-2 rounded-xl hover:bg-white/[0.04] text-white/20 hover:text-white/50 transition-all" aria-label="Anexar arquivo">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/[0.04] text-white/20 hover:text-white/50 transition-all" aria-label="Enviar imagem">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/[0.04] text-white/20 hover:text-white/50 transition-all" aria-label="Comando de voz">
              <Mic className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none px-3 py-2"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 text-neon-cyan hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isTyping ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Suggestions sidebar */}
        <div className="hidden xl:flex flex-col w-72 flex-shrink-0">
          <div className="glass-card p-4 space-y-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Sugestões</p>
            {suggestions.map((s, i) => (
              <button key={i} className="w-full flex items-start gap-3 p-3 rounded-xl glass-hover text-left transition-all group"
                onClick={() => handleSend(s.label)}
              >
                <div className="p-1.5 rounded-lg bg-white/[0.03]">
                  <s.icon className="w-3.5 h-3.5 text-neon-cyan/60 group-hover:text-neon-cyan transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors truncate">{s.label}</p>
                  <p className="text-[10px] text-white/20 truncate">{s.desc}</p>
                </div>
                <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
          <div className="glass-card p-4 mt-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">Respostas Rápidas</p>
            <div className="space-y-1.5">
              {quickReplies.map((qr, i) => (
                <button key={i} onClick={() => handleSend(qr)}
                  className="block w-full text-left text-[11px] text-white/30 hover:text-white/60 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-all truncate"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
