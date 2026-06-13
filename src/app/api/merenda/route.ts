import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    let filter: any = { userId: auth.id }
    if (status === "vencido") {
      filter.expiryDate = { $lt: hoje.toISOString() }
    } else if (status === "vence-hoje") {
      const fimHoje = new Date(hoje)
      fimHoje.setHours(23, 59, 59, 999)
      filter.expiryDate = { $gte: hoje.toISOString(), $lte: fimHoje.toISOString() }
    } else if (status === "a-vencer") {
      const seteDias = new Date(hoje)
      seteDias.setDate(seteDias.getDate() + 7)
      filter.expiryDate = { $gt: hoje.toISOString(), $lte: seteDias.toISOString() }
    }

    const products = await db.collection("products")
      .find(filter)
      .sort({ expiryDate: 1 })
      .toArray()

    const total = await db.collection("products").countDocuments({ userId: auth.id })
    const vencidos = await db.collection("products").countDocuments({ userId: auth.id, expiryDate: { $lt: hoje.toISOString() } })
    const venceHoje = await db.collection("products").countDocuments({
      userId: auth.id,
      expiryDate: {
        $gte: hoje.toISOString(),
        $lte: new Date(hoje.getTime() + 86400000).toISOString(),
      },
    })

    return NextResponse.json({
      products: products.map((p) => ({
        id: p._id.toString(),
        nome: p.nome,
        expiryDate: p.expiryDate,
        quantidade: p.quantidade || 1,
        categoria: p.categoria || "Geral",
        createdAt: p.createdAt,
      })),
      stats: { total, vencidos, venceHoje },
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { nome, expiryDate, quantidade, categoria } = await request.json()
    if (!nome || !expiryDate) {
      return NextResponse.json({ error: "Nome e data de validade s\u00e3o obrigat\u00f3rios" }, { status: 400 })
    }

    const db = await getDB()
    const result = await db.collection("products").insertOne({
      nome,
      expiryDate,
      quantidade: quantidade || 1,
      categoria: categoria || "Geral",
      userId: auth.id,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      id: result.insertedId.toString(),
      nome,
      expiryDate,
      quantidade: quantidade || 1,
      categoria: categoria || "Geral",
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
