import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { csv } = await request.json()
    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "CSV obrigat\u00f3rio" }, { status: 400 })
    }

    const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV deve ter cabe\u00e7alho + dados" }, { status: 400 })
    }

    const header = lines[0].toLowerCase()
    const cols = header.split(",").map((c) => c.trim().replace(/^["\uFEFF]+|["]+$/g, ""))

    const nomeIdx = cols.findIndex((c) => c.includes("produto") || c === "nome")
    const valIdx = cols.findIndex((c) => c.includes("valid") || c.includes("data"))
    const qtdIdx = cols.findIndex((c) => c.includes("qtd") || c.includes("quant"))
    const catIdx = cols.findIndex((c) => c.includes("categ") || c.includes("tipo"))

    if (nomeIdx === -1 || valIdx === -1) {
      return NextResponse.json({ error: "CSV precisa das colunas: Produto, Validade" }, { status: 400 })
    }

    const db = await getDB()
    let imported = 0
    let errors = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const vals = parseCSVLine(lines[i])
        const nome = vals[nomeIdx]?.trim()
        const rawDate = vals[valIdx]?.trim()
        if (!nome || !rawDate) { errors++; continue }

        let expiryDate: string
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          expiryDate = d.toISOString()
        } else {
          const parts = rawDate.split(/[\/\-\.]/)
          if (parts.length === 3) {
            const [a, b, c] = parts.map(Number)
            const year = a > 31 ? a : c > 31 ? c : a > 12 ? a : c
            const month = a > 31 ? b : c > 31 ? b : a
            const day = a > 31 ? c : c > 31 ? a : b
            const parsed = new Date(year, month - 1, day)
            if (!isNaN(parsed.getTime())) expiryDate = parsed.toISOString()
            else { errors++; continue }
          } else { errors++; continue }
        }

        const quantidade = qtdIdx !== -1 ? Number(vals[qtdIdx]) || 1 : 1
        const categoria = catIdx !== -1 && vals[catIdx]?.trim() ? vals[catIdx].trim() : "Geral"

        await db.collection("products").insertOne({
          nome,
          expiryDate,
          quantidade,
          categoria,
          userId: auth.id,
          createdAt: new Date().toISOString(),
        })
        imported++
      } catch { errors++ }
    }

    return NextResponse.json({ imported, errors, total: lines.length - 1 })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
