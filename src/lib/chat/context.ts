import { getDB } from "@/lib/mongodb"

interface ContextBlock {
  type: string
  title: string
  content: string
}

export async function getDataContext(userId: string, message: string): Promise<ContextBlock[]> {
  const blocks: ContextBlock[] = []
  const lower = message.toLowerCase()
  const db = await getDB()

  // === MERENDA / ESTOQUE ===
  if (lower.includes("merenda") || lower.includes("estoque") || lower.includes("produto") ||
      lower.includes("alimento") || lower.includes("validade") || lower.includes("vencimento") ||
      lower.includes("categoria") || lower.includes("alerta")) {

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const seteDias = new Date(hoje); seteDias.setDate(seteDias.getDate() + 7)

    const total = await db.collection("products").countDocuments({ userId })
    const vencidos = await db.collection("products").countDocuments({ userId, expiryDate: { $lt: hoje.toISOString() } })
    const aVencer = await db.collection("products").countDocuments({ userId, expiryDate: { $gt: hoje.toISOString(), $lte: seteDias.toISOString() } })
    const venceHoje = await db.collection("products").countDocuments({
      userId, expiryDate: { $gte: hoje.toISOString(), $lte: new Date(hoje.getTime() + 86400000).toISOString() },
    })

    const items = await db.collection("products")
      .find({ userId })
      .sort({ expiryDate: 1 })
      .limit(30)
      .toArray()

    const itemList = items.map((i: any) => {
      const days = Math.ceil((new Date(i.expiryDate).getTime() - hoje.getTime()) / 86400000)
      const status = days < 0 ? "VENCIDO" : days === 0 ? "VENCE HOJE" : days <= 7 ? `Vence em ${days}d` : "ok"
      return `  - ${i.nome} | Qtd: ${i.quantidade || 1} | Categoria: ${i.categoria || "Geral"} | Validade: ${i.expiryDate.split("T")[0]} | ${status}`
    }).join("\n")

    blocks.push({
      type: "merenda",
      title: "Dados da Merenda",
      content: `Total de itens: ${total} | Vencidos: ${vencidos} | Vence hoje: ${venceHoje} | Vencem em 7 dias: ${aVencer}\n\nItens:\n${itemList}`,
    })
  }

  // === ESTATÍSTICAS / DASHBOARD ===
  if (lower.includes("usuário") || lower.includes("usuario") || lower.includes("dashboard") ||
      lower.includes("estatística") || lower.includes("estatistica") || lower.includes("métrica") ||
      lower.includes("metrico") || lower.includes("total") || lower.includes("quantos")) {

    const userCount = await db.collection("users").countDocuments()
    const productCount = await db.collection("products").countDocuments({ userId })
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const vencidos = await db.collection("products").countDocuments({ userId, expiryDate: { $lt: hoje.toISOString() } })
    const conversas = await db.collection("threads").countDocuments({ userId })

    blocks.push({
      type: "stats",
      title: "Estatísticas do Sistema",
      content: `Usuários cadastrados: ${userCount}\nItens na merenda: ${productCount}\nItens vencidos: ${vencidos}\nConversas salvas: ${conversas}`,
    })
  }

  // === CONVERSAS / HISTÓRICO ===
  if (lower.includes("conversa") || lower.includes("historico") || lower.includes("histórico") ||
      lower.includes("disse") || lower.includes("falei") || lower.includes("perguntei") ||
      lower.includes("lembra")) {

    const recentThreads = await db.collection("threads")
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray()

    if (recentThreads.length > 0) {
      const threadSummary = recentThreads.map((t: any) =>
        `[${t.title}] (${new Date(t.updatedAt).toLocaleDateString("pt-BR")}) - ${t.messages?.length || 0} mensagens`
      ).join("\n")

      blocks.push({
        type: "historico",
        title: "Conversas Recentes",
        content: threadSummary,
      })
    }
  }

  return blocks
}
