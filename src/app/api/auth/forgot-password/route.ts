import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDB } from "@/lib/mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "aura-ai-jwt-secret-dev"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email obrigat\u00f3rio" }, { status: 400 })
    }

    const db = await getDB()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "Se o email existir, voc\u00ea receber\u00e1 o link de recupera\u00e7\u00e3o." })
    }

    const token = jwt.sign({ id: user._id.toString(), purpose: "reset" }, JWT_SECRET, { expiresIn: "15m" })

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000) } },
    )

    const resetLink = `${request.nextUrl.origin}/auth/redefinir-senha?token=${token}`

    return NextResponse.json({
      message: "Se o email existir, voc\u00ea receber\u00e1 o link de recupera\u00e7\u00e3o.",
      resetLink,
    })
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
