import { NextRequest, NextResponse } from "next/server"
import { requireAuth, verifyToken } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: "N\u00e3o autenticado" }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Token inv\u00e1lido" }, { status: 401 })
  }

  try {
    const db = await getDB()
    await db.collection("sessions").deleteOne({ token })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
