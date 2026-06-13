import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { ids } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs obrigat\u00f3rios" }, { status: 400 })
    }

    const db = await getDB()
    const result = await db.collection("products").deleteMany({
      _id: { $in: ids.map((id: string) => new ObjectId(id)) },
      userId: auth.id,
    })

    return NextResponse.json({ deleted: result.deletedCount })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
