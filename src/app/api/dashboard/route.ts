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
      totalConversasSemana,
      totalUsers,
      produtosCount,
      produtosVencidos,
      allConversations,
    ] = await Promise.all([
      db.collection("conversations").countDocuments({ userId: auth.id }),
      db.collection("conversations").countDocuments({ userId: auth.id, createdAt: { $gte: today } }),
      db.collection("conversations").countDocuments({
        userId: auth.id,
        createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
      }),
      db.collection("users").countDocuments(),
      db.collection("products").countDocuments({ userId: auth.id }),
      db.collection("products").countDocuments({
        userId: auth.id,
        expiryDate: { $lt: today.toISOString() },
      }),
      db.collection("conversations")
        .find({ userId: auth.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray(),
    ])

    // Calculate average response time from last 20 conversations
    let tempoMedio = "—"
    const pairs: number[] = []
    for (let i = 0; i < allConversations.length - 1; i++) {
      if (allConversations[i].role === "assistant" && allConversations[i + 1]?.role === "user") {
        const diff = new Date(allConversations[i].createdAt).getTime() - new Date(allConversations[i + 1].createdAt).getTime()
        if (diff > 0 && diff < 300000) pairs.push(diff)
      }
    }
    if (pairs.length > 0) {
      const avg = Math.round(pairs.reduce((a, b) => a + b, 0) / pairs.length / 1000)
      tempoMedio = avg < 60 ? `${avg}s` : `${Math.floor(avg / 60)}min${avg % 60 > 0 ? `${avg % 60}s` : ""}`
    }

    // Daily conversation counts for the last 7 days
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b"]
    const chartData: { name: string; conversas: number; ia: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const fim = new Date(d)
      fim.setDate(fim.getDate() + 1)
      const count = await db.collection("conversations").countDocuments({
        userId: auth.id,
        createdAt: { $gte: d, $lt: fim },
      })
      chartData.push({
        name: diasSemana[d.getDay()],
        conversas: count,
        ia: Math.round(count * 0.6),
      })
    }

    return NextResponse.json({
      conversasHoje,
      totalConversas,
      totalConversasSemana,
      chartData,
      totalUsers,
      totalProdutos: produtosCount,
      produtosVencidos,
      tempoMedio,
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
