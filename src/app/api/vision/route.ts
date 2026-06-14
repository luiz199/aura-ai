import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "llama3.2-vision"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function analyzeWithGemini(imageBase64: string): Promise<string> {
  const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, "")

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analise esta imagem em detalhes. Descreva o que você vê, incluindo objetos, cores, texto, e contexto. Responda em português." },
            { inline_data: { mime_type: "image/jpeg", data: imageData } },
          ],
        }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
      }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    console.error("Gemini vision error:", res.status, text)
    throw new Error(`Gemini vision: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível analisar a imagem."
}

async function analyzeWithOllama(imageBase64: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta imagem em detalhes. Descreva o que você vê, incluindo objetos, cores, texto, e contexto. Responda em português." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      stream: false,
      options: { temperature: 0.5, num_predict: 1024 },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Ollama vision error:", res.status, text)
    throw new Error(`Ollama vision: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.message?.content || "Não foi possível analisar a imagem."
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: "Imagem n\u00e3o fornecida" }, { status: 400 })
    }

    // Try Ollama first (local, free)
    try {
      const description = await analyzeWithOllama(image)
      return NextResponse.json({ description })
    } catch { console.warn("Ollama vision indisponível") }

    // Fallback to Gemini (free cloud)
    if (GEMINI_API_KEY) {
      try {
        const description = await analyzeWithGemini(image)
        return NextResponse.json({ description })
      } catch { console.warn("Gemini vision indisponível") }
    }

    // Fallback to OpenAI
    if (OPENAI_API_KEY) {
      try {
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
                  { type: "text", text: "Analise esta imagem em detalhes. Descreva o que você vê, incluindo objetos, cores, texto, e contexto. Responda em português." },
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
          description: data.choices?.[0]?.message?.content || "Não foi possível analisar a imagem.",
        })
      } catch { console.warn("OpenAI vision indisponível") }
    }

    return NextResponse.json({
      description: "Imagem recebida! Para análise, instale o Ollama: ollama pull llama3.2-vision",
    })
  } catch (error) {
    console.error("Vision error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
