import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDB } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { nome, email, password } = await request.json()

    if (!nome || !email || !password) {
      return NextResponse.json({ error: "Todos os campos s\u00e3o obrigat\u00f3rios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const db = await getDB()
    const existing = await db.collection("users").findOne({ email })

    if (existing) {
      return NextResponse.json({ error: "Email j\u00e1 cadastrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.collection("users").insertOne({
      nome,
      email,
      password: hashedPassword,
      tipo: "user",
      createdAt: new Date(),
      preferences: { theme: "dark", language: "pt-BR", notifications: true },
    })

    const token = signToken({ id: result.insertedId.toString(), email })

    return NextResponse.json({
      token,
      user: { id: result.insertedId.toString(), nome, email, tipo: "user" },
    })
  } catch (error: any) {
    console.error("Register error:", error?.message || error)
    return NextResponse.json({ error: "Erro: " + (error?.message || "desconhecido") }, { status: 500 })
  }
}
