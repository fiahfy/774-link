import { format as orgFormat, Locale } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'

const locales: { [lang: string]: Locale } = { enUS, ja }

export const format = (date: Date, format: string): string => {
  return orgFormat(date, format, {
    locale: locales[window.navigator.language] ?? enUS,
  })
}
