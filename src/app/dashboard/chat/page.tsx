"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Send, Bot, User, Sparkles, FileText, StopCircle, Mic, Image,
  Code, Globe, BookOpen, ArrowUpRight,
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
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou a AURA, sua assistente de IA. Como posso ajudá-lo hoje?", timestamp: new Date() },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  const handleSend = async (text?: string) => {
    const msg = text || input
    if (!msg.trim() || isTyping) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }])
    setIsTyping(true)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "explique machine learning": "Machine Learning \u00e9 uma sub\u00e1rea da Intelig\u00eancia Artificial que permite que sistemas aprendam padr\u00f5es a partir de dados, sem serem explicitamente programados. Os principais tipos s\u00e3o: Aprendizado Supervisionado, N\u00e3o Supervisionado e por Refor\u00e7o. Exemplos incluem: classifica\u00e7\u00e3o de emails, recomenda\u00e7\u00e3o de produtos e carros aut\u00f4nomos.",
        "crie uma fun\u00e7\u00e3o para ordenar array": "Claro! Aqui est\u00e1 uma implementa\u00e7\u00e3o do Quick Sort em JavaScript:\n\n```javascript\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const middle = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), ...middle, ...right];\n}\n```\n\nComplexidade: O(n log n) no caso m\u00e9dio.",
        "resuma como funciona react": "React \u00e9 uma biblioteca JavaScript para construir interfaces de usu\u00e1rio. Seus conceitos principais:\n\n1. **Componentes**: Blocos reutiliz\u00e1veis de UI\n2. **JSX**: Sintaxe que combina HTML e JavaScript\n3. **Estado (State)**: Dados que podem mudar ao longo do tempo\n4. **Props**: Dados passados entre componentes\n5. **Virtual DOM**: Atualiza\u00e7\u00f5es eficientes da interface\n\nReact permite criar SPAs, sites e apps mobile (React Native) com performance e escalabilidade.",
        "traduza 'hello world' para portugu\u00eas": '"Hello World" traduzido para o portugu\u00eas \u00e9 **"Ol\u00e1, Mundo!"** \uD83C\uDF89\n\n\u00c9 tradicionalmente usado como o primeiro programa ao aprender uma nova linguagem de programa\u00e7\u00e3o.',
      }
      const lower = msg.toLowerCase().trim()
      const response = Object.entries(responses).find(([key]) => lower.includes(key))
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: response ? response[1] : "Obrigado pela sua pergunta! Sou uma IA projetada para ajudar com an\u00e1lises, programa\u00e7\u00e3o, tradu\u00e7\u00f5es, resumos e muito mais. Poderia fornecer mais detalhes para que eu possa ajud\u00e1-lo melhor?",
        timestamp: new Date(),
      }])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gradient tracking-tight">Chat Inteligente</h1>
          <p className="text-xs text-white/30 mt-0.5">Converse com a IA em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-neon-green/60"><span className="w-1.5 h-1.5 rounded-full bg-neon-green glow-dot-green" /> Online</span>
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
                    <div className="whitespace-pre-wrap">{msg.content}</div>
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
