import Sidebar from "@/components/Sidebar"
import ParticlesBackground from "@/components/ParticlesBackground"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ParticlesBackground />
      <Sidebar />
      <main className="flex-1 relative z-10 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
