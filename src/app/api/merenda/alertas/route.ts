import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const seteDias = new Date(hoje)
    seteDias.setDate(seteDias.getDate() + 7)

    const vencidos = await db.collection("products").countDocuments({
      userId: auth.id,
      expiryDate: { $lt: hoje.toISOString() },
    })
    const venceHoje = await db.collection("products").countDocuments({
      userId: auth.id,
      expiryDate: {
        $gte: hoje.toISOString(),
        $lte: new Date(hoje.getTime() + 86400000).toISOString(),
      },
    })
    const aVencer = await db.collection("products").countDocuments({
      userId: auth.id,
      expiryDate: { $gt: hoje.toISOString(), $lte: seteDias.toISOString() },
    })

    const alertas = await db.collection("products")
      .find({
        userId: auth.id,
        expiryDate: { $lte: seteDias.toISOString() },
      })
      .sort({ expiryDate: 1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      total: vencidos + venceHoje + aVencer,
      vencidos,
      venceHoje,
      aVencer,
      alertas: alertas.map((p) => ({
        id: p._id.toString(),
        nome: p.nome,
        expiryDate: p.expiryDate,
        status: new Date(p.expiryDate) < hoje ? "vencido" : "a-vencer",
      })),
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
