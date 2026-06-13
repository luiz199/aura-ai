import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDB } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const db = await getDB()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    if (user.tipo !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 })
    }

    const token = signToken({ id: user._id.toString(), email: user.email })

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        preferences: user.preferences || { theme: "dark", language: "pt-BR" },
      },
    })
  } catch (error: any) {
    console.error("Admin login error:", error?.message || error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
