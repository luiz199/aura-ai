"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/context/AppContext"
import { MessageSquareText, Users, Trash2, Shield, BarChart3, Download } from "lucide-react"
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton"
import toast from "react-hot-toast"

export default function AdminPage() {
  const { user } = useApp()
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("aura_token")
        const [uRes, sRes] = await Promise.all([
          fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (uRes.ok) setUsers(await uRes.json())
        if (sRes.ok) setStats(await sRes.json())
      } catch {} finally {
        setLoading(false)
      }
    })()
  }, [])

  const deleteUser = async (userId: string, nome: string) => {
    if (!confirm(`Excluir usu\u00e1rio "${nome}"?`)) return
    try {
      const token = localStorage.getItem("aura_token")
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        toast.success("Usu\u00e1rio exclu\u00eddo")
      } else {
        toast.error("Erro ao excluir")
      }
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  const exportUsers = () => {
    const header = "Nome,Email,Tipo,Data\n"
    const rows = users.map((u) => `"${u.nome}","${u.email}","${u.tipo}","${new Date(u.createdAt).toLocaleDateString("pt-BR")}"`).join("\n")
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `usuarios-${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success("Usu\u00e1rios exportados!")
  }

  if (user?.tipo !== "admin") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-12 h-12 text-neon-pink/50 mx-auto mb-3" />
          <p className="text-white/50">Acesso restrito a administradores.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient tracking-tight">Admin</h1>
          <p className="text-sm text-white/30 mt-1">Gerenciamento do sistema</p>
        </div>
        <button onClick={exportUsers} className="btn-neon text-xs px-4 py-2">
          <Download className="w-3 h-3" /> Exportar CSV
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-4 border-l-2 border-neon-cyan/20">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-transparent inline-block mb-3">
              <Users className="w-4 h-4 text-white/70" />
            </div>
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-white/30">Total de Usu\u00e1rios</p>
          </div>
          <div className="glass-card p-4 border-l-2 border-neon-purple/20">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-purple/20 to-transparent inline-block mb-3">
              <MessageSquareText className="w-4 h-4 text-white/70" />
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalConversas || 0}</p>
            <p className="text-xs text-white/30">Total de Conversas</p>
          </div>
          <div className="glass-card p-4 border-l-2 border-neon-green/20">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-green/20 to-transparent inline-block mb-3">
              <BarChart3 className="w-4 h-4 text-white/70" />
            </div>
            <p className="text-2xl font-bold text-white">{users.filter((u) => u.tipo === "admin").length}</p>
            <p className="text-xs text-white/30">Administradores</p>
          </div>
          <div className="glass-card p-4 border-l-2 border-neon-cyan/20">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-transparent inline-block mb-3">
              <Users className="w-4 h-4 text-white/70" />
            </div>
            <p className="text-2xl font-bold text-white">{users.filter((u) => u.tipo !== "admin").length}</p>
            <p className="text-xs text-white/30">Usu\u00e1rios Comuns</p>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Usu\u00e1rios</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-white/30 uppercase tracking-wider font-mono">
                  <th className="text-left py-2 pr-4">Nome</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">Email</th>
                  <th className="text-left py-2 pr-4">Tipo</th>
                  <th className="text-left py-2 pr-4 hidden md:table-cell">Data</th>
                  <th className="text-right py-2">A\u00e7\u00e3o</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-t border-white/[0.04] text-white/60 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">{u.nome}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell text-white/30">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full font-mono",
                        u.tipo === "admin" ? "bg-neon-pink/10 text-neon-pink" : "bg-neon-cyan/10 text-neon-cyan",
                      )}>{u.tipo}</span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell text-white/20 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 text-right">
                      {u.tipo !== "admin" && (
                        <button onClick={() => deleteUser(u.id, u.nome)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.04] text-white/20 hover:text-neon-pink transition-all"
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(" ") }
