import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const produtos = await db.collection("products")
      .find({ userId: auth.id })
      .sort({ expiryDate: 1 })
      .toArray()

    const header = "Produto,Validade,Quantidade,Categoria,Status"
    const rows = produtos.map((p) => {
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
      const val = new Date(p.expiryDate); val.setHours(0, 0, 0, 0)
      const diff = Math.ceil((val.getTime() - hoje.getTime()) / 86400000)
      let status = "OK"
      if (diff < 0) status = "VENCIDO"
      else if (diff === 0) status = "VENCE HOJE"
      else if (diff <= 7) status = `${diff} dia(s)`
      const nome = p.nome.includes(",") || p.nome.includes('"') ? `"${p.nome.replace(/"/g, '""')}"` : p.nome
      return `${nome},${val.toISOString().split("T")[0]},${p.quantidade || 1},${p.categoria || "Geral"},${status}`
    })

    const csv = "\uFEFF" + header + "\n" + rows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="merenda-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
