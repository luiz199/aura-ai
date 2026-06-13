import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { ids, data } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0 || !data) {
      return NextResponse.json({ error: "IDs e dados obrigat\u00f3rios" }, { status: 400 })
    }

    const update: Record<string, any> = {}
    if (data.categoria) update.categoria = data.categoria
    if (data.quantidade) update.quantidade = Number(data.quantidade)
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 })
    }

    const db = await getDB()
    const result = await db.collection("products").updateMany(
      { _id: { $in: ids.map((id: string) => new ObjectId(id)) }, userId: auth.id },
      { $set: update },
    )

    return NextResponse.json({ modified: result.modifiedCount })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
