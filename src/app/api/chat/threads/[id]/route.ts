import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const db = await getDB()
    const result = await db.collection("threads").deleteOne({
      userId: auth.id,
      threadId: id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting thread:", error)
    return NextResponse.json({ error: "Erro ao excluir conversa" }, { status: 500 })
  }
}
