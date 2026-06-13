import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const { nome, email, password, tipo } = await request.json()
    if (!nome || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const db = await getDB()
    const existing = await db.collection("users").findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.collection("users").insertOne({
      nome,
      email,
      password: hashedPassword,
      tipo: tipo === "admin" ? "admin" : "user",
      createdAt: new Date(),
      preferences: { theme: "dark", language: "pt-BR", notifications: true },
    })

    return NextResponse.json({
      id: result.insertedId.toString(),
      nome,
      email,
      tipo: tipo === "admin" ? "admin" : "user",
      createdAt: new Date(),
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

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

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { userId, tipo } = await request.json()
    if (!userId || !tipo) {
      return NextResponse.json({ error: "userId e tipo obrigat\u00f3rios" }, { status: 400 })
    }
    const db = await getDB()
    const { ObjectId } = require("mongodb")
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { tipo } },
    )
    return NextResponse.json({ ok: true })
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
