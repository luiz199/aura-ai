import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const { nome, expiryDate, quantidade, categoria } = await request.json()
    const db = await getDB()

    const update: any = {}
    if (nome) update.nome = nome
    if (expiryDate) update.expiryDate = expiryDate
    if (quantidade) update.quantidade = quantidade
    if (categoria) update.categoria = categoria

    const result = await db.collection("products").findOneAndUpdate(
      { _id: new ObjectId(id), userId: auth.id },
      { $set: update },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Produto n\u00e3o encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: result._id.toString(),
      nome: result.nome,
      expiryDate: result.expiryDate,
      quantidade: result.quantidade,
      categoria: result.categoria,
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const db = await getDB()

    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id), userId: auth.id })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Produto n\u00e3o encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Produto exclu\u00eddo" })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
