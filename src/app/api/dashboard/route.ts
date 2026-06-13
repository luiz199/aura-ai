import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalConversas,
      conversasHoje,
      totalDocumentos,
      totalUsers,
      recentConversas,
    ] = await Promise.all([
      db.collection("conversations").countDocuments({ userId: auth.id }),
      db.collection("conversations").countDocuments({ userId: auth.id, createdAt: { $gte: today } }),
      db.collection("files").countDocuments({ userId: auth.id }),
      db.collection("users").countDocuments(),
      db.collection("conversations")
        .find({ userId: auth.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ])

    return NextResponse.json({
      conversasHoje,
      totalConversas,
      totalDocumentos,
      totalUsers,
      tempoMedio: "4.2min",
      recentes: recentConversas.map((c: any) => ({
        acao: c.role === "assistant" ? "Resposta gerada" : "Pergunta enviada",
        detalhe: c.content.slice(0, 60),
        tempo: formatRelativeTime(c.createdAt),
      })),
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins} min atr\u00e1s`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atr\u00e1s`
  return `${Math.floor(hours / 24)}d atr\u00e1s`
}
