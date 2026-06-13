import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Mensagem \u00e9 obrigat\u00f3ria" }, { status: 400 })
    }

    let response: string

    if (OPENAI_API_KEY) {
      const messages = [
        { role: "system", content: "Voc\u00ea \u00e9 a AURA, uma assistente de IA premium, sofisticada e inteligente. Responda em portugu\u00eas de forma clara, detalhada e elegante. Voc\u00ea pode ajudar com an\u00e1lises, programa\u00e7\u00e3o, tradu\u00e7\u00f5es, resumos, explica\u00e7\u00f5es e muito mais." },
        ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ]

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error("OpenAI API error:", res.status, errText)
        response = "Desculpe, houve um erro ao processar sua solicita\u00e7\u00e3o. Tente novamente."
      } else {
        const data = await res.json()
        response = data.choices?.[0]?.message?.content || "Desculpe, n\u00e3o consegui gerar uma resposta."
      }
    } else {
      const responses: Record<string, string> = {
        "explique machine learning":
          "Machine Learning \u00e9 uma sub\u00e1rea da Intelig\u00eancia Artificial que permite que sistemas aprendam padr\u00f5es a partir de dados, sem serem explicitamente programados. Os principais tipos s\u00e3o:\n\n1. **Supervisionado**: dados rotulados (classifica\u00e7\u00e3o, regress\u00e3o)\n2. **N\u00e3o Supervisionado**: dados n\u00e3o rotulados (clusteriza\u00e7\u00e3o)\n3. **Por Refor\u00e7o**: aprendizado por tentativa e erro\n\nExemplos pr\u00e1ticos: filtro de spam, recomenda\u00e7\u00e3o da Netflix, carros aut\u00f4nomos.",
        "crie uma fun\u00e7\u00e3o para ordenar array":
          "Claro! Aqui est\u00e1 uma implementa\u00e7\u00e3o do Quick Sort em JavaScript:\n\n```javascript\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const middle = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), ...middle, ...right];\n}\n```\n\nComplexidade: O(n log n) no caso m\u00e9dio.",
        "resuma como funciona react":
          "React \u00e9 uma biblioteca JavaScript para construir interfaces de usu\u00e1rio. Pilares:\n\n1. **Componentes** - blocos reutiliz\u00e1veis\n2. **JSX** - HTML + JavaScript\n3. **State** - dados que mudam\n4. **Props** - dados entre componentes\n5. **Virtual DOM** - atualiza\u00e7\u00f5es eficientes",
        "traduza hello world para portugu\u00eas":
          '"Hello World" traduzido: **"Ol\u00e1, Mundo!"** \ud83c\udf89\n\n\u00c9 tradicionalmente o primeiro programa ao aprender uma nova linguagem.',
      }

      const lower = message.toLowerCase().trim()
      const match = Object.entries(responses).find(([key]) => lower.includes(key))
      response = match
        ? match[1]
        : "Ol\u00e1! Sou a AURA, sua assistente de IA premium. Posso ajudar com an\u00e1lises, programa\u00e7\u00e3o, tradu\u00e7\u00f5es, resumos e muito mais. Como posso te ajudar hoje?"
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
