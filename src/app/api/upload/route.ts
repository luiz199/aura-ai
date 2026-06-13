import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. M\u00e1ximo 10MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const type = file.type || "application/octet-stream"

    const db = await getDB()
    const result = await db.collection("files").insertOne({
      userId: new ObjectId(auth.id),
      fileName: file.name,
      fileType: type,
      fileSize: file.size,
      data: base64,
      createdAt: new Date(),
    })

    return NextResponse.json({
      id: result.insertedId.toString(),
      fileName: file.name,
      fileType: type,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 })
  }
}
