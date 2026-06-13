import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const users = await db.collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(users.map((u: any) => ({
      id: u._id.toString(),
      nome: u.nome,
      email: u.email,
      tipo: u.tipo,
      createdAt: u.createdAt,
    })))
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.tipo !== "admin") {
    return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 403 })
  }

  try {
    const { userId } = await request.json()
    const db = await getDB()
    const { ObjectId } = require("mongodb")
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
