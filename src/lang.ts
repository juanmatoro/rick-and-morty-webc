export type Lang = 'es' | 'en'

const LANG_KEY = 'rick-lang'

export function getLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang) ?? 'es'
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang)
  window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }))
}
