import {
  addHours,
  addMinutes,
  getMonth,
  getYear,
} from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

type Event = {
  ownerId: string
  title: string
  startedAt: Date
}

const Owner = {
  はねる: 'haneru-inaba',
  いちか: 'ichika-souya',
  らん: 'ran-hinokuma',
  くく: 'kuku-kazami',
  いづみ: 'izumi-yunohara',
  パトラ: 'patra-suou',
  シャル: 'charlotte-shimamura',
  ミコ: 'mico-sekishiro',
  メアリ: 'mary-saionji',
}

export const parseFullMessage = (message: string): string[] => {
  const messages: string[] = []

  const reg = /(\d+)\/(\d+)[(（].[）)]/g
  let index = 0
  for (let i = 0; i < 10; i++) {
    const match = reg.exec(message)
    if (!match) {
      if (index > 0) {
        messages.push(message.slice(index))
      }
      break
    }

    if (index > 0) {
      messages.push(message.slice(index, match.index))
    }

    index = match.index
  }

  return messages
}

export const extractDate = (message: string): Date | undefined => {
  const reg = /(\d+)\/(\d+)[(（].[）)]/g
  const match = reg.exec(message)
  if (!match) {
    return undefined
  }

  const months = Number(match[1]) - 1
  const days = Number(match[2])

  const d = utcToZonedTime(new Date(), 'Asia/Tokyo')
  let years = getYear(d)
  if (months < getMonth(d)) {
    years++ // increment year if it is December
  }

  // 0:00:00 UTC+9
  return utcToZonedTime(new Date(years, months, days), 'Asia/Tokyo')
}

export const parseMessage = (message: string): Event[] => {
  const date = extractDate(message)
  if (!date) {
    return []
  }

  const events: Event[] = []
  // eslint-disable-next-line no-irregular-whitespace
  const reg = /(\d+):(\d+)-?\s?([ぁ-んァ-ヶ]+)(?:[\s　]*[(（](.+)[）)])?(?:\n(＊[^\n\s]+))?/g
  for (;;) {
    const match = reg.exec(message)
    if (!match) {
      break
    }

    const hours = Number(match[1])
    const minutes = Number(match[2])
    const member = match[3]
    const description1 = match[4]
    const description2 = match[5]

    const ownerId = Owner[member as keyof typeof Owner] ?? ''
    let title = ownerId ? '' : member
    title += description1 ?? ''
    if (title) {
      title += description2 ?? ''
    }

    const startedAt = addMinutes(addHours(date, hours), minutes)

    events.push({
      // match: match[0],
      ownerId,
      title,
      startedAt,
    })
  }

  return events
}

export const parse = (message: string): Event[] => {
  const messages = parseFullMessage(message)
  return messages.reduce((carry, message) => {
    const events = parseMessage(message)
    return [...carry, ...events]
  }, [] as Event[])
}