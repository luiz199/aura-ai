import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const db = await getDB()
  const user = await db.collection("users").findOne({ _id: new ObjectId(auth.id) })

  if (!user) {
    return NextResponse.json({ error: "Usu\u00e1rio n\u00e3o encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    id: user._id.toString(),
    nome: user.nome,
    email: user.email,
    tipo: user.tipo,
    preferences: user.preferences || { theme: "dark", language: "pt-BR" },
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const allowedFields = ["nome", "preferences"]
    const update: Record<string, any> = {}

    for (const key of allowedFields) {
      if (body[key] !== undefined) update[key] = body[key]
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
    }

    const db = await getDB()
    await db.collection("users").updateOne(
      { _id: new ObjectId(auth.id) },
      { $set: update }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
