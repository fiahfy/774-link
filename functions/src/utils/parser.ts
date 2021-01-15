import { addHours, addMinutes, getMonth, getYear } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import members from '774-link/src/data/members.json'
import { Event, Member, Schedule, Timeline } from '../models'

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

  const jst = utcToZonedTime(new Date(), 'Asia/Tokyo')
  let years = getYear(jst)
  if (months < getMonth(jst)) {
    years++ // increment year if it is December
  }

  // 0:00:00 UTC+9
  return zonedTimeToUtc(new Date(years, months, days), 'Asia/Tokyo')
}

export const parseMessage = (
  message: string,
  groupId: string
): Omit<Schedule, 'publishedAt'> | undefined => {
  const date = extractDate(message)
  if (!date) {
    return undefined
  }

  const filterMembers = Object.entries(members).reduce(
    (carry, [id, member]) =>
      member.groupId === groupId ? [...carry, { ...member, id }] : carry,
    [] as (Member & { id: string })[]
  )

  const events: Event[] = []
  // eslint-disable-next-line no-irregular-whitespace
  const reg = /(\d+):(\d+)-?\s?([ぁ-んァ-ヶ/]+)(?:[\s　]*[(（](.+)[）)])?(?:\n?＊([^\n\s]+))?/g
  for (;;) {
    const match = reg.exec(message)
    if (!match) {
      break
    }

    const hours = Number(match[1])
    const minutes = Number(match[2])
    const names = match[3].replace('コラボ', '').split('/')
    const description1 = match[4]
    const description2 = match[5]

    for (const name of names) {
      const member = filterMembers.find((member) => member.nameJa.match(name))
      if (!member) {
        continue
      }

      const ownerId = member.id
      let title = description1 ?? ''
      if (title && description2) {
        title += `(${description2})` ?? ''
      }
      const startedAt = addMinutes(addHours(date, hours), minutes)

      events.push({
        groupId,
        ownerId,
        title,
        startedAt,
      })
    }
  }

  return {
    date,
    events,
  }
}

export const parse = (timeline: Timeline, groupId: string): Schedule[] => {
  const publishedAt = new Date(timeline.createdAt)
  const messages = parseFullMessage(timeline.fullText)
  return messages.reduce((carry, message) => {
    const result = parseMessage(message, groupId)
    return result ? [...carry, { ...result, publishedAt }] : carry
  }, [] as Schedule[])
}
