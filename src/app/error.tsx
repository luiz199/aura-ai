"use client"

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-dark-900">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-bold text-gradient mb-4">Erro</div>
        <h1 className="text-xl text-white/80 mb-2">Algo deu errado</h1>
        <p className="text-sm text-white/30 mb-8">{error.message || "Ocorreu um erro inesperado."}</p>
        <button onClick={reset} className="btn-neon">Tentar novamente</button>
      </div>
    </div>
  )
}
