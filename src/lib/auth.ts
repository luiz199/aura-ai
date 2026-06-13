import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDB } from "./mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "aura-ai-jwt-secret-dev"

export interface AuthUser {
  id: string
  nome: string
  email: string
  tipo: string
}

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string }
  } catch {
    return null
  }
}

export async function requireAuth(request: Request): Promise<AuthUser | NextResponse> {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: "Token n\u00e3o fornecido" }, { status: 401 }) as any
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: "Token inv\u00e1lido" }, { status: 401 }) as any
  }

  const db = await getDB()
  const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })

  if (!user) {
    return NextResponse.json({ error: "Usu\u00e1rio n\u00e3o encontrado" }, { status: 401 }) as any
  }

  return {
    id: user._id.toString(),
    nome: user.nome,
    email: user.email,
    tipo: user.tipo,
  }
}
