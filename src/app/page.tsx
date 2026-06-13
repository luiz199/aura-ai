"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  if (loading) {
    return <LoadingScreen onComplete={() => { router.push("/dashboard"); setLoading(false) }} />
  }

  return null
}
