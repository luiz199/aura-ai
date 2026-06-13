import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const produtos = await db.collection("products")
      .find({ userId: auth.id })
      .sort({ expiryDate: 1 })
      .toArray()

    const data = produtos.map((p) => ({
      nome: p.nome,
      validade: p.expiryDate,
      quantidade: p.quantidade || 1,
      categoria: p.categoria || "Geral",
    }))

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
