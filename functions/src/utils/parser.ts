import { addHours, addMinutes, getMonth, getYear } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { findMembers } from '../data'
import { Activity, Schedule, Timeline } from '../models'

export const parseFullMessage = (message: string): string[] => {
  const messages: string[] = []

  const reg = /(\d+)\/(\d+)[(（].[）)]\s*\n/g
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
    years++
  }

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

  const groupMembers = findMembers({ groupIds: [groupId] })

  const activities: Activity[] = []
  // eslint-disable-next-line no-irregular-whitespace
  const reg = /(\d+):(\d+)-?\s?([ぁ-んァ-ヶ/]+)(?:[\s　]*[(（](.+)[）)])?(?:\n?＊([^\n\s]+))?/g
  for (;;) {
    const match = reg.exec(message)
    if (!match) {
      break
    }

    const hours = Number(match[1])
    const minutes = Number(match[2])
    const title = match[3]
    const description1 = match[4]
    const description2 = match[5]

    const m = `${title}/${description1}/${description2}`.match(
      /([ぁ-ん]+|[ァ-ヶ]+)/g
    )
    const names = (m ? Array.from(m) : []).reduce((carry, name) => {
      const replaced = name.replace(/(さん|コラボ)/g, '')
      return replaced.length > 1 ? [...carry, replaced] : carry
    }, [] as string[])

    for (const name of names) {
      const trimmed = name.replace(/(さん|コラボ)/g, '')
      const member = groupMembers.find((member) => member.nameJa.match(trimmed))
      if (!member) {
        continue
      }

      const memberId = member.id
      let description = description1 ?? ''
      if (description && description2) {
        description += `(${description2})` ?? ''
      }
      const startedAt = addMinutes(addHours(date, hours), minutes)

      activities.push({
        memberId,
        title: '',
        description,
        startedAt,
        sourceGroupId: groupId,
        twitterTimelineId: '',
        youtubeVideoId: '',
      })
    }
  }

  return {
    scheduledAt: date,
    activities,
  }
}

export const parse = (timeline: Timeline, groupId: string): Schedule[] => {
  const publishedAt = new Date(timeline.createdAt)
  const messages = parseFullMessage(timeline.fullText)
  return messages.reduce((carry, message) => {
    const schedule = parseMessage(message, groupId)
    return schedule
      ? [
          ...carry,
          {
            ...schedule,
            publishedAt,
            activities: schedule.activities.map((activity) => ({
              ...activity,
              twitterTimelineId: timeline.id,
            })),
          },
        ]
      : carry
  }, [] as Schedule[])
}
