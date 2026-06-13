import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-dark-900">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-xl text-white/80 mb-2">P\u00e1gina n\u00e3o encontrada</h1>
        <p className="text-sm text-white/30 mb-8">A p\u00e1gina que voc\u00ea procura n\u00e3o existe ou foi movida.</p>
        <Link href="/dashboard" className="btn-neon inline-flex">Voltar ao Dashboard</Link>
      </div>
    </div>
  )
}
