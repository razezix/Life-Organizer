import { usePrefs } from './store'
import { t as translate, type StringKey } from './strings'

export function useT() {
  const lang = usePrefs((s) => s.lang)
  return (key: StringKey) => translate(key, lang)
}
