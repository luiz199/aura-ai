"use client"

import { Toaster } from "react-hot-toast"
import { AppProvider } from "@/context/AppContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(10, 11, 30, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
          },
          duration: 3000,
        }}
      />
    </AppProvider>
  )
}
