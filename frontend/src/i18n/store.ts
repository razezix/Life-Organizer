import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'en' | 'ru'
export type Currency = 'KZT' | 'USD' | 'EUR' | 'RUB'

interface PrefsState {
  lang: Lang
  currency: Currency
  setLang: (l: Lang) => void
  setCurrency: (c: Currency) => void
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      lang: 'en',
      currency: 'KZT',
      setLang: (lang) => set({ lang }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'prefs' }
  )
)

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  KZT: '₸',
  USD: '$',
  EUR: '€',
  RUB: '₽',
}

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = amount.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return `${formatted} ${symbol}`
}
