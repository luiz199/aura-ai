import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const result = await db.collection("products").deleteMany({ userId: auth.id })
    return NextResponse.json({ deleted: result.deletedCount })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
