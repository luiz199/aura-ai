"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getTranslations, type Translations } from "@/i18n"

type Theme = "dark" | "light" | "matrix" | "royal"

interface AuthUser {
  id: string
  nome: string
  email: string
  tipo: string
  preferences?: {
    theme?: Theme
    language?: string
    notifications?: boolean
  }
}

interface AppContextType {
  user: AuthUser | null
  loading: boolean
  theme: Theme
  locale: string
  t: Translations
  login: (email: string, password: string) => Promise<void>
  register: (nome: string, email: string, password: string) => Promise<void>
  logout: () => void
  setTheme: (t: Theme) => void
  setLocale: (l: string) => void
  updatePreferences: (prefs: Record<string, any>) => Promise<void>
}

const AppContext = createContext<AppContextType>({} as AppContextType)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setThemeState] = useState<Theme>("dark")
  const [locale, setLocaleState] = useState("pt-BR")
  const [t, setT] = useState<Translations>(getTranslations("pt-BR"))

  const token = typeof window !== "undefined" ? localStorage.getItem("aura_token") : null

  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setUser(data)
            if (data.preferences?.theme) setThemeState(data.preferences.theme)
            if (data.preferences?.language) setLocaleState(data.preferences.language)
          } else {
            localStorage.removeItem("aura_token")
          }
        })
        .catch(() => localStorage.removeItem("aura_token"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setT(getTranslations(locale))
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem("aura_theme", theme)
  }, [theme])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem("aura_token", data.token)
    setUser(data.user)
    if (data.user.preferences?.theme) setThemeState(data.user.preferences.theme)
    if (data.user.preferences?.language) setLocaleState(data.user.preferences.language)
  }, [])

  const register = useCallback(async (nome: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem("aura_token", data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    const token = localStorage.getItem("aura_token")
    if (token) {
      fetch("/api/auth/session", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    }
    localStorage.removeItem("aura_token")
    setUser(null)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    if (user) {
      fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("aura_token")}` },
        body: JSON.stringify({ preferences: { ...user.preferences, theme: t } }),
      }).catch(() => {})
    }
  }, [user])

  const setLocale = useCallback((l: string) => {
    setLocaleState(l)
    localStorage.setItem("aura_locale", l)
    if (user) {
      fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("aura_token")}` },
        body: JSON.stringify({ preferences: { ...user.preferences, language: l } }),
      }).catch(() => {})
    }
  }, [user])

  const updatePreferences = useCallback(async (prefs: Record<string, any>) => {
    const token = localStorage.getItem("aura_token")
    if (!token) return
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ preferences: prefs }),
    })
    if (res.ok) {
      setUser((prev) => prev ? { ...prev, preferences: { ...prev.preferences, ...prefs } } : prev)
    }
  }, [])

  return (
    <AppContext.Provider value={{ user, loading, theme, locale, t, login, register, logout, setTheme, setLocale, updatePreferences }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
