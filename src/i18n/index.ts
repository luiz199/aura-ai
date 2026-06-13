import ptBR from "./pt-BR"
import enUS from "./en-US"
import es from "./es"
import type { Translations } from "./pt-BR"

const translations: Record<string, Translations> = {
  "pt-BR": ptBR,
  "en-US": enUS,
  es,
}

export function getTranslations(locale: string): Translations {
  return translations[locale] || ptBR
}

export type { Translations }
