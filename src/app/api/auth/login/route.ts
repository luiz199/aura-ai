import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDB } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha s\u00e3o obrigat\u00f3rios" }, { status: 400 })
    }

    const db = await getDB()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
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
    console.error("Login error:", error?.message || error)
    return NextResponse.json({ error: "Erro interno: " + (error?.message || "desconhecido") }, { status: 500 })
  }
}
