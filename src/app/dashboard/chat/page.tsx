"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Send, Bot, User, Sparkles, FileText, Mic, Image,
  Code, Globe, BookOpen, ArrowUpRight, Plus, Trash2, Copy, Check, Volume2, StopCircle,
} from "lucide-react"
import toast from "react-hot-toast"

type Message = { role: "user" | "assistant"; content: string; timestamp: number }
type ChatThread = { id: string; title: string; messages: Message[]; createdAt: number }

const STORAGE_KEY = "aura_chats"
const AUTH_HEADER = () => ({ Authorization: `Bearer ${localStorage.getItem("aura_token")}` })

const suggestions = [
  { icon: FileText, label: "Resumir documento", desc: "Resuma um texto ou PDF" },
  { icon: Code, label: "Gerar c\u00f3digo", desc: "Criar fun\u00e7\u00e3o em Python/JS" },
  { icon: Globe, label: "Traduzir texto", desc: "Traduzir entre idiomas" },
  { icon: BookOpen, label: "Explicar conceito", desc: "Explica\u00e7\u00e3o detalhada" },
]

export default function ChatPage() {
  const { t } = useApp()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const activeMessages = threads.find((t) => t.id === activeThread)?.messages || []
  const welcome = activeMessages.length === 0

  // Load threads from MongoDB + localStorage
  useEffect(() => {
    const load = async () => {
      let merged: ChatThread[] = []

      // Load from localStorage (instant)
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          merged = JSON.parse(saved) as ChatThread[]
        }
      } catch {}

      // Load from MongoDB (sync across devices)
      try {
        const res = await fetch("/api/chat/threads", { headers: { ...AUTH_HEADER() } })
        if (res.ok) {
          const data = await res.json()
          const serverThreads: ChatThread[] = (data.threads || []).map((t: any) => ({
            id: t.threadId,
            title: t.title,
            messages: t.messages || [],
            createdAt: new Date(t.createdAt).getTime(),
          }))
          // Merge: server wins, but keep local messages if more recent
          const localMap = new Map(merged.map((t) => [t.id, t]))
          for (const st of serverThreads) {
            const existing = localMap.get(st.id)
            if (!existing || existing.messages.length < st.messages.length) {
              localMap.set(st.id, st)
            }
          }
          merged = Array.from(localMap.values()).sort((a, b) => b.createdAt - a.createdAt)
        }
      } catch {}

      setThreads(merged)
      if (merged.length > 0 && !activeThread) {
        setActiveThread(merged[0].id)
      }
    }
    load()
  }, [])

  // Debounced save to MongoDB
  const saveToServer = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>
    return (threads: ChatThread[]) => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        for (const thread of threads) {
          try {
            await fetch("/api/chat/threads", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...AUTH_HEADER() },
              body: JSON.stringify({
                threadId: thread.id,
                title: thread.title,
                messages: thread.messages,
              }),
            })
          } catch {}
        }
      }, 2000)
    }
  }, [])

  // Save to localStorage + trigger server sync
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
      saveToServer(threads)
    }
  }, [threads])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [activeMessages])

  const newChat = useCallback(() => {
    const id = crypto.randomUUID()
    const thread: ChatThread = {
      id,
      title: `Chat ${threads.length + 1}`,
      messages: [{ role: "assistant" as const, content: "Ol\u00e1! Sou a AURA, sua assistente de IA. Como posso ajud\u00e1-lo hoje?", timestamp: Date.now() }],
      createdAt: Date.now(),
    }
    setThreads((prev) => [thread, ...prev])
    setActiveThread(id)
  }, [threads.length])

  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (activeThread === id) {
        setActiveThread(next[0]?.id || null)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    // Delete from server
    fetch(`/api/chat/threads/${id}`, { method: "DELETE", headers: { ...AUTH_HEADER() } }).catch(() => {})
  }, [activeThread])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleSend()
      }
      if (e.key === "/" && !input && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  // Voice recognition
  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz n\u00e3o dispon\u00edvel neste navegador")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "pt-BR"
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("")
      setInput(transcript)
    }
    recognition.onerror = () => { setIsListening(false); toast.error("Erro ao capturar \u00e1udio") }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }, [isListening])

  // Image upload
  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string
        if (!base64) return

        const newMsg: Message = { role: "user", content: `[Imagem: ${file.name}]`, timestamp: Date.now() }
        addMessage(newMsg)
        setIsTyping(true)

        try {
          const token = localStorage.getItem("aura_token")
          const res = await fetch("/api/vision", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ image: base64 }),
          })
          const data = await res.json()
          addMessage({ role: "assistant", content: data.description || "N\u00e3o foi poss\u00edvel analisar.", timestamp: Date.now() })
        } catch {
          addMessage({ role: "assistant", content: "Erro ao analisar imagem.", timestamp: Date.now() })
        } finally {
          setIsTyping(false)
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [])

  const addMessage = useCallback((msg: Message) => {
    setThreads((prev) => prev.map((t) => {
      if (t.id !== activeThread) return t
      const updated = { ...t, messages: [...t.messages, msg] }
      if (t.messages.length <= 1 && msg.role === "user") {
        updated.title = msg.content.slice(0, 40) + (msg.content.length > 40 ? "..." : "")
      }
      return updated
    }))
  }, [activeThread])

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input
    if (!msg.trim() || isTyping) return

    if (!activeThread) newChat()
    const threadId = activeThread || threads[0]?.id

    setInput("")

    if (!threadId) {
      const id = crypto.randomUUID()
      setThreads([{ id, title: msg.slice(0, 40), messages: [{ role: "assistant", content: "Ol\u00e1!", timestamp: Date.now() }], createdAt: Date.now() }])
      setActiveThread(id)
    }

    addMessage({ role: "user", content: msg, timestamp: Date.now() })
    setIsTyping(true)

    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, history: activeMessages.slice(-10) }),
      })
      const data = await res.json()
      addMessage({ role: "assistant", content: data.response || data.error || "Desculpe, houve um erro.", timestamp: Date.now() })
    } catch {
      addMessage({ role: "assistant", content: "Erro de conex\u00e3o.", timestamp: Date.now() })
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, activeThread, threads, activeMessages])

  const copyMessage = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("Copiado!")
  }, [])

  const exportChat = useCallback(() => {
    if (activeMessages.length === 0) return
    const text = activeMessages.map((m) => `[${m.role === "user" ? "Voc\u00ea" : "AURA"}] ${m.content}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aura-chat-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Chat exportado!")
  }, [activeMessages])

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gradient tracking-tight">{t?.chat?.title || "Chat Inteligente"}</h1>
            <p className="text-xs text-white/30 mt-0.5">{t?.chat?.subtitle || "Converse com a IA em tempo real"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeMessages.length > 0 && (
            <button onClick={exportChat} className="btn-neon text-xs px-3 py-1.5 hidden sm:flex" aria-label="Exportar">
              <FileText className="w-3 h-3" /> Exportar
            </button>
          )}
          <button onClick={newChat} className="btn-neon text-xs px-3 py-1.5" aria-label="Novo Chat">
            <Plus className="w-3 h-3" /> {t?.chat?.novo || "Novo"}
          </button>
          <span className="flex items-center gap-1.5 text-[11px] text-neon-green/60">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green glow-dot-green" /> {t?.chat?.online || "Online"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Thread sidebar */}
        <div className={cn(
          "flex-shrink-0 flex flex-col gap-2 z-20",
          "fixed inset-x-0 top-16 bottom-0 lg:static lg:w-56 bg-dark-900/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-4 lg:p-0",
          !showSidebar && "hidden lg:flex",
        )}>
          <div className="flex items-center justify-between mb-2 lg:hidden">
            <p className="text-xs text-white/30 font-mono uppercase tracking-widest">Conversas</p>
            <button onClick={() => setShowSidebar(false)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1.5 min-h-[44px]">
              Fechar
            </button>
          </div>
          <div className="glass-card lg:p-2 space-y-1 flex-1 overflow-y-auto scrollbar-custom">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono px-2 py-1 hidden lg:block">Conversas</p>
            {threads.length === 0 && (
              <p className="text-xs text-white/20 text-center py-8">Nenhuma conversa</p>
            )}
            {threads.map((thread) => (
              <div key={thread.id} className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all",
                activeThread === thread.id ? "bg-neon-cyan/[0.06] border border-neon-cyan/20" : "hover:bg-white/[0.02]",
              )}>
                <div className="flex-1 min-w-0" onClick={() => { setActiveThread(thread.id); setShowSidebar(false) }}>
                  <p className="text-xs text-white/60 truncate">{thread.title}</p>
                  <p className="text-[10px] text-white/20">{new Date(thread.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <button onClick={() => deleteThread(thread.id)}
                  className="p-1.5 rounded hover:bg-white/[0.04] text-white/20 hover:text-neon-pink transition-all"
                  aria-label="Excluir conversa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        {!showSidebar && (
          <button onClick={() => setShowSidebar(true)}
            className="fixed left-4 bottom-4 z-30 lg:hidden bg-dark-800/80 backdrop-blur-xl border border-white/[0.06] p-3 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xl">
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-custom space-y-3 pr-2 mb-3">
            <AnimatePresence>
              {activeMessages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex gap-3 group", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                      <Bot className="w-4 h-4 text-neon-cyan" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative group",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-white/[0.06] text-white/90"
                      : "glass text-white/80",
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-white/20 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <button onClick={() => copyMessage(msg.content, `${i}`)}
                        className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded hover:bg-white/[0.04] text-white/20 hover:text-neon-cyan transition-all"
                        aria-label="Copiar mensagem"
                      >
                        {copiedId === `${i}` ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
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
            <button onClick={toggleVoice}
              className={cn("p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all", isListening ? "bg-neon-pink/20 text-neon-pink" : "hover:bg-white/[0.04] text-white/20 hover:text-white/50")}
              aria-label={isListening ? "Parar grava\u00e7\u00e3o" : "Comando de voz"}
            >
              {isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button onClick={handleImageUpload}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/[0.04] text-white/20 hover:text-white/50 transition-all"
              aria-label="Enviar imagem"
            >
              <Image className="w-4 h-4" />
            </button>
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Falando..." : `${t?.chat?.placeholder || "Digite sua mensagem..."} (Ctrl+Enter)`}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none px-3 py-2"
            />
            <div className="flex items-center gap-1">
              <span className="hidden sm:block text-[10px] text-white/10 font-mono">Ctrl+Enter</span>
              <button onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 text-neon-cyan hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isTyping ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions sidebar */}
        <div className="hidden xl:flex flex-col w-60 flex-shrink-0">
          <div className="glass-card p-4 space-y-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{t?.chat?.sugestoes || "Sugest\u00f5es"}</p>
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
