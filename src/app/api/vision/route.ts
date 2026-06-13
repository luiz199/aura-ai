import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: "Imagem n\u00e3o fornecida" }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Analise esta imagem em detalhes. Descreva o que voc\u00ea v\u00ea, incluindo objetos, cores, texto, e contexto. Responda em portugu\u00eas." },
                { type: "image_url", image_url: { url: image, detail: "auto" } },
              ],
            },
          ],
          max_tokens: 1024,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error("Vision API error:", res.status, errText)
        return NextResponse.json({ error: "Erro ao analisar imagem" }, { status: 500 })
      }

      const data = await res.json()
      return NextResponse.json({
        description: data.choices?.[0]?.message?.content || "N\u00e3o foi poss\u00edvel analisar a imagem.",
      })
    }

    return NextResponse.json({
      description: "Imagem recebida com sucesso! Para an\u00e1lise completa com IA, configure a vari\u00e1vel OPENAI_API_KEY no ambiente. Por enquanto, posso confirmar que o upload foi processado corretamente.",
    })
  } catch (error) {
    console.error("Vision error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
