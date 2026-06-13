import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDB } from "@/lib/mongodb"
import jsPDF from "jspdf"
import "jspdf-autotable"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const db = await getDB()
    const produtos = await db.collection("products")
      .find({ userId: auth.id })
      .sort({ expiryDate: 1 })
      .toArray()

    const hoje = new Date()
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(0, 229, 255)
    doc.text("AURA AI", pageWidth / 2, 25, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.setFont("helvetica", "normal")
    doc.text("Relat\u00f3rio de Merenda Escolar", pageWidth / 2, 33, { align: "center" })

    const dataStr = `${hoje.toLocaleDateString("pt-BR")} ${hoje.toLocaleTimeString("pt-BR")}`
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Gerado em: ${dataStr}`, pageWidth / 2, 39, { align: "center" })

    const headers = [["#", "Produto", "Validade", "Qtd", "Categoria", "Status"]]
    const rows = produtos.map((p, i) => {
      const valDate = new Date(p.expiryDate)
      const diff = valDate.getTime() - hoje.getTime()
      const daysLeft = Math.ceil(diff / 86400000)
      let status = ""
      if (daysLeft < 0) status = "VENCIDO"
      else if (daysLeft === 0) status = "VENCE HOJE"
      else if (daysLeft <= 7) status = `${daysLeft} dia(s)`
      else status = "OK"

      return [
        String(i + 1),
        p.nome,
        valDate.toLocaleDateString("pt-BR"),
        String(p.quantidade || 1),
        p.categoria || "Geral",
        status,
      ]
    })

    ;(doc as any).autoTable({
      head: headers,
      body: rows,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 229, 255], textColor: [5, 8, 22], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15 },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 5) {
          const val = data.cell.text[0]
          if (val === "VENCIDO") {
            data.cell.styles.textColor = [255, 50, 50]
            data.cell.styles.fontStyle = "bold"
          } else if (val === "VENCE HOJE") {
            data.cell.styles.textColor = [255, 165, 0]
            data.cell.styles.fontStyle = "bold"
          } else if (val.endsWith("dia(s)")) {
            data.cell.styles.textColor = [255, 200, 0]
          } else {
            data.cell.styles.textColor = [0, 200, 80]
          }
        }
      },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 45

    doc.setFontSize(8)
    doc.setTextColor(150)
    const vencidos = produtos.filter((p) => new Date(p.expiryDate) < hoje).length
    const aVencer = produtos.filter((p) => {
      const d = new Date(p.expiryDate)
      return d >= hoje && d <= new Date(hoje.getTime() + 7 * 86400000)
    }).length
    doc.text(`Total: ${produtos.length} produtos  |  Vencidos: ${vencidos}  |  A vencer (7 dias): ${aVencer}`, pageWidth / 2, finalY + 10, { align: "center" })

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="merenda-${hoje.toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
