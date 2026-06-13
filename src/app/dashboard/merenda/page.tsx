"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/context/AppContext"
import {
  Package, Plus, Trash2, Edit3, FileDown, AlertTriangle,
  Clock, CheckCircle, X, Search, Square, CheckSquare,
  ChevronDown, Layers,
} from "lucide-react"
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton"
import toast from "react-hot-toast"

interface Product {
  id: string
  nome: string
  expiryDate: string
  quantidade: number
  categoria: string
}

interface ProductForm {
  nome: string
  expiryDate: string
  quantidade: number
  categoria: string
}

const emptyForm: ProductForm = { nome: "", expiryDate: "", quantidade: 1, categoria: "Geral" }
const CATEGORIAS = ["Geral", "Latic\u00ednios", "Gr\u00e3os", "Bebidas", "Frutas", "Carnes", "Hortifr\u00fati", "Padaria", "Higiene"]

function getStatus(d: string) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const val = new Date(d); val.setHours(0, 0, 0, 0)
  const diff = Math.ceil((val.getTime() - hoje.getTime()) / 86400000)
  if (diff < 0) return { label: "Vencido", color: "text-red-400 border-red-500/30 bg-red-500/10", icon: AlertTriangle }
  if (diff === 0) return { label: "Vence hoje", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", icon: Clock }
  if (diff <= 7) return { label: `${diff} dia(s)`, color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", icon: Clock }
  return { label: "OK", color: "text-green-400 border-green-500/30 bg-green-500/10", icon: CheckCircle }
}

export default function MerendaPage() {
  const { t } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({ total: 0, vencidos: 0, venceHoje: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchCat, setBatchCat] = useState("")
  const selectAllRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async (status = "") => {
    setLoading(true)
    try {
      const token = localStorage.getItem("aura_token")
      const params = status ? `?status=${status}` : ""
      const res = await fetch(`/api/merenda${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setStats(data.stats || { total: 0, vencidos: 0, venceHoje: 0 })
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const someFilteredSelected = filtered.some((p) => selected.has(p.id))

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someFilteredSelected && !allFilteredSelected
    }
  }, [someFilteredSelected, allFilteredSelected])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }

  const clearSelection = () => setSelected(new Set())

  const openNew = () => { setEditingId(null); setForm(emptyForm); setShowForm(true) }

  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({ nome: p.nome, expiryDate: p.expiryDate.split("T")[0], quantidade: p.quantidade, categoria: p.categoria })
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.expiryDate) { toast.error("Preencha nome e validade"); return }
    setSaving(true)
    try {
      const token = localStorage.getItem("aura_token")
      const url = editingId ? `/api/merenda/${editingId}` : "/api/merenda"
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editingId ? "Produto atualizado" : "Produto adicionado")
        setShowForm(false); setEditingId(null); load()
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao salvar")
      }
    } catch { toast.error("Erro ao salvar") } finally { setSaving(false) }
  }

  const remove = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"?`)) return
    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch(`/api/merenda/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { toast.success("Exclu\u00eddo"); load() }
      else toast.error("Erro ao excluir")
    } catch { toast.error("Erro ao excluir") }
  }

  const batchDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Excluir ${selected.size} produto(s)?`)) return
    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch("/api/merenda/batch/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (res.ok) {
        toast.success(`${selected.size} produto(s) exclu\u00eddo(s)`)
        setSelected(new Set()); load()
      } else toast.error("Erro ao excluir")
    } catch { toast.error("Erro ao excluir") }
  }

  const batchUpdateCategory = async () => {
    if (selected.size === 0 || !batchCat) return
    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch("/api/merenda/batch/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selected), data: { categoria: batchCat } }),
      })
      if (res.ok) {
        toast.success(`Categoria alterada para ${selected.size} produto(s)`)
        setSelected(new Set()); setBatchCat(""); load()
      } else toast.error("Erro ao atualizar")
    } catch { toast.error("Erro ao atualizar") }
  }

  const exportPDF = async () => {
    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch("/api/merenda/relatorio", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a"); a.href = url; a.download = `merenda-${new Date().toISOString().split("T")[0]}.pdf`
        a.click(); URL.revokeObjectURL(url)
        toast.success("PDF exportado!")
      } else toast.error("Erro ao gerar PDF")
    } catch { toast.error("Erro ao gerar PDF") }
  }

  const filtros = [
    { key: "", label: "Todos" },
    { key: "vencido", label: "Vencidos" },
    { key: "vence-hoje", label: "Vence Hoje" },
    { key: "a-vencer", label: "A Vencer (7d)" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient tracking-tight">Merenda Escolar</h1>
          <p className="text-sm text-white/30 mt-1">Gest\u00e3o de produtos e validades</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-neon text-xs px-4 py-2">
            <FileDown className="w-3 h-3" /> PDF
          </button>
          <button onClick={openNew} className="btn-neon text-xs px-4 py-2">
            <Plus className="w-3 h-3" /> Novo Produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "border-l-neon-cyan", icon: Package },
          { label: "Vencidos", value: stats.vencidos, color: "border-l-red-500", icon: AlertTriangle },
          { label: "Vence Hoje", value: stats.venceHoje, color: "border-l-orange-500", icon: Clock },
          { label: "OK", value: stats.total - stats.vencidos - stats.venceHoje, color: "border-l-green-500", icon: CheckCircle },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-4 border-l-2 ${s.color}`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-white/5 to-transparent inline-block mb-3">
              <s.icon className="w-4 h-4 text-white/70" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-neon pl-9 w-full" placeholder="Buscar produto..." />
        </div>
        {filtros.map((f) => (
          <button key={f.key} onClick={() => { setFilterStatus(f.key); load(f.key) }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filterStatus === f.key
                ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10"
                : "border-white/[0.06] text-white/40 hover:border-white/20"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/80">{editingId ? "Editar" : "Novo"} Produto</h3>
              <button onClick={() => setShowForm(false)} className="text-white/20 hover:text-white/50"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1">Produto</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input-neon w-full" placeholder="Arroz, Leite..." />
              </div>
              <div>
                <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1">Validade</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="input-neon w-full" />
              </div>
              <div>
                <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1">Qtd</label>
                <input type="number" min={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                  className="input-neon w-full" />
              </div>
              <div>
                <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider block mb-1">Categoria</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="input-neon w-full">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving}
                className="btn-neon h-[42px] px-4 text-xs w-full">
                {saving ? <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /> : (editingId ? "Atualizar" : "Adicionar")}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-white/30 uppercase tracking-wider font-mono">
                  <th className="py-3 pl-4 pr-2 w-10">
                    <button onClick={toggleSelectAll} className="p-1" aria-label="Selecionar todos">
                      {allFilteredSelected ? <CheckSquare className="w-4 h-4 text-neon-cyan" />
                        : someFilteredSelected ? <ChevronDown className="w-4 h-4 text-white/40" />
                        : <Square className="w-4 h-4 text-white/20 hover:text-white/40" />}
                    </button>
                  </th>
                  <th className="text-left py-3 pr-4">Produto</th>
                  <th className="text-left py-3 pr-4 hidden sm:table-cell">Categoria</th>
                  <th className="text-left py-3 pr-4">Validade</th>
                  <th className="text-center py-3 pr-4">Qtd</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-right py-3 pr-4">A\u00e7\u00e3o</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = getStatus(p.expiryDate)
                  const isSelected = selected.has(p.id)
                  return (
                    <tr key={p.id} onClick={() => toggleSelect(p.id)}
                      className={`border-t border-white/[0.04] text-white/60 transition-colors cursor-pointer ${
                        isSelected ? "bg-neon-cyan/[0.03]" : "hover:bg-white/[0.02]"
                      }`}>
                      <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(p.id)} className="p-1" aria-label="Selecionar">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-neon-cyan" /> : <Square className="w-4 h-4 text-white/20 hover:text-white/40" />}
                        </button>
                      </td>
                      <td className="py-3 pr-4 font-medium text-white/80">{p.nome}</td>
                      <td className="py-3 pr-4 hidden sm:table-cell text-white/30">{p.categoria}</td>
                      <td className="py-3 pr-4 text-white/40 text-[13px]">{new Date(p.expiryDate).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 pr-4 text-center text-white/40">{p.quantidade}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-mono inline-flex items-center gap-1 ${st.color}`}>
                          <st.icon className="w-3 h-3" /> {st.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-neon-cyan transition-all">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(p.id, p.nome)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-red-400 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-3 rounded-2xl border border-neon-cyan/20 flex items-center gap-3 shadow-2xl shadow-neon-cyan/5">
            <span className="text-xs text-white/60 font-mono">{selected.size} selecionado(s)</span>
            <div className="w-px h-5 bg-white/[0.06]" />
            <select value={batchCat} onChange={(e) => setBatchCat(e.target.value)}
              className="input-neon !bg-dark-900 text-xs py-1.5 px-2 w-32">
              <option value="">Mover para...</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={batchUpdateCategory} disabled={!batchCat}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/20 transition-colors disabled:opacity-30">
              <Layers className="w-3 h-3" /> Alterar
            </button>
            <div className="w-px h-5 bg-white/[0.06]" />
            <button onClick={batchDelete}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3 h-3" /> Excluir
            </button>
            <div className="w-px h-5 bg-white/[0.06]" />
            <button onClick={clearSelection} className="text-xs text-white/20 hover:text-white/50 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
