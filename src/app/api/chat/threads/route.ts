import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const threads = await db
      .collection("threads")
      .find({ userId: auth.id }, {
        sort: { updatedAt: -1 },
        projection: { messages: { $slice: 1 } },
      })
      .toArray()

    return NextResponse.json({ threads })
  } catch (error) {
    console.error("Error loading threads:", error)
    return NextResponse.json({ error: "Erro ao carregar conversas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { threadId, title, messages } = await request.json()
    if (!threadId) {
      return NextResponse.json({ error: "threadId é obrigatório" }, { status: 400 })
    }

    const db = await getDB()
    await db.collection("threads").updateOne(
      { userId: auth.id, threadId },
      {
        $set: {
          userId: auth.id,
          threadId,
          title: title || "Chat",
          messages,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error saving thread:", error)
    return NextResponse.json({ error: "Erro ao salvar conversa" }, { status: 500 })
  }
}
