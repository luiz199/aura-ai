import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDB } from "@/lib/mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "aura-ai-jwt-secret-dev"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token e nova senha obrigat\u00f3rios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; purpose: string }
    if (decoded.purpose !== "reset") {
      return NextResponse.json({ error: "Token inv\u00e1lido" }, { status: 400 })
    }

    const db = await getDB()
    const user = await db.collection("users").findOne({
      _id: new (await import("mongodb")).ObjectId(decoded.id),
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inv\u00e1lido ou expirado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword }, $unset: { resetToken: "", resetTokenExpiry: "" } },
    )

    return NextResponse.json({ message: "Senha redefinida com sucesso!" })
  } catch {
    return NextResponse.json({ error: "Token inv\u00e1lido ou expirado" }, { status: 400 })
  }
}
