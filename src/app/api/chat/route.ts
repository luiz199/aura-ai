import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { getDataContext } from "@/lib/chat/context"

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_PROMPT =
  "Voc\u00ea \u00e9 a AURA, uma assistente de IA premium, sofisticada e inteligente. Responda em portugu\u00eas de forma clara, detalhada e elegante. Voc\u00ea pode ajudar com an\u00e1lises, programa\u00e7\u00e3o, tradu\u00e7\u00f5es, resumos, explica\u00e7\u00f5es e muito mais.\n\n" +
  "VOC\u00ca TEM ACESSO AOS DADOS DO SISTEMA:\n" +
  "- Merenda/Estoque: nomes, quantidades, categorias, validades, alertas de vencimento\n" +
  "- Estat\u00edsticas: total de usu\u00e1rios, itens cadastrados, conversas\n" +
  "- Conversas: hist\u00f3rico das conversas recentes\n\n" +
  "Quando o usu\u00e1rio perguntar sobre esses dados, use as informa\u00e7\u00f5es fornecidas no bloco DADOS DO SISTEMA para responder com an\u00e1lises, recomenda\u00e7\u00f5es e insights.\n" +
  "Exemplos de an\u00e1lises \u00fateis:\n" +
  "- Identificar itens pr\u00f3ximos ao vencimento e sugerir a\u00e7\u00f5es\n" +
  "- Mostrar estat\u00edsticas de categorias mais comuns\n" +
  "- Recomendar prioridades com base nos prazos de validade\n" +
  "- Analisar tend\u00eancias com base no hist\u00f3rico de conversas"

async function askOllama(messages: { role: string; content: string }[]) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.7, num_predict: 2048 },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error("Ollama error:", res.status, text)
    throw new Error(`Ollama: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.message?.content || "Desculpe, n\u00e3o consegui gerar uma resposta."
}

async function askOpenAI(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error("OpenAI error:", res.status, errText)
    throw new Error(`OpenAI: ${res.status} ${errText}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || "Desculpe, n\u00e3o consegui gerar uma resposta."
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { message, history } = await request.json()
    if (!message) {
      return NextResponse.json({ error: "Mensagem \u00e9 obrigat\u00f3ria" }, { status: 400 })
    }

    const dataContexts = await getDataContext(auth.id, message)
    const dataBlock = dataContexts.length > 0
      ? `\n\n--- DADOS DO SISTEMA (${new Date().toLocaleString("pt-BR")}) ---\n${dataContexts.map((dc) => `## ${dc.title}\n${dc.content}`).join("\n\n")}\n---`
      : ""

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + dataBlock },
      ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ]

    let response: string

    try {
      response = await askOllama(messages)
    } catch (ollamaErr) {
      console.warn("Ollama falhou, tentando OpenAI:", ollamaErr)
      if (OPENAI_API_KEY) {
        try {
          response = await askOpenAI(messages)
        } catch (openaiErr) {
          console.error("OpenAI tamb\u00e9m falhou:", openaiErr)
          response = "Desculpe, todos os provedores de IA est\u00e3o indispon\u00edveis no momento. Verifique se o Ollama est\u00e1 rodando (ollama run llama3.2)."
        }
      } else {
        response = "Ollama n\u00e3o est\u00e1 dispon\u00edvel. Certifique-se de que o servidor Ollama est\u00e1 rodando em http://localhost:11434"
      }
    }

    const db = await getDB()
    await db.collection("conversations").insertOne({
      userId: auth.id,
      role: "user",
      content: message,
      createdAt: new Date(),
    })
    await db.collection("conversations").insertOne({
      userId: auth.id,
      role: "assistant",
      content: response,
      createdAt: new Date(),
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
